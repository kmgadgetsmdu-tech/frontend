import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }                         = useAuth();
  const navigate                          = useNavigate();
  const location                          = useLocation();
  const from                              = location.state?.from?.pathname || '/';

  const [form, setForm]                   = useState({ email:'', password:'' });
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [showPw, setShowPw]               = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'80px' }}>
      <div className="auth-card">
        <div className="auth-icon">🔐</div>
        <h2>Welcome Back</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'24px', fontSize:'0.9rem' }}>Sign in to your KM Gadgets account</p>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'10px 14px', marginBottom:'18px', color:'#ef4444', fontSize:'0.85rem' }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com" required
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>

          <div className="form-group" style={{ position:'relative' }}>
            <label className="form-label">Password</label>
            <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Your password" required
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ paddingRight:'44px' }} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              style={{ position:'absolute', right:'12px', top:'38px', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1.1rem', padding:'2px' }}>
              {showPw ? '🙈' : '👁'}
            </button>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width:'100%', marginTop:'8px', padding:'12px', fontSize:'0.95rem' }} disabled={loading}>
            {loading ? '⏳ Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:'14px' }}>
          <Link to="/forgot-password" style={{ color:'var(--accent)', fontSize:'0.85rem', fontWeight:500 }}>Forgot password?</Link>
        </div>

        <div style={{ textAlign:'center', marginTop:'14px', fontSize:'0.88rem', color:'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Create one</Link>
        </div>
        <div style={{ textAlign:'center', marginTop:'10px', fontSize:'0.78rem', color:'var(--text-dim)' }}>
          Admin? Use your admin credentials to access <Link to="/admin" style={{ color:'var(--text-muted)' }}>admin panel</Link>.
        </div>
      </div>
    </main>
  );
}
