import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Link as LinkIcon, FileText, History, Settings, LogOut, 
  Bell, ShieldCheck, Mail, CheckCircle, AlertCircle, X, ChevronRight, Sun, Moon,
  Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
        <Icon size={20} />
        <span style={{ flex: 1 }}>{label}</span>
        {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
      </Link>
    );
  };

  const notifications = [
    { id: 1, title: 'Identity Secured', desc: 'Welcome to your new dashboard!', time: 'Just now', type: 'safe' },
    { id: 2, title: 'Database Connected', desc: 'Analysis ledger is synchronized.', time: '1 min ago', type: 'safe' },
  ];

  const displayName = user?.username || user?.email?.split('@')[0];
  const userInitial = displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="layout-container">
      <div className="sidebar">
        <div className="sidebar-header">
           <div className="user-avatar" style={{ width: '44px', height: '44px', borderRadius: '12px' }}>
             <ShieldCheck size={24} />
           </div>
           <h2>TruPhish</h2>
        </div>
        
        <div className="sidebar-section">Main Console</div>
        <nav>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/scan-url" icon={LinkIcon} label="URL Scanner" />
          <NavItem to="/scan-text" icon={FileText} label="Content Scanner" />
          <NavItem to="/history" icon={History} label="Intelligence Logs" />
          <NavItem to="/ai-analyst" icon={Brain} label="AI Security Analyst" />
        </nav>

        <div className="sidebar-section" style={{ marginTop: '2rem' }}>Administration</div>
        <nav>
          <NavItem to="/settings" icon={Settings} label="Command Center" />
          <button 
            onClick={handleLogout} 
            className="nav-item" 
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', color: 'var(--danger)', marginTop: 'auto', marginBottom: '1rem', cursor: 'pointer' }}>
            <LogOut size={20} />
            <span>Terminate Session</span>
          </button>
        </nav>
      </div>
      
      <div className="main-content">
        <header className="navbar">
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button className="icon-btn" onClick={() => navigate('/settings')}>
              <Mail size={20} />
            </button>

            <div style={{ position: 'relative' }} ref={notificationRef}>
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                <span style={{ position: 'absolute', top: '7px', right: '7px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--panel-bg)' }}></span>
              </button>
              {showNotifications && (
                <div className="card" style={{ position: 'absolute', top: '60px', right: '0', width: '320px', zIndex: 100, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: 0, fontWeight: '800' }}>Intelligence Feed</h4>
                    <X size={16} cursor="pointer" onClick={() => setShowNotifications(false)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.map(notif => (
                      <div key={notif.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        {notif.type === 'safe' ? <CheckCircle size={18} color="var(--success)" /> : <AlertCircle size={18} color="var(--danger)" />}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.2rem', color: 'var(--text-main)' }}>{notif.title}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{notif.desc}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="outline" style={{ width: '100%', marginTop: '1.25rem', borderRadius: '12px', fontSize: '0.8rem' }}>Clear Alerts</button>
                </div>
              )}
            </div>

            <div className="user-profile" onClick={() => navigate('/settings')}>
              <div className="user-avatar">
                <span>{userInitial}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{displayName}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
