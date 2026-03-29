import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { compressImage } from '../../utils/helpers';
import EmojiPicker from '../../components/EmojiPicker';

const BLANK = { Name:'', Slug:'', Icon:'', Description:'', Featured:false, Active:true, ImageData:'' };
const toSlug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function AdminCategories() {
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(BLANK);
  const [saving,  setSaving]  = useState(false);
  const fileRef               = useRef();

  useEffect(() => {
    api.get('/categories').then(r => setCats(r.data)).finally(() => setLoading(false));
  }, []);

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function openAdd() { setEditing(null); setForm(BLANK); setModal(true); }
  function openEdit(c) {
    setEditing(c.Id);
    setForm({ Name:c.Name, Slug:c.Slug, Icon:c.Icon||'', Description:c.Description||'', Featured:!!c.Featured, Active:!!c.Active, ImageData:c.ImageData||'' });
    setModal(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category? Products in it will become uncategorised.')) return;
    await api.delete(`/categories/${id}`);
    setCats(cs => cs.filter(c => c.Id !== id));
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await compressImage(file, 300, 300, 0.85);
    up('ImageData', b64);
    e.target.value = '';
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const r = await api.put(`/categories/${editing}`, form);
        setCats(cs => cs.map(c => c.Id === editing ? r.data : c));
      } else {
        const r = await api.post('/categories', form);
        setCats(cs => [r.data, ...cs]);
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
          <h1 className="admin-title">Categories</h1>
          <p className="admin-subtitle">{cats.length} categories</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">+ Add Category</button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text-dim)' }}>Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Category</th><th>Slug</th><th>Featured</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.Id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      {c.ImageData ? (
                        <img src={c.ImageData} alt={c.Name} style={{ width:36, height:36, borderRadius:6, objectFit:'cover' }} />
                      ) : (
                        <span style={{ fontSize:'1.4rem' }}>{c.Icon || '🏷️'}</span>
                      )}
                      <div>
                        <div style={{ fontWeight:600 }}>{c.Name}</div>
                        {c.Description && <div style={{ fontSize:'0.74rem', color:'var(--text-dim)' }}>{c.Description.slice(0,60)}…</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily:'monospace', fontSize:'0.82rem', color:'var(--text-muted)' }}>{c.Slug}</td>
                  <td>{c.Featured ? '⭐ Yes' : <span style={{ color:'var(--text-dim)' }}>—</span>}</td>
                  <td>
                    <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:700, background: c.Active ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', color: c.Active ? '#10b981' : '#64748b' }}>
                      {c.Active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => openEdit(c)} className="icon-btn">✏️</button>
                      <button onClick={() => handleDelete(c.Id)} className="icon-btn icon-btn-danger">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {cats.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-dim)', padding:'32px' }}>No categories</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="modal" style={{ maxWidth:'500px' }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-control" required value={form.Name} onChange={e => { up('Name', e.target.value); if (!editing) up('Slug', toSlug(e.target.value)); }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input className="form-control" value={form.Slug} onChange={e => up('Slug', e.target.value)} placeholder="auto-generated" />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon (Emoji) *</label>
                  <EmojiPicker value={form.Icon} onChange={v => up('Icon', v)} placeholder="🖷️" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={2} value={form.Description} onChange={e => up('Description', e.target.value)} />
              </div>

              {/* Image */}
              <div className="form-group">
                <label className="form-label">Category Image</label>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                  {form.ImageData && <img src={form.ImageData} alt="" style={{ width:60, height:60, borderRadius:8, objectFit:'cover' }} />}
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ghost" style={{ fontSize:'0.82rem', padding:'8px 14px' }}>📷 Upload Image</button>
                  {form.ImageData && <button type="button" onClick={() => up('ImageData', '')} className="icon-btn icon-btn-danger" style={{ fontSize:'0.8rem' }}>✕ Remove</button>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />
              </div>

              <div style={{ display:'flex', gap:'16px', marginBottom:'16px' }}>
                <label style={{ display:'flex', gap:'8px', alignItems:'center', cursor:'pointer', fontSize:'0.88rem' }}>
                  <input type="checkbox" checked={form.Featured} onChange={e => up('Featured', e.target.checked)} style={{ width:15, height:15 }} />
                  Featured (show on homepage)
                </label>
                <label style={{ display:'flex', gap:'8px', alignItems:'center', cursor:'pointer', fontSize:'0.88rem' }}>
                  <input type="checkbox" checked={form.Active} onChange={e => up('Active', e.target.checked)} style={{ width:15, height:15 }} />
                  Active
                </label>
              </div>

              <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
