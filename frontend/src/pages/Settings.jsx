import { useState, useEffect } from 'react';
import { 
  User, Shield, Sliders, Bell, Database, Palette, CheckCircle, 
  AlertTriangle, Eye, EyeOff, Lock, Copy, KeyRound, 
  Trash2, Smartphone, ShieldCheck, Check
} from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const { user, logout, updateUser, theme, toggleTheme } = useAuth();

  // Profile States
  const [username, setUsername] = useState('');
  const [profileStatus, setProfileStatus] = useState({ message: '', type: '' });

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ message: '', type: '' });

  // 2FA States
  const [tfaStep, setTfaStep] = useState('closed'); // closed, setup
  const [tfaSecret, setTfaSecret] = useState('');
  const [tfaCode, setTfaCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [tfaStatus, setTfaStatus] = useState({ message: '', type: '' });

  // General Status Banner
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    if (user) {
      setUsername(user.username || user.email.split('@')[0]);
    }
  }, [user]);

  const [prefs, setPresets] = useState(() => {
    const saved = localStorage.getItem('truphish_prefs');
    return saved ? JSON.parse(saved) : { strictMode: false, defaultType: 'url', emailAlerts: true, weeklyReports: false };
  });

  const triggerBanner = (message, type = 'success') => {
    setSaveStatus({ message, type });
    setTimeout(() => setSaveStatus({ message: '', type: '' }), 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileStatus({ message: 'Saving Profile...', type: 'info' });
    try {
      const res = await api.put('/auth/profile', { username });
      updateUser(res.data.user);
      setProfileStatus({ message: 'Profile updated successfully!', type: 'success' });
      triggerBanner('Profile details synchronized.');
      setTimeout(() => setProfileStatus({ message: '', type: '' }), 3000);
    } catch (err) {
      console.error(err);
      setProfileStatus({ message: err.response?.data?.message || 'Failed to update profile', type: 'error' });
      setTimeout(() => setProfileStatus({ message: '', type: '' }), 4000);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ message: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setPasswordStatus({ message: 'Updating password...', type: 'info' });
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordStatus({ message: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerBanner('Security credentials updated.');
      setTimeout(() => setPasswordStatus({ message: '', type: '' }), 3000);
    } catch (err) {
      console.error(err);
      setPasswordStatus({ message: err.response?.data?.message || 'Failed to update password.', type: 'error' });
      setTimeout(() => setPasswordStatus({ message: '', type: '' }), 4000);
    }
  };

  const handleSavePrefs = (newPrefs) => {
    setPresets(newPrefs);
    localStorage.setItem('truphish_prefs', JSON.stringify(newPrefs));
    triggerBanner('Preferences saved.');
  };

  // 2FA Flow Handles
  const handleInitiate2FA = async () => {
    try {
      setTfaStatus({ message: 'Generating secure token key...', type: 'info' });
      const res = await api.post('/auth/2fa/setup');
      setTfaSecret(res.data.secret);
      setTfaStep('setup');
      setTfaStatus({ message: '', type: '' });
    } catch (err) {
      setTfaStatus({ message: 'Failed to initiate 2FA setup.', type: 'error' });
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(tfaCode)) {
      setTfaStatus({ message: 'Please enter a valid 6-digit verification code.', type: 'error' });
      return;
    }
    setTfaStatus({ message: 'Verifying code...', type: 'info' });
    try {
      await api.post('/auth/2fa/verify', { code: tfaCode });
      updateUser({ ...user, two_factor_enabled: true });
      setTfaStep('closed');
      setTfaCode('');
      setTfaSecret('');
      setTfaStatus({ message: '', type: '' });
      triggerBanner('Two-Factor Authentication is now active!');
    } catch (err) {
      setTfaStatus({ message: err.response?.data?.message || 'Verification failed. Please try again.', type: 'error' });
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.")) return;
    try {
      await api.post('/auth/2fa/verify', { disable: true });
      updateUser({ ...user, two_factor_enabled: false });
      triggerBanner('Two-Factor Authentication disabled.', 'warning');
    } catch (err) {
      alert("Failed to disable 2FA");
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(tfaSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleClearHistory = async () => {
    if(!window.confirm("Are you sure you want to permanently delete all scan history? This action is IRREVERSIBLE.")) return;
    try {
      triggerBanner('Wiping database logs...', 'warning');
      await api.delete('/scan/history');
      triggerBanner('All analysis logs successfully purged.');
    } catch (err) {
      alert("Failed to wipe history");
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
    <div style={{ display: 'flex', gap: '2.5rem', height: '100%', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      
      {/* Settings Navigation Menu */}
      <div className="card" style={{ width: '280px', flexShrink: 0, padding: '1.25rem' }}>
        <h2 style={{ padding: '0.5rem 1rem', marginBottom: '1.25rem', fontSize: '1.4rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--text-main) 0%, var(--accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Settings
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // Reset minor validation statuses
                setProfileStatus({ message: '', type: '' });
                setPasswordStatus({ message: '', type: '' });
                setTfaStatus({ message: '', type: '' });
              }}
              className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Settings Display Area */}
      <div className="card" style={{ flex: 1, minWidth: '450px', position: 'relative', minHeight: '620px', padding: '2.5rem' }}>
        
        {/* Banner Alert Toast */}
        {saveStatus.message && (
          <div style={{ 
            position: 'absolute', 
            top: '1.5rem', 
            right: '1.5rem', 
            background: saveStatus.type === 'warning' ? 'var(--warning)' : 'var(--success)', 
            color: '#fff', 
            padding: '0.65rem 1.25rem', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            fontWeight: '600', 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 100, 
            animation: 'fadein 0.3s' 
          }}>
            <CheckCircle size={18} /> {saveStatus.message}
          </div>
        )}

        {/* 1. Account details tab */}
        {activeTab === 'account' && (
          <div style={{ animation: 'fadein 0.3s' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', color: 'var(--text-main)' }}>Account Details</h2>
            <form onSubmit={handleSaveProfile} style={{ maxWidth: '480px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="user-avatar" style={{ width: '70px', height: '70px', fontSize: '1.8rem', borderRadius: '50%' }}>
                  {username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{username}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registered Console Operator</p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="Enter your display name" 
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user?.email} 
                  disabled 
                  style={{ backgroundColor: 'rgba(0,0,0,0.03)', color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.8 }} 
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-0.75rem' }}>Account emails cannot be changed for platform audit security.</p>
              </div>

              {profileStatus.message && (
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: '10px', 
                  marginBottom: '1.5rem', 
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: profileStatus.type === 'error' ? 'var(--danger)' : profileStatus.type === 'success' ? 'var(--success)' : 'var(--accent)',
                  backgroundColor: profileStatus.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : profileStatus.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                  border: `1px solid ${profileStatus.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : profileStatus.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                }}>
                  {profileStatus.message}
                </div>
              )}

              <button type="submit" style={{ width: '100%', maxWidth: '200px' }}>Save Changes</button>
            </form>
          </div>
        )}

        {/* 2. Security Tab */}
        {activeTab === 'security' && (
          <div style={{ animation: 'fadein 0.3s' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', color: 'var(--text-main)' }}>Security & Auth</h2>
             
             {/* Password Form */}
             <form onSubmit={handleUpdatePassword} style={{ maxWidth: '500px', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                  <KeyRound size={18} color="var(--accent)" /> Change Password
                </h3>
                
                <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showCurrent ? "text" : "password"} 
                      value={currentPassword} 
                      onChange={e => setCurrentPassword(e.target.value)} 
                      placeholder="••••••••" 
                      style={{ paddingRight: '3rem', marginBottom: 0 }}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCurrent(!showCurrent)}
                      style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', boxShadow: 'none', color: 'var(--text-muted)', padding: '0.5rem' }}
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showNew ? "text" : "password"} 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      placeholder="••••••••" 
                      style={{ paddingRight: '3rem', marginBottom: 0 }}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNew(!showNew)}
                      style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', boxShadow: 'none', color: 'var(--text-muted)', padding: '0.5rem' }}
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showConfirm ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••" 
                      style={{ paddingRight: '3rem', marginBottom: 0 }}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', boxShadow: 'none', color: 'var(--text-muted)', padding: '0.5rem' }}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {passwordStatus.message && (
                  <div style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: '10px', 
                    marginBottom: '1.5rem', 
                    fontSize: '0.9rem',
                    color: passwordStatus.type === 'error' ? 'var(--danger)' : passwordStatus.type === 'success' ? 'var(--success)' : 'var(--accent)',
                    backgroundColor: passwordStatus.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : passwordStatus.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                    border: `1px solid ${passwordStatus.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : passwordStatus.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                  }}>
                    {passwordStatus.message}
                  </div>
                )}

                <button type="submit">Update Password</button>
             </form>

             {/* 2FA System Panel */}
             <div style={{ marginBottom: '3rem', padding: '1.75rem', border: '1px solid var(--border)', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.03)', boxShadow: 'var(--shadow-sm)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                 <div>
                   <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--text-main)' }}>
                     <Smartphone size={20} color="var(--accent)" /> Two-Factor Authentication (2FA)
                   </h3>
                   <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                     Secure your dashboard with an authenticator passcode check during logins.
                   </p>
                 </div>
                 {user?.two_factor_enabled ? (
                   <span className="badge safe" style={{ flexShrink: 0 }}><ShieldCheck size={14} /> Active</span>
                 ) : (
                   <span className="badge warning" style={{ flexShrink: 0 }}>Disabled</span>
                 )}
               </div>

               {user?.two_factor_enabled ? (
                 <button onClick={handleDisable2FA} className="outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                   Disable 2FA Protection
                 </button>
               ) : tfaStep === 'closed' ? (
                 <button onClick={handleInitiate2FA}>Configure Authenticator</button>
               ) : (
                 <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)', animation: 'fadein 0.3s' }}>
                   <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>Setup Instructions</h4>
                   
                   <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                     {/* Graphic QR Indicator */}
                     <div style={{ 
                       width: '120px', 
                       height: '120px', 
                       background: '#fff', 
                       border: '1px solid var(--border)', 
                       borderRadius: '12px', 
                       padding: '0.5rem', 
                       display: 'flex', 
                       flexDirection: 'column', 
                       alignItems: 'center', 
                       justifyContent: 'center',
                       boxShadow: 'var(--shadow-sm)'
                     }}>
                       <div style={{ width: '85px', height: '85px', display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '2px' }}>
                         {/* Generate a cool QR matrix pattern */}
                         {Array.from({ length: 49 }).map((_, i) => (
                           <div key={i} style={{ 
                             width: '10px', 
                             height: '10px', 
                             backgroundColor: (i % 3 === 0 || i % 7 === 1 || (i > 15 && i < 28) || i === 0 || i === 6 || i === 42 || i === 48) ? 'var(--text-main)' : '#f1f5f9',
                             borderRadius: '1px'
                           }} />
                         ))}
                       </div>
                       <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '6px', fontWeight: '700' }}>TRUPHISH QR</span>
                     </div>

                     <div style={{ flex: 1, minWidth: '220px' }}>
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                         1. Scan the QR code or manually input the secret key into Google Authenticator or Authy.
                       </p>
                       <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-color)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                         <code style={{ fontSize: '0.85rem', fontWeight: '800', flex: 1, letterSpacing: '0.05em', color: 'var(--accent)' }}>{tfaSecret}</code>
                         <button 
                           type="button" 
                           onClick={handleCopySecret}
                           className="icon-btn" 
                           style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none' }}
                           title="Copy Secret"
                         >
                           {copiedSecret ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                         </button>
                       </div>
                     </div>
                   </div>

                   <form onSubmit={handleVerify2FA} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                     <div style={{ flex: 1, minWidth: '200px' }}>
                       <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Enter 6-Digit Passcode</label>
                       <input 
                         type="text" 
                         maxLength="6"
                         value={tfaCode} 
                         onChange={e => setTfaCode(e.target.value.replace(/\D/g, ''))}
                         placeholder="000000" 
                         style={{ marginBottom: 0, letterSpacing: '0.3em', textAlign: 'center', fontWeight: '700', fontSize: '1.1rem' }}
                         required
                       />
                     </div>
                     <div style={{ display: 'flex', gap: '0.5rem' }}>
                       <button type="submit">Verify & Enable</button>
                       <button type="button" className="outline" onClick={() => { setTfaStep('closed'); setTfaStatus({ message: '', type: '' }); }}>Cancel</button>
                     </div>
                   </form>

                   {tfaStatus.message && (
                     <div style={{ 
                       padding: '0.75rem 1rem', 
                       borderRadius: '10px', 
                       marginTop: '1.25rem', 
                       fontSize: '0.85rem',
                       color: tfaStatus.type === 'error' ? 'var(--danger)' : 'var(--accent)',
                       backgroundColor: tfaStatus.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                       border: `1px solid ${tfaStatus.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                     }}>
                       {tfaStatus.message}
                     </div>
                   )}
                 </div>
               )}
             </div>
          </div>
        )}

        {/* 3. Scan Preferences Tab */}
        {activeTab === 'preferences' && (
          <div style={{ animation: 'fadein 0.3s' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', color: 'var(--text-main)' }}>Scan Preferences</h2>
             <div style={{ maxWidth: '540px' }}>
                <div style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', justifycontent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', boxShadow: 'var(--shadow-sm)' }}>
                   <div style={{ paddingRight: '1.5rem' }}>
                     <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1rem' }}>Aggressive Strict Mode</h4>
                     <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                       Apply strict heuristics to scanner checks. Enhances detection rates but may slightly elevate false positive rates.
                     </p>
                   </div>
                   <label className="switch" style={{ flexShrink: 0 }}>
                     <input 
                       type="checkbox" 
                       checked={prefs.strictMode} 
                       onChange={e => handleSavePrefs({...prefs, strictMode: e.target.checked})} 
                     />
                     <span className="slider"></span>
                   </label>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.9rem' }}>Default Landing Screen Mode</label>
                  <select 
                    value={prefs.defaultType} 
                    onChange={e => handleSavePrefs({...prefs, defaultType: e.target.value})}
                  >
                    <option value="url">Real-time URL Scanner</option>
                    <option value="text">Email & Document Content Scanner</option>
                  </select>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-0.75rem' }}>Sets the default layout selection for your scanner utility console.</p>
                </div>
             </div>
          </div>
        )}

        {/* 4. Notification Settings Tab */}
        {activeTab === 'notifications' && (
          <div style={{ animation: 'fadein 0.3s' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', color: 'var(--text-main)' }}>Notification Feeds</h2>
             <div style={{ maxWidth: '540px' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifycontent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '16px', background: 'var(--bg-color)', boxShadow: 'var(--shadow-sm)' }}>
                   <div style={{ paddingRight: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1rem' }}>Critical Security Alerts</h4>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Deliver instant warning emails if threats trigger severe confidence scores on custom sweeps.</p>
                  </div>
                  <label className="switch" style={{ flexShrink: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={prefs.emailAlerts} 
                      onChange={e => handleSavePrefs({...prefs, emailAlerts: e.target.checked})} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '16px', background: 'var(--bg-color)', boxShadow: 'var(--shadow-sm)' }}>
                   <div style={{ paddingRight: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1rem' }}>Weekly Intelligence Reports</h4>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Receive aggregate statistics, risk graphs, and trend summaries for scanned domains.</p>
                  </div>
                  <label className="switch" style={{ flexShrink: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={prefs.weeklyReports || false} 
                      onChange={e => handleSavePrefs({...prefs, weeklyReports: e.target.checked})} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
             </div>
          </div>
        )}

        {/* 5. Data & History Tab */}
        {activeTab === 'data' && (
          <div style={{ animation: 'fadein 0.3s' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', color: 'var(--text-main)' }}>Data & Privacy Control</h2>
             
             <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1.25rem 1.5rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <AlertTriangle color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: 'var(--warning)', fontWeight: '700', fontSize: '1rem' }}>Data Retention Standards</h4>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    By platform defaults, free tier accounts preserve scanned metrics for up to 30 days. Contact your administrator or configuration dashboard settings to upgrade storage nodes.
                  </p>
                </div>
             </div>

             <div className="danger-zone">
                <h3 style={{ margin: 0, color: 'var(--danger)', fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trash2 size={18} /> Wipe Intelligence Logs
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  This action permanently deletes all history of scanned URLs, threat metrics, classifications, and text contents. The operation is immediate and cannot be recovered.
                </p>
                <button 
                  onClick={handleClearHistory} 
                  style={{ 
                    background: 'linear-gradient(135deg, var(--danger) 0%, #b91c1c 100%)', 
                    color: 'white', 
                    border: 'none',
                    boxShadow: '0 4px 12px var(--danger-glow)'
                  }}
                >
                  Purge Scan History
                </button>
             </div>
          </div>
        )}

        {/* 6. Appearance Tab */}
        {activeTab === 'appearance' && (
          <div style={{ animation: 'fadein 0.3s' }}>
             <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', color: 'var(--text-main)' }}>Theme Appearance</h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>Customize the visual shell of the threat intelligence console.</p>
             
             <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div 
                  onClick={() => theme !== 'light' && toggleTheme()}
                  style={{ 
                    flex: '1 1 200px', 
                    cursor: 'pointer', 
                    border: theme === 'light' ? '2.5px solid var(--accent)' : '1px solid var(--border)', 
                    borderRadius: '16px', 
                    padding: '1.5rem', 
                    background: '#ffffff', 
                    color: '#0f172a', 
                    textAlign: 'center', 
                    transition: 'all 0.3s ease',
                    boxShadow: theme === 'light' ? '0 8px 24px var(--accent-glow)' : 'var(--shadow-sm)'
                  }}
                  className="theme-card"
                >
                  <div style={{ height: '90px', background: '#f8fafc', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                     <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', height: '14px', background: 'white', borderRadius: '4px', border: '1px solid #e2e8f0' }}></div>
                     <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '40%', height: '10px', background: 'rgba(99,102,241,0.2)', borderRadius: '2px' }}></div>
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Light Console</strong>
                </div>

                <div 
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  style={{ 
                    flex: '1 1 200px', 
                    cursor: 'pointer', 
                    border: theme === 'dark' ? '2.5px solid var(--accent)' : '1px solid var(--border)', 
                    borderRadius: '16px', 
                    padding: '1.5rem', 
                    background: '#0f172a', 
                    color: '#f8fafc', 
                    textAlign: 'center', 
                    transition: 'all 0.3s ease',
                    boxShadow: theme === 'dark' ? '0 8px 24px var(--accent-glow)' : 'var(--shadow-sm)'
                  }}
                  className="theme-card"
                >
                  <div style={{ height: '90px', background: '#020617', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #1e293b', position: 'relative', overflow: 'hidden' }}>
                     <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', height: '14px', background: '#0f172a', borderRadius: '4px' }}></div>
                     <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '40%', height: '10px', background: 'rgba(99,102,241,0.3)', borderRadius: '2px' }}></div>
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>Dark Stealth</strong>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
