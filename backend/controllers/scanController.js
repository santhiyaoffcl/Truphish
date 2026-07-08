const db = require('../config/db');
const axios = require('axios');

exports.scanUrl = async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    await processScan(req.user.id, url, 'url', res);
};

exports.scanText = async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    await processScan(req.user.id, text, 'text', res);
};

async function processScan(userId, input, type, res) {
    const startTime = Date.now();
    let scanResult = {
        risk_score: 0,
        prediction: 'unknown',
        explanations: '[]',
        status: 'failed'
    };

    try {
        // Call ML Service with timeout (3s = 3000ms)
        const endpoint = type === 'url' ? '/scan/url' : '/scan/text';
        const payload = type === 'url' ? { url: input } : { text: input };
        
        const response = await axios.post(`${process.env.ML_API_URL}${endpoint}`, payload, {
            timeout: 3000
        });

        if (response.data) {
            scanResult.risk_score = response.data.risk_score;
            scanResult.prediction = response.data.prediction;
            scanResult.explanations = JSON.stringify(response.data.explanations || []);
            scanResult.status = 'success';
        }
    } catch (error) {
        console.error('ML Service Error:', error.message);
        // Do not crash, keep status as failed and return safe fallback or just error indicator
    }

    const latency_ms = Date.now() - startTime;

    try {
        // Save to DB
        const [result] = await db.query(
            `INSERT INTO scan_history 
            (user_id, input, type, risk_score, prediction, explanations, source, status, latency_ms) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, input, type, scanResult.risk_score, scanResult.prediction, scanResult.explanations, 'web', scanResult.status, latency_ms]
        );

        res.json({
            id: result.insertId,
            input,
            type,
            risk_score: scanResult.risk_score,
            prediction: scanResult.prediction,
            explanations: JSON.parse(scanResult.explanations),
            status: scanResult.status,
            latency_ms
        });
    } catch (dbError) {
        console.error('Database Error:', dbError);
        res.status(500).json({ message: 'Error saving scan history' });
    }
}

exports.getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        // Only search input text
        const searchQuery = `%${search}%`;

        const [history] = await db.query(
            `SELECT id, input, type, risk_score, prediction, explanations, source, status, latency_ms, created_at
             FROM scan_history 
             WHERE user_id = ? AND input LIKE ?
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [req.user.id, searchQuery, limit, offset]
        );

        const [totalCountResult] = await db.query(
            `SELECT COUNT(id) AS total 
             FROM scan_history 
             WHERE user_id = ? AND input LIKE ?`,
            [req.user.id, searchQuery]
        );
        const total = totalCountResult[0].total;

        // Parse JSON explanations string back to array before sending
        const formattedHistory = history.map(item => ({
            ...item,
            explanations: item.explanations || []
        }));

        res.json({
            data: formattedHistory,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ message: 'Server error retrieving history' });
    }
};

exports.clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query('DELETE FROM scan_history WHERE user_id = ?', [userId]);
    res.json({ message: 'Scan history successfully cleared', success: true });
  } catch (error) {
    console.error("Clear history error:", error);
    res.status(500).json({ message: "Server error clearing history" });
  }
};

async function processStream(req, res, input, type) {
    const startTime = Date.now();
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    try {
        const endpoint = type === 'url' ? '/scan/url/stream' : '/scan/text/stream';
        const queryParam = type === 'url' ? 'url' : 'text';
        
        const response = await axios({
            method: 'get',
            url: `${process.env.ML_API_URL}${endpoint}?${queryParam}=${encodeURIComponent(input)}`,
            responseType: 'stream',
            timeout: 10000
        });

        let responseBuffer = '';
        response.data.on('data', (chunk) => {
            responseBuffer += chunk.toString();
            res.write(chunk);
        });

        response.data.on('end', async () => {
            try {
                const lines = responseBuffer.split('\n');
                let finalResult = null;
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const rawJson = line.substring(6).trim();
                        try {
                            const parsed = JSON.parse(rawJson);
                            if (parsed.step === 'complete') {
                                finalResult = parsed.data;
                                break;
                            }
                        } catch (e) {
                            // Ignored
                        }
                    }
                }

                if (finalResult) {
                    const latency_ms = Date.now() - startTime;
                    await db.query(
                        `INSERT INTO scan_history 
                        (user_id, input, type, risk_score, prediction, explanations, source, status, latency_ms) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            req.user.id,
                            input,
                            type,
                            finalResult.risk_score,
                            finalResult.prediction,
                            JSON.stringify(finalResult.explanations || []),
                            'web',
                            'success',
                            latency_ms
                        ]
                    );
                }
            } catch (dbError) {
                console.error('Database insertion error for stream:', dbError);
            } finally {
                res.end();
            }
        });

        response.data.on('error', (err) => {
            console.error('Response data error in SSE stream:', err);
            res.end();
        });

    } catch (error) {
        console.error('ML Streaming Error:', error.message);
        res.write(`data: ${JSON.stringify({ step: 'complete', status: 'danger', message: 'Failed to establish agent thread stream.', data: { risk_score: 50, prediction: 'unknown', explanations: ['ML Stream API connectivity failure.'], report: 'Analysis interrupted.', logs: [] } })}\n\n`);
        res.end();
    }
}

exports.streamUrl = async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: 'URL is required' });
    await processStream(req, res, url, 'url');
};

exports.streamText = async (req, res) => {
    const { text } = req.query;
    if (!text) return res.status(400).json({ message: 'Text is required' });
    await processStream(req, res, text, 'text');
};
