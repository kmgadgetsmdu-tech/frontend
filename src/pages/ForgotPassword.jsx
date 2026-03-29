import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ── shared styles ────────────────────────────────────────────────
const ERR  = { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'10px 14px', marginBottom:'18px', color:'#ef4444', fontSize:'0.85rem' };
const OK   = { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'8px', padding:'10px 14px', marginBottom:'18px', color:'#10b981', fontSize:'0.85rem' };

// OTP digit input style
const OTP_WRAP = { display:'flex', gap:'10px', justifyContent:'center', margin:'24px 0' };
const OTP_BOX  = { width:50, height:56, textAlign:'center', fontSize:'1.5rem', fontWeight:800, fontFamily:'monospace',
  background:'rgba(255,255,255,0.05)', border:'1px solid var(--card-border)', borderRadius:10, color:'var(--text)',
  outline:'none', transition:'border-color .2s' };

const STEPS = ['Email', 'OTP', 'New Password'];

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step,       setStep]       = useState(0);   // 0=email 1=otp 2=newpw
  const [email,      setEmail]      = useState('');
  const [otp,        setOtp]        = useState(['','','','','','']);
  const [resetToken, setResetToken] = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  // ── OTP digit handlers ─────────────────────────────────────────
  function handleOtpChange(i, val) {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  }

  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = text[i] || '';
    setOtp(next);
    document.getElementById(`otp-${Math.min(text.length, 5)}`)?.focus();
  }

  // ── Step 0: request OTP ────────────────────────────────────────
  async function handleRequestOtp(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const r = await api.post('/auth/forgot-password', { email: email.trim() });
      // Dev fallback: backend returns OTP when email delivery fails
      if (r.data.devMode && r.data.otp) {
        const digits = String(r.data.otp).split('');
        setOtp(digits);
        setSuccess(`📧 Email delivery not configured. Your OTP is: ${r.data.otp}`);
      } else {
        setSuccess('OTP sent! Check your inbox (and spam folder).');
      }
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1: verify OTP ─────────────────────────────────────────
  async function handleVerifyOtp(e) {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length < 6) { setError('Enter all 6 digits.'); return; }
    setError(''); setLoading(true);
    try {
      const r = await api.post('/auth/verify-otp', { email: email.trim(), otp: otpStr });
      setResetToken(r.data.resetToken);
      setSuccess('OTP verified! Set your new password.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: reset password ─────────────────────────────────────
  async function handleResetPassword(e) {
    e.preventDefault();
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return; }
    if (newPw.length < 6)   { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/auth/reset-password', { resetToken, newPassword: newPw });
      setSuccess('Password changed! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Start over.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'80px' }}>
      <div className="auth-card" style={{ maxWidth: 440 }}>

        {/* ── Header ── */}
        <div className="auth-icon">🔑</div>
        <h2>Forgot Password</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'28px', fontSize:'0.9rem' }}>
          {step === 0 && 'Enter your email and we will send you a 6-digit OTP.'}
          {step === 1 && `OTP sent to ${email}. Enter it below.`}
          {step === 2 && 'Almost there! Choose a new password.'}
        </p>

        {/* ── Step indicator ── */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:'28px', gap:0 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', flex:1 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1 }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.75rem', fontWeight:700, transition:'all .3s',
                  background: i < step ? 'var(--success)' : i === step ? 'var(--accent)' : 'var(--card-border)',
                  color: i <= step ? '#fff' : 'var(--text-dim)',
                  boxShadow: i === step ? '0 0 12px rgba(0,212,255,0.4)' : 'none',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize:'0.7rem', color: i === step ? 'var(--accent)' : 'var(--text-dim)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex:0.8, height:2, background: i < step ? 'var(--success)' : 'var(--card-border)', marginBottom:18, transition:'background .3s' }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Alerts ── */}
        {error   && <div style={ERR}>⚠ {error}</div>}
        {success && !error && <div style={OK}>✓ {success}</div>}

        {/* ────────── Step 0: Email ────────── */}
        {step === 0 && (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label className="form-label">Registered Email Address</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@example.com"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'12px', fontSize:'0.95rem', marginTop:'4px' }} disabled={loading}>
              {loading ? '⏳ Sending OTP…' : '📧 Send OTP'}
            </button>
          </form>
        )}

        {/* ────────── Step 1: OTP ────────── */}
        {step === 1 && (
          <form onSubmit={handleVerifyOtp}>
            <label className="form-label" style={{ display:'block', textAlign:'center', marginBottom:0 }}>Enter the 6-digit OTP</label>
            <div style={OTP_WRAP} onPaste={handleOtpPaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  style={{ ...OTP_BOX, borderColor: d ? 'var(--accent)' : 'var(--card-border)' }}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  autoFocus={i === 0}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                />
              ))}
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'12px', fontSize:'0.95rem' }} disabled={loading}>
              {loading ? '⏳ Verifying…' : '✅ Verify OTP'}
            </button>
            <div style={{ textAlign:'center', marginTop:14 }}>
              <button type="button" onClick={() => { setStep(0); setOtp(['','','','','','']); setError(''); setSuccess(''); }}
                style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', fontSize:'0.82rem', textDecoration:'underline' }}>
                ← Use a different email / Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* ────────── Step 2: New Password ────────── */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group" style={{ position:'relative' }}>
              <label className="form-label">New Password</label>
              <input
                className="form-control"
                type={showPw ? 'text' : 'password'}
                placeholder="Min 6 characters"
                required
                autoFocus
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                style={{ paddingRight:'44px' }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position:'absolute', right:'12px', top:'38px', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1.1rem' }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                className="form-control"
                type={showPw ? 'text' : 'password'}
                placeholder="Repeat password"
                required
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
              />
            </div>
            {/* Password strength bar */}
            {newPw.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                  {[1,2,3,4].map(n => (
                    <div key={n} style={{ flex:1, height:3, borderRadius:2, background:
                      n <= (newPw.length < 6 ? 1 : newPw.length < 8 ? 2 : newPw.length < 10 ? 3 : 4)
                        ? (newPw.length < 6 ? '#ef4444' : newPw.length < 8 ? '#f59e0b' : newPw.length < 10 ? '#3b82f6' : '#10b981')
                        : 'var(--card-border)'
                    }} />
                  ))}
                </div>
                <span style={{ fontSize:'0.74rem', color:'var(--text-dim)' }}>
                  {newPw.length < 6 ? 'Too short' : newPw.length < 8 ? 'Weak' : newPw.length < 10 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'12px', fontSize:'0.95rem' }} disabled={loading}>
              {loading ? '⏳ Saving…' : '🔒 Set New Password'}
            </button>
          </form>
        )}

        {/* ── Footer ── */}
        <div style={{ textAlign:'center', marginTop:'24px', fontSize:'0.85rem', color:'var(--text-dim)' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Sign in</Link>
        </div>
      </div>
    </main>
  );
}
