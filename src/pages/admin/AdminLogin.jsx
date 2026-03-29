import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login }                     = useAuth();
  const navigate                      = useNavigate();
  const [form, setForm]               = useState({ email:'', password:'' });
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:400, padding:'40px 32px', background:'var(--card)', borderRadius:18, border:'1px solid var(--card-border)', boxShadow:'0 8px 32px rgba(0,0,0,0.18)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>⚡</div>
          <h2 style={{ fontFamily:'var(--font-head)', fontWeight:800, fontSize:'1.5rem', marginBottom:4 }}>KM Gadgets Admin</h2>
          <p style={{ color:'var(--text-dim)', fontSize:'0.88rem' }}>Sign in with your admin account</p>
        </div>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:18, color:'#ef4444', fontSize:'0.85rem', textAlign:'center' }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:6, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Email</label>
            <input style={{ width:'100%', padding:'11px 14px', borderRadius:9, border:'1px solid var(--card-border)', background:'var(--bg)', color:'var(--text)', fontSize:'0.92rem', outline:'none', boxSizing:'border-box' }}
              type="email" required placeholder="admin@kmgadgets.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:6, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Password</label>
            <input style={{ width:'100%', padding:'11px 14px', borderRadius:9, border:'1px solid var(--card-border)', background:'var(--bg)', color:'var(--text)', fontSize:'0.92rem', outline:'none', boxSizing:'border-box' }}
              type="password" required placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'12px', fontSize:'0.95rem', fontWeight:700 }} disabled={loading}>
            {loading ? '⏳ Signing in…' : 'Sign In to Admin'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:20, fontSize:'0.8rem', color:'var(--text-dim)' }}>
          <a href="/" style={{ color:'var(--text-muted)' }}>← Back to store</a>
        </div>
      </div>
    </div>
  );
}
