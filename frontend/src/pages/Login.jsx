import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ animation: 'fadein 0.4s' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
           <div style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifySelf: 'center', margin: '0 auto 1.5rem', color: 'white', boxShadow: '0 8px 24px var(--accent-glow)' }}>
              <ShieldCheck size={32} style={{ margin: 'auto' }} />
           </div>
           <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Access your security intelligence console.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '0.75rem 1rem', borderRadius: '12px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
               placeholder="Password" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               required 
               style={{ paddingLeft: '3.25rem' }}
             />
          </div>

          <button type="submit" style={{width: '100%', padding: '1rem'}} disabled={isLoading}>
            {isLoading ? 'Authenticating...' : (
              <> Sign In <ArrowRight size={18} /> </>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ padding: '0 1rem' }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button type="button" className="social-btn" onClick={() => window.location.href='http://localhost:5000/auth/google'}>
            <Chrome size={20} /> Google
          </button>
          <button type="button" className="social-btn" onClick={() => window.location.href='http://localhost:5000/auth/github'}>
            <Github size={20} /> GitHub
          </button>
        </div>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account yet? <Link to="/register" style={{ fontWeight: '700', color: 'var(--accent)' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
