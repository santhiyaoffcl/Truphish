import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShieldCheck, ShieldAlert, History as HistoryIcon, RefreshCw, 
  Globe, Info, CheckCircle2, AlertTriangle, Shield, Target, FileText, Zap, Terminal
} from 'lucide-react';
import api from '../utils/api';

function UrlScanner() {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [stepStates, setStepStates] = useState({
    dns: 'idle',
    ssl: 'idle',
    brand: 'idle',
    content: 'idle'
  });
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  
  const navigate = useNavigate();
  const consoleBottomRef = useRef(null);

  // Auto-scroll logs to bottom during active scans
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleScan = (e) => {
    e.preventDefault();
    if (!url) return;
    
    setScanning(true);
    setResult(null);
    setError('');
    setLogs([]);
    setActiveStep('init');
    setStepStates({
      dns: 'idle',
      ssl: 'idle',
      brand: 'idle',
      content: 'idle'
    });

    const token = localStorage.getItem('token');
    // Open standard EventSource stream
    const eventSource = new EventSource(
      `http://localhost:5000/api/scan/stream/url?url=${encodeURIComponent(url)}&token=${token}`
    );

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { step, status, message, data } = payload;
        
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);

        if (step === 'complete') {
          setResult(data);
          setStepStates({
            dns: 'success',
            ssl: 'success',
            brand: 'success',
            content: 'success'
          });
          setActiveStep('complete');
          setScanning(false);
          eventSource.close();
        } else if (step === 'init') {
          setActiveStep('init');
        } else {
          setActiveStep(step);
          setStepStates((prev) => ({
            ...prev,
            [step]: status // 'running', 'success', 'warning', 'danger'
          }));
        }
      } catch (err) {
        console.error('Error parsing SSE event data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err);
      setError('Connection to security threat intelligence agent was interrupted.');
      setScanning(false);
      eventSource.close();
    };
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
    setLogs([]);
    setActiveStep(null);
    setStepStates({
      dns: 'idle',
      ssl: 'idle',
      brand: 'idle',
      content: 'idle'
    });
  };

  const renderReport = (reportText) => {
    if (!reportText) return null;
    return reportText.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} style={{ marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx} style={{ marginLeft: '1.5rem', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{line.replace('- ', '')}</li>;
      }
      
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code style="background: var(--border); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');
      
      return <p key={idx} style={{ margin: '0.6rem 0', fontSize: '0.9rem', color: 'var(--text-main)' }} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  const statusColor = result ? getRiskColor(result.risk_score) : 'var(--accent)';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadein 0.4s' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="page-title">
          <h1>Threat Intelligence URL Analyzer</h1>
          <p>Deploy an autonomous cybersecurity agent to trace DNS, SSL, brand spoofing, and endpoint patterns in real time.</p>
        </div>
      </div>

      {/* URL Input Form */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <form onSubmit={handleScan} style={{ display: 'flex', gap: '1rem', margin: 0 }}>
           <div style={{ flex: 1, position: 'relative' }}>
              <Globe size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '1rem' }} />
              <input 
                type="text" 
                placeholder="Enter suspicious domain (e.g. paypal-login-verification.xyz or google.com)" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                required 
                disabled={scanning}
                style={{ paddingLeft: '3.25rem', margin: 0, height: '48px' }}
              />
           </div>
           <button type="submit" disabled={scanning || !url} style={{ height: '48px', padding: '0 2.25rem' }}>
              {scanning ? (
                <> <RefreshCw size={18} className="spin" /> Scanning Domain... </>
              ) : (
                <> <Search size={18} /> Inspect Link </>
              )}
           </button>
        </form>
        {error && <p className="error-text" style={{ marginTop: '1.25rem', color: 'var(--danger)', fontWeight: '600' }}>{error}</p>}
      </div>

      {/* Diagnostics Console (Active during scanning / after scan completion) */}
      {(scanning || logs.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Checkpoint list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Zap size={18} color="var(--accent)" fill="var(--accent)" /> Diagnostics Checklist
            </h3>
            
            {[
              { id: 'dns', label: 'DNS Authority Analysis', icon: Globe },
              { id: 'ssl', label: 'SSL Certificate Validation', icon: Shield },
              { id: 'brand', label: 'Brand Impersonation Scan', icon: Target },
              { id: 'content', label: 'Endpoint Keyword Heuristics', icon: FileText }
            ].map((step) => {
              const Icon = step.icon;
              const state = stepStates[step.id];
              let badgeColor = 'var(--text-muted)';
              let badgeIcon = <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--border)' }}></div>;
              
              if (state === 'success') {
                badgeColor = 'var(--success)';
                badgeIcon = <CheckCircle2 size={16} />;
              } else if (state === 'warning') {
                badgeColor = 'var(--warning)';
                badgeIcon = <AlertTriangle size={16} />;
              } else if (state === 'danger') {
                badgeColor = 'var(--danger)';
                badgeIcon = <ShieldAlert size={16} />;
              } else if (activeStep === step.id) {
                badgeColor = 'var(--accent)';
                badgeIcon = <RefreshCw size={14} className="spin" />;
              }
              
              const isCurrent = activeStep === step.id;

              return (
                <div key={step.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '0.85rem 1rem', 
                  borderRadius: '12px', 
                  background: isCurrent ? 'var(--accent-glow)' : 'rgba(255,255,255,0.1)', 
                  border: isCurrent ? '1px solid var(--accent)' : '1px solid var(--border)', 
                  boxShadow: isCurrent ? 'var(--shadow-md)' : 'none',
                  transition: 'all 0.3s ease' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} color={isCurrent ? 'var(--accent)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.85rem', fontWeight: isCurrent ? '700' : '500', color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {step.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: badgeColor }}>
                    {badgeIcon}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Shell Terminal */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              background: '#0a0f1d', 
              borderRadius: '16px', 
              border: '1px solid rgba(255,255,255,0.08)', 
              padding: '1.25rem', 
              fontFamily: 'monospace', 
              fontSize: '0.8rem', 
              color: '#38bdf8', 
              height: '240px', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden', 
              boxShadow: 'var(--shadow-md)' 
            }}>
              {/* Window Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.6rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Terminal size={12} /> threat-hunting-agent.sh
                </span>
                <div style={{ width: '38px' }}></div>
              </div>
              
              {/* Shell Stream Output */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '0.25rem' }}>
                {logs.map((log, index) => (
                  <div key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {log.includes('❌') || log.includes('🚨') || log.includes('danger') ? (
                      <span style={{ color: '#f87171' }}>{log}</span>
                    ) : log.includes('⚠️') || log.includes('warning') ? (
                      <span style={{ color: '#fbbf24' }}>{log}</span>
                    ) : log.includes('✅') || log.includes('🌐') || log.includes('success') ? (
                      <span style={{ color: '#34d399' }}>{log}</span>
                    ) : (
                      <span style={{ color: '#38bdf8' }}>{log}</span>
                    )}
                  </div>
                ))}
                {scanning && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                    <span>Running trace execution...</span>
                    <span className="blink" style={{ fontWeight: '800', color: '#fff' }}>█</span>
                  </div>
                )}
                <div ref={consoleBottomRef}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Finished Results Section */}
      {result && !scanning && (
        <div className="card" style={{ padding: '2rem', border: `1px solid ${statusColor}`, transition: 'all 0.3s ease', animation: 'fadein 0.4s' }}>
          
          {/* Severity & Verdict Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            <div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {result.risk_score >= 70 ? (
                    <span style={{ color: 'var(--danger)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800' }}>
                       <ShieldAlert size={32} /> THREAT: PHISHING INFECTED
                    </span>
                  ) : result.risk_score >= 30 ? (
                    <span style={{ color: 'var(--warning)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800' }}>
                       <AlertTriangle size={32} /> WARNING: SUSPICIOUS URL
                    </span>
                  ) : (
                    <span style={{ color: 'var(--success)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800' }}>
                       <ShieldCheck size={32} /> SECURE: NO THREATS FOUND
                    </span>
                  )}
               </div>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                 Agent Assessment: <strong style={{ color: statusColor }}>{result.risk_score}% Severity Level</strong>
               </p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="outline" onClick={resetScan}>
                  <RefreshCw size={16} /> Scan Another
                </button>
                <button className="outline" onClick={() => navigate('/history')}>
                  <HistoryIcon size={16} /> View Logs
                </button>
              </div>
            </div>
          </div>

          {/* Risk Level Bar */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
               <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Threat Severity Weight</span>
               <span style={{ fontSize: '0.9rem', fontWeight: '800', color: statusColor }}>{result.risk_score}%</span>
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

          {/* Diagnostic Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <button 
              className="outline" 
              onClick={() => setActiveTab('summary')}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                boxShadow: 'none', 
                borderRadius: 0, 
                color: activeTab === 'summary' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'summary' ? '2px solid var(--accent)' : '2px solid transparent',
                padding: '0.75rem 1.5rem',
                fontWeight: '700'
              }}
            >
              Scan Summary
            </button>
            <button 
              className="outline" 
              onClick={() => setActiveTab('report')}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                boxShadow: 'none', 
                borderRadius: 0, 
                color: activeTab === 'report' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'report' ? '2px solid var(--accent)' : '2px solid transparent',
                padding: '0.75rem 1.5rem',
                fontWeight: '700'
              }}
            >
              Security Briefing
            </button>
            <button 
              className="outline" 
              onClick={() => setActiveTab('diagnostics')}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                boxShadow: 'none', 
                borderRadius: 0, 
                color: activeTab === 'diagnostics' ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === 'diagnostics' ? '2px solid var(--accent)' : '2px solid transparent',
                padding: '0.75rem 1.5rem',
                fontWeight: '700'
              }}
            >
              Agent Terminal Stdout
            </button>
          </div>

          {/* Tab Contents */}
          <div style={{ minHeight: '180px' }}>
            {activeTab === 'summary' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    <Info size={18} color="var(--accent)" /> Why this result:
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {result.explanations && result.explanations.map((exp, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem' }}>
                         <CheckCircle2 size={18} color={statusColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                         <span style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>{exp}</span>
                      </div>
                    ))}
                    {(!result.explanations || result.explanations.length === 0) && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No explanation flags raised by the agent.</p>
                    )}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                   <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: '700' }}>Intelligence Metadata</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        <span>Target Host</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{url}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        <span>Threat Engine</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>PhishingAgent v3.0</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Analysis Timestamp</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{new Date().toLocaleString()}</span>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'report' && (
              <div style={{ background: 'var(--bg-color)', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border)', lineHeight: '1.6' }}>
                {renderReport(result.report)}
              </div>
            )}

            {activeTab === 'diagnostics' && (
              <div style={{ 
                background: '#0a0f1d', 
                borderRadius: '16px', 
                padding: '1.25rem', 
                fontFamily: 'monospace', 
                fontSize: '0.85rem', 
                color: '#34d399', 
                maxHeight: '300px', 
                overflowY: 'auto' 
              }}>
                {result.logs && result.logs.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: '0.4rem' }}>
                    <span style={{ color: '#94a3b8' }}>[{idx + 1}]</span> {log}
                  </div>
                ))}
                {(!result.logs || result.logs.length === 0) && (
                  <p style={{ color: '#94a3b8' }}>No low-level execution logs available.</p>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default UrlScanner;
