import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShieldCheck, ShieldAlert, History as HistoryIcon, RefreshCw, 
  Globe, Info, CheckCircle2, AlertTriangle, Shield 
} from 'lucide-react';
import api from '../utils/api';

function UrlScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setResult(null);
    setError('');
    
    try {
      const res = await api.post('/scan/url', { url });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Scanning failed. Make sure ML service is running.');
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
    setUrl('');
    setError('');
  };

  const statusColor = result ? getRiskColor(result.risk_score) : 'var(--accent)';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>URL Scanner</h1>
          <p>Analyze any web link for phishing patterns and malicious intent.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleScan} style={{ display: 'flex', gap: '1rem' }}>
           <div style={{ flex: 1, position: 'relative' }}>
              <Globe size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
              <input 
                type="text" 
                placeholder="https://example.com/login" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                required 
                disabled={loading}
                style={{ paddingLeft: '3rem', margin: 0 }}
              />
           </div>
           <button type="submit" disabled={loading} style={{ height: '48px', padding: '0 2rem' }}>
              {loading ? (
                <> <RefreshCw size={18} className="spin" /> Analyzing... </>
              ) : (
                <> <Search size={18} /> Scan URL </>
              )}
           </button>
        </form>
        {error && <p className="error-text" style={{ marginTop: '1rem' }}>{error}</p>}
      </div>

      {result && (
        <div className="card" style={{ padding: '2rem', border: `1px solid ${statusColor}`, transition: 'all 0.3s ease', animation: 'fadein 0.4s' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {result.risk_score >= 70 ? (
                    <span style={{ color: 'var(--danger)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                       <ShieldAlert size={32} /> PHISHING DETECTED
                    </span>
                  ) : result.risk_score >= 30 ? (
                    <span style={{ color: 'var(--warning)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                       <AlertTriangle size={32} /> SUSPICIOUS URL
                    </span>
                  ) : (
                    <span style={{ color: 'var(--success)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                       <ShieldCheck size={32} /> URL SECURE
                    </span>
                  )}
               </div>
               <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                 Risk Assessment: <strong style={{ color: statusColor }}>{result.risk_score}% Severity</strong>
               </p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="outline" onClick={resetScan}>
                  <RefreshCw size={18} /> New Scan
                </button>
                <button className="outline" onClick={() => navigate('/history')}>
                  <HistoryIcon size={18} /> History
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
               <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Threat Severity</span>
               <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{result.risk_score}%</span>
            </div>
            <div style={{ height: '12px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
               <div style={{ 
                 height: '100%', 
                 width: `${result.risk_score}%`, 
                 backgroundColor: statusColor,
                 transition: 'width 1s ease-out'
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
               <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Scan Details</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Scan Timestamp</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ML Environment</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>Production v2.1</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Scan Latency</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{result.latency_ms || '0'} ms</span>
                 </div>
               </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default UrlScanner;
