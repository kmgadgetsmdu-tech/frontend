import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { compressImage } from '../../utils/helpers';
import EmojiPicker from '../../components/EmojiPicker';

const BLANK = { Title:'', Subtitle:'', Offer:'', Cta:'Shop Now', Link:'/shop', Gradient:'linear-gradient(135deg,#0ea5e9,#6366f1)', Accent:'#0ea5e9', Icon:'⚡', Active:true };

export default function AdminBanners() {
  const [banners,  setBanners]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(BLANK);
  const [saving,   setSaving]   = useState(false);
  const [preview,  setPreview]  = useState(null);  // image preview
  const fileRef                 = useRef();

  useEffect(() => {
    api.get('/banners/all').then(r => setBanners(r.data)).finally(() => setLoading(false));
  }, []);

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function openAdd() { setEditing(null); setForm(BLANK); setPreview(null); setModal(true); }
  function openEdit(b) {
    setEditing(b.Id);
    setForm({ Title:b.Title, Subtitle:b.Subtitle||'', Offer:b.Offer||'', Cta:b.Cta||'Shop Now', Link:b.Link||'/shop', Gradient:b.Gradient||BLANK.Gradient, Accent:b.Accent||'#0ea5e9', Icon:b.Icon||'⚡', Active:!!b.Active });
    setPreview(b.ImageData || null);
    setModal(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this banner?')) return;
    await api.delete(`/banners/${id}`);
    setBanners(bs => bs.filter(b => b.Id !== id));
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await compressImage(file, 1200, 500, 0.85);
    up('ImageData', b64);
    setPreview(b64);
    e.target.value = '';
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const r = await api.put(`/banners/${editing}`, form);
        setBanners(bs => bs.map(b => b.Id === editing ? r.data : b));
      } else {
        const r = await api.post('/banners', form);
        setBanners(bs => [...bs, r.data]);
      }
      setModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Banners</h1>
          <p className="admin-subtitle">Hero carousel slides</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">+ Add Banner</button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text-dim)' }}>Loading…</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {banners.map(b => (
            <div key={b.Id} style={{ background:'var(--card)', borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ width:80, height:56, borderRadius:8, background:b.Gradient||'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0 }}>
                {b.ImageData ? <img src={b.ImageData} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:8 }} /> : b.Icon}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, marginBottom:2 }}>{b.Title || '(No title)'}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-dim)', marginBottom:4 }}>{b.Subtitle}</div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
                  {b.Offer && <span style={{ fontSize:'0.72rem', background:'rgba(0,212,255,0.1)', color:'var(--accent)', border:'1px solid rgba(0,212,255,0.2)', borderRadius:20, padding:'2px 8px' }}>{b.Offer}</span>}
                  <span style={{ fontSize:'0.72rem', background: b.Active ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: b.Active ? '#10b981' : '#64748b', border:`1px solid ${b.Active ? 'rgba(16,185,129,0.2)': 'rgba(100,116,139,0.2)'}`, borderRadius:20, padding:'2px 8px' }}>{b.Active ? 'Active' : 'Hidden'}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                <button onClick={() => openEdit(b)} className="icon-btn">✏️</button>
                <button onClick={() => handleDelete(b.Id)} className="icon-btn icon-btn-danger">🗑️</button>
              </div>
            </div>
          ))}
          {banners.length === 0 && <div style={{ textAlign:'center', padding:'40px', color:'var(--text-dim)' }}>No banners yet. Add your first banner!</div>}
        </div>
      )}

      {modal && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="modal" style={{ maxWidth:'580px', maxHeight:'92vh', overflowY:'auto' }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Banner' : 'Add Banner'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              {/* Live preview */}
              <div style={{ borderRadius:12, background:form.Gradient, padding:'28px 24px', marginBottom:20, position:'relative', overflow:'hidden', minHeight:100 }}>
                {preview && <img src={preview} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.3, borderRadius:12 }} />}
                <div style={{ position:'relative', color:'#fff' }}>
                  <div style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:4 }}>{form.Title || 'Banner Title'}</div>
                  <div style={{ fontSize:'0.82rem', opacity:0.85 }}>{form.Subtitle || 'Subtitle goes here'}</div>
                  {form.Offer && <div style={{ marginTop:8, display:'inline-block', background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'3px 12px', fontSize:'0.75rem' }}>{form.Offer}</div>}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Title</label>
                  <input className="form-control" value={form.Title} onChange={e => up('Title', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Subtitle</label>
                  <input className="form-control" value={form.Subtitle} onChange={e => up('Subtitle', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Offer Tag</label>
                  <input className="form-control" placeholder="Up to 40% off" value={form.Offer} onChange={e => up('Offer', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Button Text</label>
                  <input className="form-control" value={form.Cta} onChange={e => up('Cta', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Button Link</label>
                  <input className="form-control" value={form.Link} onChange={e => up('Link', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon (Emoji)</label>
                  <EmojiPicker value={form.Icon} onChange={v => up('Icon', v)} placeholder="⚡" />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Background Gradient</label>
                  <input className="form-control" value={form.Gradient} onChange={e => up('Gradient', e.target.value)} placeholder="linear-gradient(135deg,#0ea5e9,#6366f1)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <input className="form-control" type="color" value={form.Accent} onChange={e => up('Accent', e.target.value)} style={{ height:42, padding:'4px 8px', cursor:'pointer' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Background Image</label>
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ghost" style={{ width:'100%', padding:'10px', fontSize:'0.82rem' }}>
                    {preview ? '🔄 Change Image' : '📷 Upload Image'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />
                  {preview && <button type="button" onClick={() => { up('ImageData',''); setPreview(null); }} className="icon-btn icon-btn-danger" style={{ marginTop:6, fontSize:'0.78rem', padding:'4px 10px' }}>✕ Remove image</button>}
                </div>
              </div>

              <label style={{ display:'flex', gap:'10px', alignItems:'center', cursor:'pointer', fontSize:'0.88rem', marginBottom:18 }}>
                <input type="checkbox" checked={form.Active} onChange={e => up('Active', e.target.checked)} style={{ width:15, height:15 }} />
                Active (visible in store)
              </label>

              <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Banner' : 'Add Banner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
