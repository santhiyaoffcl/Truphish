import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ArrowRight, Activity, Cpu, 
  Terminal, Sun, Moon, AlertTriangle, Shield, CheckCircle, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  // Sandbox URL scan state variables
  const [sandboxUrl, setSandboxUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [scanResult, setScanResult] = useState(null);

  const mockUrlsData = {
    safe: {
      status: 'SAFE',
      score: 4,
      class: 'safe',
      explanations: [
        'Domain registered over 10 years ago (High Reputation)',
        'Lexical entropy aligns with benign domain standard templates',
        'Valid TLS/SSL security certificate issued by trusted CA'
      ]
    },
    phish: {
      status: 'MALICIOUS',
      score: 94,
      class: 'danger',
      explanations: [
        'Contains suspicious brand-mimic keyword',
        'Lexical pattern similarity to known credential-harvesting phishing templates',
        'Unusually high domain entropy and recent registration age'
      ]
    },
    suspect: {
      status: 'SUSPICIOUS',
      score: 64,
      class: 'warning',
      explanations: [
        'Domain registered recently (under 30 days)',
        'SSL certificate uses a free/automated certificate authority',
        'No historical traffic footprint detected'
      ]
    }
  };

  const handleSandboxScan = (e) => {
    e.preventDefault();
    if (!sandboxUrl.trim()) return;

    setIsScanning(true);
    setScanResult(null);
    
    const steps = [
      'Establishing connection to prediction engine...',
      'Deconstructing lexical features of domain...',
      'Querying machine learning vector classifiers...',
      'Synthesizing security risk ledger report...'
    ];

    let currentStep = 0;
    setScanStep(steps[0]);

    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setScanStep(steps[currentStep]);
      } else {
        clearInterval(stepInterval);
        
        // Determine type of result
        const urlLower = sandboxUrl.toLowerCase();
        let selectedResult = mockUrlsData.suspect;
        if (
          urlLower.includes('google') || 
          urlLower.includes('github') || 
          urlLower.includes('wikipedia') || 
          urlLower.includes('.gov') || 
          urlLower.includes('microsoft') ||
          urlLower.includes('safe')
        ) {
          selectedResult = mockUrlsData.safe;
        } else if (
          urlLower.includes('pay') || 
          urlLower.includes('login') || 
          urlLower.includes('bank') || 
          urlLower.includes('secure') || 
          urlLower.includes('phish') ||
          urlLower.includes('verify') ||
          urlLower.includes('update')
        ) {
          selectedResult = mockUrlsData.phish;
        }

        setScanResult(selectedResult);
        setIsScanning(false);
        setScanStep('');
      }
    }, 600);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <header style={{ 
        height: '80px', 
        borderBottom: '1px solid var(--border)', 
        backgroundColor: 'var(--panel-bg)', 
        backdropFilter: 'blur(20px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 4rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div className="user-avatar" style={{ width: '38px', height: '38px', borderRadius: '10px' }}>
            <ShieldCheck size={22} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--text-main) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TruPhish
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme" style={{ border: 'none', padding: '0.6rem' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          {user ? (
            <button onClick={() => navigate('/dashboard')} style={{ padding: '0.65rem 1.25rem', borderRadius: '12px' }}>
              Launch Console <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={() => navigate('/login')} style={{ padding: '0.65rem 1.25rem', borderRadius: '12px' }}>
              Access App
            </button>
          )}
        </div>
      </header>

      {/* Main Home Content */}
      <main style={{ flex: 1, padding: '3rem 4rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        
        {/* Hero Section */}
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.1fr 1fr', 
          gap: '4rem', 
          alignItems: 'center', 
          marginBottom: '5rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <span className="badge accent" style={{ marginBottom: '1.5rem' }}>AI Threat Prevention</span>
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '800', 
              lineHeight: '1.15', 
              letterSpacing: '-0.03em', 
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, var(--text-main) 0%, var(--accent-dark) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Shielding Networks Against Phishing Attacks
            </h1>
            <p style={{ 
              color: 'var(--text-muted)', 
              fontSize: '1.15rem', 
              lineHeight: '1.6', 
              marginBottom: '2.5rem', 
              fontWeight: '500' 
            }}>
              TruPhish integrates real-time lexical scanners, heuristic evaluation vectors, and machine learning models to detect malicious domains and phishing emails before they compromise your data.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
              >
                Access Threat Console <ArrowRight size={18} />
              </button>
              <a 
                href="#sandbox" 
                className="nav-item outline" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '0.9rem 2rem', 
                  borderRadius: '28px',
                  fontWeight: '600',
                  boxShadow: 'var(--shadow-sm)',
                  backgroundColor: 'var(--glass-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Try Sandbox Scan
              </a>
            </div>
          </div>

          {/* Hero Right: Interactive Sandbox Scanner */}
          <div id="sandbox" className="card" style={{ padding: '2.5rem', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Interactive Scan Sandbox</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>Paste any domain below to see our ML heuristics parser in action.</p>

            <form onSubmit={handleSandboxScan} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Terminal size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1.1rem', top: '1.15rem' }} />
                <input 
                  type="text" 
                  placeholder="e.g. secure-payment-verification.com" 
                  value={sandboxUrl} 
                  onChange={e => setSandboxUrl(e.target.value)}
                  style={{ paddingLeft: '2.8rem', marginBottom: 0 }}
                  required
                  disabled={isScanning}
                />
              </div>
              <button type="submit" disabled={isScanning} style={{ padding: '0 1.5rem', borderRadius: '16px' }}>
                Analyze URL
              </button>
            </form>

            {/* Scan Loader */}
            {isScanning && (
              <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'fadein 0.3s' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '3px solid var(--border)', 
                  borderTopColor: 'var(--accent)', 
                  borderRadius: '50%', 
                  margin: '0 auto 1rem'
                }} className="spin" />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>{scanStep}</p>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && !isScanning && (
              <div style={{ animation: 'fadein 0.4s' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingBottom: '1rem', 
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Result Classification</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {scanResult.class === 'safe' && <CheckCircle size={18} color="var(--success)" />}
                      {scanResult.class === 'danger' && <AlertTriangle size={18} color="var(--danger)" />}
                      {scanResult.class === 'warning' && <HelpCircle size={18} color="var(--warning)" />}
                      <span style={{ fontWeight: '800', fontSize: '1.1rem' }} className={`badge ${scanResult.class}`}>
                        {scanResult.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>RISK SCORE</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: scanResult.class === 'safe' ? 'var(--success)' : scanResult.class === 'danger' ? 'var(--danger)' : 'var(--warning)' }}>
                      {scanResult.score}/100
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Threat Ledger Findings</h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {scanResult.explanations.map((exp, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{exp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section style={{ marginBottom: '5rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '800', marginBottom: '3rem' }}>Platform Features</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '2.5rem' 
          }}>
            <div className="card" style={{ padding: '2.5rem' }}>
              <div style={{ 
                backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--accent)',
                marginBottom: '1.5rem' 
              }}>
                <Cpu size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem' }}>Lexical Threat Vectors</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Deconstruct domain strings instantly. We evaluate character entropy, host sequences, brand spoofing profiles, and registrar metadata logs.
              </p>
            </div>

            <div className="card" style={{ padding: '2.5rem' }}>
              <div style={{ 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--success)',
                marginBottom: '1.5rem' 
              }}>
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem' }}>Zero-Day Content Analysis</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Paste email blocks, message bodies, or raw text fragments to identify deceptive language structures, urgency spikes, and phish-themed cues.
              </p>
            </div>

            <div className="card" style={{ padding: '2.5rem' }}>
              <div style={{ 
                backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--warning)',
                marginBottom: '1.5rem' 
              }}>
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem' }}>Audit Logs & Metrics</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Maintain an intelligence ledger tracking previous queries, latency timelines, and false-positive flags with customizable data controls.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border)', 
        backgroundColor: 'var(--panel-bg)', 
        padding: '2.5rem 4rem', 
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          TruPhish Security Intelligence Engine &copy; 2026. Powered by Advanced Agentic Coding.
        </p>
      </footer>
    </div>
  );
};

export default Home;
