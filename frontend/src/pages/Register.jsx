import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Github, Chrome } from '../components/Icons';
import api, { API_BASE_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { email, username, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStrength = (pass) => {
    let str = 0;
    if (pass.length > 5) str += 25;
    if (pass.length > 10) str += 25;
    if (/[A-Z]/.test(pass)) str += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) str += 25;
    return str;
  };
  const strength = calculateStrength(password);
  const strengthColor = strength < 50 ? 'var(--danger)' : strength < 100 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ animation: 'fadein 0.4s' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
           <div style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifySelf: 'center', margin: '0 auto 1.5rem', color: 'white', boxShadow: '0 8px 24px var(--accent-glow)' }}>
              <ShieldCheck size={32} style={{ margin: 'auto' }} />
           </div>
           <h2 style={{ marginBottom: '0.5rem' }}>Join TruPhish</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Start protecting your digital identity today.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '0.75rem 1rem', borderRadius: '12px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ position: 'relative' }}>
             <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '1.1rem' }} />
             <input 
               type="text" 
               placeholder="Full name or username" 
               value={username} 
               onChange={(e) => setUsername(e.target.value)} 
               required 
               style={{ paddingLeft: '3.25rem' }}
             />
          </div>

          <div style={{ position: 'relative' }}>
             <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '1.1rem' }} />
             <input 
               type="email" 
               placeholder="Email address" 
               value={email} 
               onChange={(e) => setEmail(e.target.value)} 
               required 
               style={{ paddingLeft: '3.25rem' }}
             />
          </div>

          <div style={{ position: 'relative' }}>
             <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1.25rem', top: '1.1rem' }} />
             <input 
               type="password" 
               placeholder="Create password" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               required 
               style={{ paddingLeft: '3.25rem' }}
             />
          </div>

          {password && (
            <div className="password-strength">
              <div className="strength-bar" style={{ background: strength >= 25 ? strengthColor : 'var(--border)' }}></div>
              <div className="strength-bar" style={{ background: strength >= 50 ? strengthColor : 'var(--border)' }}></div>
              <div className="strength-bar" style={{ background: strength >= 75 ? strengthColor : 'var(--border)' }}></div>
              <div className="strength-bar" style={{ background: strength >= 100 ? strengthColor : 'var(--border)' }}></div>
            </div>
          )}

          <button type="submit" style={{width: '100%', padding: '1rem'}} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : (
              <> Get Started <ArrowRight size={18} /> </>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ padding: '0 1rem' }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button type="button" className="social-btn" onClick={() => window.location.href=`${API_BASE_URL}/api/auth/google`}>
            <Chrome size={20} /> Google
          </button>
          <button type="button" className="social-btn" onClick={() => window.location.href=`${API_BASE_URL}/api/auth/github`}>
            <Github size={20} /> GitHub
          </button>
        </div>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: '700', color: 'var(--accent)' }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
