import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { compressImage } from '../../utils/helpers';
import EmojiPicker from '../../components/EmojiPicker';

const BLANK = {
  Name:'', CategorySlug:'', Brand:'', Price:'', OriginalPrice:'',
  Description:'', Stock:'', Badge:'', Gradient:'', Color:'#0ea5e9',
  Emoji:'', Features:[], Colors:[], Images:[], Active: true,
};

export default function AdminProducts() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(BLANK);
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState('');
  const fileRef                       = useRef();

  useEffect(() => {
    Promise.all([api.get('/products?limit=200'), api.get('/categories')])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .finally(() => setLoading(false));
  }, []);

  // helpers
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(BLANK);
    setModal(true);
  }

  function openEdit(p) {
    setEditing(p.Id);
    setForm({
      Name: p.Name, CategorySlug: p.CategorySlug, Brand: p.Brand || '',
      Price: p.Price, OriginalPrice: p.OriginalPrice || '',
      Description: p.Description || '', Stock: p.Stock, Badge: p.Badge || '',
      Gradient: p.Gradient || '', Color: p.Color || '#0ea5e9',
      Emoji: p.Emoji || '',
      Features: p.features || [], Colors: p.colors || [],
      Images: p.images || [], Active: p.Active !== false,
    });
    setModal(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    setProducts(ps => ps.filter(p => p.Id !== id));
  }

  async function handleImageUpload(e) {
    const files = [...e.target.files];
    for (const f of files) {
      const b64 = await compressImage(f, 900, 900, 0.82);
      up('Images', form.Images.concat(b64));
    }
    e.target.value = '';
  }

  function addFeature() { up('Features', [...form.Features, '']); }
  function setFeature(i, v) { const a = [...form.Features]; a[i] = v; up('Features', a); }
  function removeFeature(i) { up('Features', form.Features.filter((_, x) => x !== i)); }

  function addColor() { up('Colors', [...form.Colors, { Name:'', Hex:'#000000' }]); }
  function setColorField(i, k, v) { const a = [...form.Colors]; a[i] = { ...a[i], [k]: v }; up('Colors', a); }
  function removeColor(i) { up('Colors', form.Colors.filter((_, x) => x !== i)); }

  function removeImage(i) { up('Images', form.Images.filter((_, x) => x !== i)); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, Price: +form.Price, OriginalPrice: +form.OriginalPrice || null, Stock: +form.Stock };
      let updated;
      if (editing) {
        const r = await api.put(`/products/${editing}`, payload);
        updated = r.data;
        setProducts(ps => ps.map(p => p.Id === editing ? updated : p));
      } else {
        const r = await api.post('/products', payload);
        updated = r.data;
        setProducts(ps => [updated, ...ps]);
      }
      setModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const shown = search ? products.filter(p => p.Name.toLowerCase().includes(search.toLowerCase())) : products;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Products</h1>
          <p className="admin-subtitle">{products.length} product{products.length !== 1 ? 's' : ''} in catalogue</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">+ Add Product</button>
      </div>

      <div className="admin-toolbar">
        <input className="admin-search" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text-dim)' }}>Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(p => (
                <tr key={p.Id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.Name} style={{ width:46, height:46, borderRadius:8, objectFit:'cover', background:'var(--bg)' }} />
                      ) : (
                        <div style={{ width:46, height:46, borderRadius:8, background:`var(--bg)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>📦</div>
                      )}
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{p.Name}</div>
                        {p.Brand && <div style={{ fontSize:'0.75rem', color:'var(--text-dim)' }}>{p.Brand}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:'0.85rem' }}>{p.CategorySlug}</td>
                  <td style={{ fontWeight:700, color:'var(--accent)' }}>₹{p.Price}</td>
                  <td>
                    <span style={{ color: p.Stock === 0 ? '#ef4444' : p.Stock < 5 ? '#f59e0b' : '#10b981', fontWeight:600, fontSize:'0.85rem' }}>
                      {p.Stock === 0 ? 'Out of Stock' : p.Stock}
                    </span>
                  </td>
                  <td>
                    <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:700, background: p.Active ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', color: p.Active ? '#10b981' : '#64748b' }}>
                      {p.Active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => openEdit(p)} className="icon-btn" title="Edit">✏️</button>
                      <button onClick={() => handleDelete(p.Id)} className="icon-btn icon-btn-danger" title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-dim)', padding:'32px' }}>No products found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setModal(false); }}>
          <div className="modal" style={{ maxWidth:'780px', maxHeight:'92vh', overflowY:'auto' }}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Product Name *</label>
                  <input className="form-control" required value={form.Name} onChange={e => up('Name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.CategorySlug} onChange={e => up('CategorySlug', e.target.value)}>
                    <option value="">Select category…</option>
                    {categories.map(c => <option key={c.Slug} value={c.Slug}>{c.Name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-control" value={form.Brand} onChange={e => up('Brand', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-control" type="number" min="0" required value={form.Price} onChange={e => up('Price', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Original Price (₹)</label>
                  <input className="form-control" type="number" min="0" value={form.OriginalPrice} onChange={e => up('OriginalPrice', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input className="form-control" type="number" min="0" value={form.Stock} onChange={e => up('Stock', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Badge</label>
                  <input className="form-control" placeholder="e.g. Hot Deal" value={form.Badge} onChange={e => up('Badge', e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={form.Description} onChange={e => up('Description', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Card Gradient</label>
                  <input className="form-control" placeholder="linear-gradient(135deg,#…,#…)" value={form.Gradient} onChange={e => up('Gradient', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Accent Color</label>
                  <input className="form-control" type="color" value={form.Color} onChange={e => up('Color', e.target.value)} style={{ height:42, padding:'4px 8px', cursor:'pointer' }} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Product Emoji (shown when no image)</label>
                  <EmojiPicker value={form.Emoji} onChange={v => up('Emoji', v)} placeholder="📦" />
                </div>
                <div className="form-group" style={{ display:'flex', alignItems:'center', gap:'10px', gridColumn:'1/-1' }}>
                  <input type="checkbox" id="prod-active" checked={form.Active} onChange={e => up('Active', e.target.checked)} style={{ width:16, height:16 }} />
                  <label htmlFor="prod-active" style={{ fontSize:'0.88rem', cursor:'pointer' }}>Active (visible in store)</label>
                </div>
              </div>

              {/* Features */}
              <div className="modal-section">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                  <label className="form-label" style={{ margin:0 }}>Features</label>
                  <button type="button" onClick={addFeature} className="btn btn-ghost" style={{ fontSize:'0.8rem', padding:'4px 10px' }}>+ Add</button>
                </div>
                {form.Features.map((feat, i) => (
                  <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                    <input className="form-control" value={feat} onChange={e => setFeature(i, e.target.value)} placeholder={`Feature ${i+1}`} />
                    <button type="button" onClick={() => removeFeature(i)} className="icon-btn icon-btn-danger">✕</button>
                  </div>
                ))}
              </div>

              {/* Colors */}
              <div className="modal-section">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                  <label className="form-label" style={{ margin:0 }}>Color Variants</label>
                  <button type="button" onClick={addColor} className="btn btn-ghost" style={{ fontSize:'0.8rem', padding:'4px 10px' }}>+ Add</button>
                </div>
                {form.Colors.map((c, i) => (
                  <div key={i} style={{ display:'flex', gap:'8px', marginBottom:'8px', alignItems:'center' }}>
                    <input className="form-control" value={c.Name} onChange={e => setColorField(i, 'Name', e.target.value)} placeholder="Color name" />
                    <input type="color" value={c.Hex} onChange={e => setColorField(i, 'Hex', e.target.value)} style={{ width:50, height:40, borderRadius:6, border:'1px solid var(--card-border)', padding:'3px', cursor:'pointer', background:'var(--card)' }} />
                    <button type="button" onClick={() => removeColor(i)} className="icon-btn icon-btn-danger">✕</button>
                  </div>
                ))}
              </div>

              {/* Images */}
              <div className="modal-section">
                <label className="form-label" style={{ marginBottom:'10px', display:'block' }}>Product Images</label>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'10px' }}>
                  {form.Images.map((img, i) => (
                    <div key={i} style={{ position:'relative' }}>
                      <img src={img} alt="" style={{ width:80, height:80, borderRadius:8, objectFit:'cover', border:'1px solid var(--card-border)' }} />
                      <button type="button" onClick={() => removeImage(i)}
                        style={{ position:'absolute', top:-6, right:-6, width:20, height:20, borderRadius:'50%', background:'#ef4444', border:'none', color:'#fff', fontSize:'0.7rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ width:80, height:80, borderRadius:8, border:'2px dashed var(--card-border)', background:'var(--bg)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px', color:'var(--text-dim)', fontSize:'0.72rem' }}>
                    <span style={{ fontSize:'1.4rem' }}>+</span>Upload
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleImageUpload} />
                </div>
              </div>

              <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', paddingTop:'8px' }}>
                <button type="button" onClick={() => setModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Product' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
