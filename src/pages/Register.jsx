import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register }              = useAuth();
  const navigate                  = useNavigate();
  const [form, setForm]           = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPw, setShowPw]       = useState(false);

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6)        { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.phone, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'80px' }}>
      <div className="auth-card">
        <div className="auth-icon">🛍️</div>
        <h2>Create Account</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'24px', fontSize:'0.9rem' }}>Join thousands of happy shoppers</p>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'10px 14px', marginBottom:'18px', color:'#ef4444', fontSize:'0.85rem' }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" type="text" placeholder="John Doe" required
                value={form.name} onChange={e => up('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" type="tel" placeholder="+91 98765 43210"
                value={form.phone} onChange={e => up('phone', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com" required
              value={form.email} onChange={e => up('email', e.target.value)} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <div className="form-group" style={{ position:'relative' }}>
              <label className="form-label">Password</label>
              <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Min. 6 chars" required
                value={form.password} onChange={e => up('password', e.target.value)}
                style={{ paddingRight:'40px' }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position:'absolute', right:'10px', top:'38px', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1rem' }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Same password" required
                value={form.confirm} onChange={e => up('confirm', e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width:'100%', marginTop:'8px', padding:'12px', fontSize:'0.95rem' }} disabled={loading}>
            {loading ? '⏳ Creating…' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:'20px', fontSize:'0.88rem', color:'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Sign in</Link>
        </div>
      </div>
    </main>
  );
}
