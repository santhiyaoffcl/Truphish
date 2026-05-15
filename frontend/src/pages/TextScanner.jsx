import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShieldCheck, ShieldAlert, History as HistoryIcon, RefreshCw, 
  FileText, Info, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import api from '../utils/api';

function TextScanner() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!text) return;
    
    setLoading(true);
    setResult(null);
    setError('');
    
    try {
      const res = await api.post('/scan/text', { text });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Scanning failed.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'var(--danger)'; 
    if (score >= 30) return 'var(--warning)';
    return 'var(--success)';
  };

  const resetScan = () => {
    setResult(null);
    setText('');
    setError('');
  };

  const statusColor = result ? getRiskColor(result.risk_score) : 'var(--accent)';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>Text Scanner</h1>
          <p>Analyze emails, SMS, or suspicious messages for phishing attempts.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleScan}>
           <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <FileText size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
              <textarea 
                placeholder="Paste the suspicious email contents here..." 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                required 
                disabled={loading}
                style={{ height: '150px', paddingLeft: '3rem', paddingTop: '1rem' }}
              />
           </div>
           <button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? (
                <> <RefreshCw size={18} className="spin" /> Analyzing Content... </>
              ) : (
                <> <Search size={18} /> Deep Social Engineering Scan </>
              )}
           </button>
        </form>
        {error && <p className="error-text" style={{ marginTop: '1rem' }}>{error}</p>}
      </div>

      {result && (
        <div className="card" style={{ padding: '2rem', border: `1px solid ${statusColor}`, animation: 'fadein 0.4s' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {result.risk_score >= 70 ? (
                    <span style={{ color: 'var(--danger)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                       <ShieldAlert size={32} /> THREAT DETECTED
                    </span>
                  ) : result.risk_score >= 30 ? (
                    <span style={{ color: 'var(--warning)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                       <AlertTriangle size={32} /> SUSPICIOUS CONTENT
                    </span>
                  ) : (
                    <span style={{ color: 'var(--success)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                       <ShieldCheck size={32} /> CONTENT SECURE
                    </span>
                  )}
               </div>
               <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                 Social Engineering Severity: <strong style={{ color: statusColor }}>{result.risk_score}%</strong>
               </p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="outline" onClick={resetScan}>
                   New Scan
                </button>
                <button className="outline" onClick={() => navigate('/history')}>
                  History
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
               <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Analysis Confidence</span>
               <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{result.risk_score}%</span>
            </div>
            <div style={{ height: '12px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
               <div style={{ 
                 height: '100%', 
                 width: `${result.risk_score}%`, 
                 backgroundColor: statusColor,
                 transition: 'width 1.2s ease-out'
               }}></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={18} color="var(--accent)" /> Why this result:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.explanations && result.explanations.map((exp, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem' }}>
                     <CheckCircle2 size={18} color={statusColor} style={{ flexShrink: 0 }} />
                     <span>{exp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Content Metadata</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Analyzed characters</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{text.length} chars</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ML Engine</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>Heuristic v1.2</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Timestamp</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{new Date().toLocaleTimeString()}</span>
                 </div>
               </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default TextScanner;
