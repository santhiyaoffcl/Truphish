import { useState, useEffect } from 'react';
import { User, Shield, Sliders, Bell, Database, Palette, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [saveStatus, setSaveStatus] = useState('');
  const { user, logout, updateUser, theme, toggleTheme } = useAuth();

  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || user.email.split('@')[0]);
    }
  }, [user]);

  const [prefs, setPresets] = useState(() => {
    const saved = localStorage.getItem('truphish_prefs');
    return saved ? JSON.parse(saved) : { strictMode: false, defaultType: 'url', emailAlerts: true, weeklyReports: false };
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving Profile...');
    try {
      const res = await api.put('/auth/profile', { username });
      updateUser(res.data.user);
      setSaveStatus('Profile updated successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('Failed to update profile');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleSaveMock = (e) => {
    e?.preventDefault();
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus('Saved successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 800);
  };

  const handleSavePrefs = (newPrefs) => {
    setPresets(newPrefs);
    localStorage.setItem('truphish_prefs', JSON.stringify(newPrefs));
    handleSaveMock();
  };

  const handleClearHistory = async () => {
    if(!window.confirm("Are you sure you want to permanently delete all scan history? This cannot be undone.")) return;
    try {
      setSaveStatus('Wiping database...');
      await api.delete('/scan/history');
      setSaveStatus('History wiped successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      alert("Failed to wipe history");
      setSaveStatus('');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Scan Preferences', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & History', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'flex-start' }}>
      
      <div className="card" style={{ width: '260px', flexShrink: 0, padding: '1rem' }}>
        <h2 style={{ padding: '0.5rem 1rem', marginBottom: '1rem', fontSize: '1.25rem' }}>Settings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', padding: '0.75rem 1rem' }}
            >
              <tab.icon size={18} style={{ marginRight: '0.75rem' }} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ flex: 1, position: 'relative', minHeight: '600px' }}>
        
        {saveStatus && (
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--success)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', animation: 'fadein 0.3s', zIndex: 10 }}>
            <CheckCircle size={18} /> {saveStatus}
          </div>
        )}

        {activeTab === 'account' && (
          <div style={{ animation: 'fadein 0.3s' }}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Account Details</h2>
            <form onSubmit={handleSaveProfile} style={{ maxWidth: '400px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your display name" />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
              <input type="email" defaultValue={user?.email} disabled style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>Account emails cannot be changed for security.</p>

              <button type="submit">Save Username</button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div style={{ animation: 'fadein 0.3s' }}>
             <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Security Settings</h2>
             <form onSubmit={handleSaveMock} style={{ maxWidth: '400px', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Change Password</h3>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Current Password</label>
                <input type="password" placeholder="••••••••" />
                
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New Password</label>
                <input type="password" placeholder="••••••••" />

                <button type="submit">Update Password</button>
             </form>

             <div style={{ marginBottom: '3rem', padding: '1.5rem', border: '1px solid var(--accent-light)', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.05)' }}>
               <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Shield size={20} color="var(--accent)" /> Two-Factor Authentication (2FA)
               </h3>
               <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                 Add an extra layer of security to your account. When logging in, you'll need to provide a code from your authenticator app.
               </p>
               <button onClick={() => alert('2FA Setup Flow')}>Enable 2FA Authenticator</button>
             </div>

             <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Active Sessions</h3>
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--panel-bg)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>Windows PC - Chrome</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>San Francisco, USA • Active now</span>
                    </div>
                    <span className="badge safe">Current Session</span>
                  </div>
                  <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-bg)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>iPhone 14 Pro - Safari</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>London, UK • Last active 2h ago</span>
                    </div>
                    <button className="outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)', boxShadow: 'none' }}>Revoke Session</button>
                  </div>
                </div>
             </div>

             <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--danger)' }}>Terminate All Sessions</h3>
             <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>Log out of all other active sessions across browsers and devices immediately.</p>
             <button className="outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', boxShadow: 'none' }} onClick={() => { logout(); navigate('/login'); }}>
                Log out everywhere
             </button>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div style={{ animation: 'fadein 0.3s' }}>
             <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Scan Preferences</h2>
             <div style={{ maxWidth: '500px' }}>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>Strict Mode</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Apply aggressive heuristics. May increase false positives.</p>
                    </div>
                    <input type="checkbox" checked={prefs.strictMode} onChange={e => handleSavePrefs({...prefs, strictMode: e.target.checked})} style={{ width: '20px', height: '20px', margin: 0 }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Default Scan Window</label>
                  <select value={prefs.defaultType} onChange={e => handleSavePrefs({...prefs, defaultType: e.target.value})}>
                    <option value="url">URL Scanner (Default)</option>
                    <option value="text">Content / Email Scanner</option>
                  </select>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={{ animation: 'fadein 0.3s' }}>
             <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Notification Settings</h2>
             <div style={{ maxWidth: '500px' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--bg-color)', borderRadius: '12px' }}>
                   <div>
                    <h4 style={{ margin: 0 }}>Critical Threat Alerts</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email me immediately if high-risk phishing is detected.</p>
                  </div>
                  <input type="checkbox" checked={prefs.emailAlerts} onChange={e => handleSavePrefs({...prefs, emailAlerts: e.target.checked})} style={{ width: '20px', height: '20px', margin: 0 }} />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div style={{ animation: 'fadein 0.3s' }}>
             <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Data Management</h2>
             
             <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', padding: '1.25rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <AlertTriangle color="var(--warning)" />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: 'var(--warning)', fontWeight: '700' }}>Data Retention</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Free tier accounts automatically wipe scan history after 30 days. Upgrade your plan to store history indefinitely.</p>
                </div>
             </div>

             <div style={{ padding: '1.5rem', border: '1px solid var(--danger)', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)' }}>
                <h3 style={{ margin: 0, color: 'var(--danger)', marginBottom: '0.5rem' }}>Wipe Scan History</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>This action will permanently delete all your scanned URLs, emails, and risk logs.</p>
                <button onClick={handleClearHistory} style={{ backgroundColor: 'var(--danger)', color: 'white' }}>Delete All History</button>
             </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div style={{ animation: 'fadein 0.3s' }}>
             <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Theme Appearance</h2>
             <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div 
                  onClick={() => toggleTheme()}
                  style={{ flex: 1, maxWidth: '200px', cursor: 'pointer', border: theme === 'light' ? '2px solid var(--accent)' : '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', background: '#fff', color: '#0f172a', textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ height: '80px', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0', position: 'relative' }}>
                     <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '10px', background: 'white', borderRadius: '2px' }}></div>
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Light Console</strong>
                </div>

                <div 
                  onClick={() => toggleTheme()}
                  style={{ flex: 1, maxWidth: '200px', cursor: 'pointer', border: theme === 'dark' ? '2px solid var(--accent)' : '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', background: '#0f172a', color: '#f8fafc', textAlign: 'center', transition: 'all 0.2s' }}>
                  <div style={{ height: '80px', background: '#020617', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #1e293b', position: 'relative' }}>
                     <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '10px', background: '#0f172a', borderRadius: '2px' }}></div>
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.9rem' }}>Dark Stealth</strong>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
