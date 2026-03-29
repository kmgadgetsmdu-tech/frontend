import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { fmt, statusBadge, compressImage } from '../../utils/helpers';

const STATUSES = ['pending','processing','shipped','delivered','cancelled'];

export default function AdminOrders() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [invoice,  setInvoice]  = useState(null);
  const [newSt,    setNewSt]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [upInv,    setUpInv]    = useState(false);
  const fileRef                 = useRef();

  useEffect(() => {
    const p = filter ? `?status=${filter}` : '';
    api.get(`/orders${p}`).then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, [filter]);

  async function openOrder(order) {
    setSelected(order);
    setNewSt(order.Status);
    setInvoice(null);
    setUpInv(false);
    api.get(`/orders/${order.Id}/invoice`).then(r => setInvoice(r.data)).catch(() => {});
  }

  async function handleStatusUpdate() {
    if (newSt === selected.Status) return;
    setSaving(true);
    await api.patch(`/orders/${selected.Id}/status`, { status: newSt });
    setOrders(os => os.map(o => o.Id === selected.Id ? { ...o, Status: newSt } : o));
    setSelected(prev => ({ ...prev, Status: newSt }));
    setSaving(false);
  }

  async function handleInvoiceUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUpInv(true);
    try {
      let fileData;
      if (file.type.startsWith('image/')) {
        fileData = await compressImage(file, 1200, 1200, 0.88);
      } else {
        fileData = await new Promise(res => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.readAsDataURL(file);
        });
      }
      const r = await api.post(`/orders/${selected.Id}/invoice`, { fileName: file.name, fileData });
      setInvoice(r.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUpInv(false);
      e.target.value = '';
    }
  }

  async function handleRemoveInvoice() {
    if (!window.confirm('Remove this invoice?')) return;
    await api.delete(`/orders/${selected.Id}/invoice`);
    setInvoice(null);
  }

  function viewInvoice() {
    if (!invoice) return;
    const win = window.open('', '_blank');
    if (invoice.FileData.startsWith('data:application/pdf')) {
      win.document.write(`<html><body style="margin:0"><iframe src="${invoice.FileData}" style="width:100%;height:100vh;border:none"></iframe></body></html>`);
    } else {
      win.document.write(`<html><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${invoice.FileData}" style="max-width:100%;max-height:100vh"></body></html>`);
    }
    win.document.close();
  }

  function printShippingLabel(o) {
    if (!o) return;
    const addr = o.address || {};
    const fmtPrice = v => '₹' + Number(v).toLocaleString('en-IN');
    const win = window.open('', '_blank', 'width=680,height=760');
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8"/><title>Label – ${o.Id}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Arial,sans-serif;font-size:13px;background:#fff;color:#000}
        .wrap{padding:16px}
        .no-print-bar{background:#f3f4f6;padding:12px 16px;text-align:center;border-bottom:2px solid #000;display:flex;align-items:center;justify-content:space-between}
        .print-btn{padding:9px 24px;background:#111;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:bold;cursor:pointer}
        .label{width:100%;max-width:420px;margin:16px auto;border:2px solid #000;border-radius:6px;overflow:hidden}
        .sec{padding:12px 16px;border-bottom:1px dashed #ccc}
        .sec:last-child{border-bottom:none}
        .sec-title{font-size:9px;text-transform:uppercase;letter-spacing:1.2px;color:#888;margin-bottom:6px;font-weight:700}
        .name{font-size:17px;font-weight:800;margin-bottom:4px}
        .addr{font-size:13px;line-height:1.8}
        .order-id{font-size:22px;font-weight:900;text-align:center;letter-spacing:3px;padding:10px 0;border-bottom:1px dashed #ccc;margin-bottom:8px}
        .badge{display:inline-block;padding:3px 12px;background:#fef3c7;border:1px solid #f59e0b;border-radius:4px;font-weight:700;font-size:12px}
        .item-row{display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px dotted #eee}
        .item-row:last-of-type{border-bottom:none}
        .total-row{display:flex;justify-content:space-between;font-size:15px;font-weight:800;margin-top:8px;padding-top:8px;border-top:2px solid #000}
        .cut-area{text-align:center;padding:10px 0}
        .cut-line{border:none;border-top:2px dashed #aaa;margin:0 20px}
        .cut-text{font-size:11px;color:#999;margin-top:4px;letter-spacing:1px}
        @media print{.no-print-bar{display:none}}
      </style></head><body>
      <div class="no-print-bar">
        <strong>Shipping Label &mdash; ${o.Id}</strong>
        <button class="print-btn" onclick="window.print()">🖨️ Print</button>
      </div>
      <div class="wrap">
        <div class="label">
          <div class="sec">
            <div class="sec-title">📦 From</div>
            <div class="name">KM Gadgets</div>
            <div class="addr">Kalyani Marketing and Gadgets<br>Madurai, Tamil Nadu &ndash; 625001<br>📞 7010913743</div>
          </div>
          <div class="sec">
            <div class="sec-title">🏠 Ship To</div>
            <div class="name">${o.UserName || ''}</div>
            <div class="addr">${addr.Line1 || ''}${addr.Line2 ? ', ' + addr.Line2 : ''}<br>${addr.City || ''}, ${addr.State || ''} &ndash; ${addr.Pincode || ''}<br>📞 ${o.UserPhone || ''}${o.UserEmail ? '<br>✉️ ' + o.UserEmail : ''}</div>
          </div>
          <div class="sec">
            <div class="order-id">${o.Id}</div>
            <div style="text-align:center;margin-bottom:8px">
              <span class="badge">${o.Payment || ''}</span>
            </div>
            ${(o.items || []).map(i => `<div class="item-row"><span>${i.name || i.Name || ''} &times;${i.quantity || i.Quantity || 0}</span><span>${fmtPrice((i.price || i.Price || 0) * (i.quantity || i.Quantity || 0))}</span></div>`).join('')}
            ${o.CodFee ? `<div class="item-row"><span>COD Advance (paid)</span><span>${fmtPrice(o.CodFee)}</span></div>` : ''}
            <div class="total-row"><span>Total</span><span>${fmtPrice(o.Total)}</span></div>
            ${o.Payment === 'COD' ? `<div style="margin-top:6px;padding:5px 8px;background:#fef3c7;border:1px solid #f59e0b;border-radius:4px;font-size:11px;font-weight:700;text-align:center">COLLECT AT DOOR: ${fmtPrice(Number(o.Total) - (Number(o.CodFee) || 0))}</div>` : ''}
            <div style="font-size:11px;color:#666;margin-top:6px">Date: ${o.Date || ''}</div>
            ${o.Notes ? `<div style="margin-top:8px;padding:6px 10px;background:#fef9c3;border-radius:4px;font-size:11px"><strong>Note:</strong> ${o.Notes}</div>` : ''}
          </div>
        </div>
        <div class="cut-area">
          <hr class="cut-line"/>
          <div class="cut-text">✂ &mdash; &mdash; &mdash; CUT HERE &mdash; &mdash; &mdash; ✂</div>
        </div>
      </div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  const shown = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || o.Id.toLowerCase().includes(q) || (o.UserName||'').toLowerCase().includes(q) || (o.UserEmail||'').toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-title">Orders</h1>
          <p className="admin-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="admin-toolbar" style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'20px' }}>
        <input className="admin-search" placeholder="Search by order ID, name, email…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex:1 }} />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="admin-search" style={{ maxWidth:200 }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text-dim)' }}>Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {shown.map(o => {
                const sb = statusBadge(o.Status);
                return (
                  <tr key={o.Id}>
                    <td style={{ fontFamily:'monospace', fontSize:'0.82rem', color:'var(--accent)' }}>{o.Id}</td>
                    <td>
                      <div style={{ fontWeight:500, fontSize:'0.88rem' }}>{o.UserName}</div>
                      <div style={{ fontSize:'0.74rem', color:'var(--text-dim)' }}>{o.UserEmail}</div>
                    </td>
                    <td style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{o.itemCount || o.items?.length || '—'}</td>
                    <td style={{ fontWeight:700 }}>{fmt(o.Total)}</td>
                    <td style={{ fontSize:'0.82rem' }}>{o.Payment}</td>
                    <td><span className={`badge ${sb.cls}`}>{sb.label}</span></td>
                    <td style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{o.Date}</td>
                    <td>
                      <button onClick={() => openOrder(o)} className="icon-btn" title="View details">🔍</button>
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--text-dim)', padding:'32px' }}>No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Order Detail Modal ── */}
      {selected && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal" style={{ maxWidth:'700px', maxHeight:'92vh', overflowY:'auto' }}>
            <div className="modal-header">
              <h3>Order {selected.Id}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="modal-body">
              {/* Customer + Address */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'20px' }}>
                <div style={{ background:'var(--bg)', borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-dim)', marginBottom:8 }}>Customer</div>
                  <div style={{ fontWeight:600, marginBottom:4 }}>{selected.UserName}</div>
                  <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:2 }}>{selected.UserEmail}</div>
                  <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{selected.UserPhone}</div>
                </div>
                <div style={{ background:'var(--bg)', borderRadius:10, padding:14 }}>
                  <div style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-dim)', marginBottom:8 }}>Delivery Address</div>
                  <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', lineHeight:1.8 }}>
                    {selected.address?.Line1}{selected.address?.Line2 ? `, ${selected.address.Line2}` : ''}<br />
                    {selected.address?.City}, {selected.address?.State} – {selected.address?.Pincode}
                  </div>
                </div>
              </div>

              {/* Items */}
              {selected.items?.map((item, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'var(--bg)', borderRadius:8, marginBottom:8, fontSize:'0.88rem' }}>
                  <span style={{ fontWeight:500 }}>{item.name}</span>
                  <span style={{ color:'var(--text-muted)' }}>×{item.quantity}</span>
                  <span style={{ color:'var(--accent)', fontWeight:700 }}>{fmt(item.price * item.quantity)}</span>
                </div>
              ))}

              <div style={{ borderTop:'1px solid var(--card-border)', paddingTop:12, marginTop:8, display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:'1.08rem', color:'var(--accent)', marginBottom:20 }}>
                <span>Total</span><span>{fmt(selected.Total)}</span>
              </div>

              {/* Print Label + Payment info */}
              <div style={{ display:'flex', gap:'10px', marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:20, fontSize:'0.78rem', fontWeight:700, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', color:'#f59e0b' }}>{selected.Payment}</span>
                {selected.Payment === 'COD' && selected.CodFee > 0 && (
                  <span style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>COD Advance: {fmt(selected.CodFee)} · Collect at door: {fmt(selected.Total - (selected.CodFee || 0))}</span>
                )}
                <div style={{ flex:1 }} />
                <button onClick={() => printShippingLabel(selected)} className="btn btn-ghost" style={{ padding:'8px 16px', fontSize:'0.85rem' }}>
                  🖨️ Print Label
                </button>
              </div>

              {/* Status Update */}
              <div style={{ background:'var(--bg)', borderRadius:10, padding:16, marginBottom:16 }}>
                <div style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-dim)', marginBottom:10 }}>Update Status</div>
                <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
                  <select value={newSt} onChange={e => setNewSt(e.target.value)} className="form-control" style={{ maxWidth:220 }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                  <button onClick={handleStatusUpdate} className="btn btn-primary" style={{ padding:'9px 20px' }} disabled={saving || newSt === selected.Status}>
                    {saving ? 'Saving…' : 'Update'}
                  </button>
                </div>
              </div>

              {/* Invoice */}
              {(selected.Status === 'shipped' || selected.Status === 'delivered') && (
                <div style={{ background:'var(--bg)', borderRadius:10, padding:16 }}>
                  <div style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-dim)', marginBottom:10 }}>📄 Invoice</div>
                  {invoice ? (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                      <div>
                        <div style={{ fontWeight:600, color:'var(--success)', marginBottom:2 }}>{invoice.FileName}</div>
                        <div style={{ fontSize:'0.74rem', color:'var(--text-dim)' }}>Uploaded: {invoice.UploadedAt}</div>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={viewInvoice} className="btn btn-ghost" style={{ padding:'7px 14px', fontSize:'0.82rem' }}>👁 View</button>
                        <a href={invoice.FileData} download={invoice.FileName} className="btn btn-primary" style={{ padding:'7px 14px', fontSize:'0.82rem', textDecoration:'none', display:'inline-flex', alignItems:'center' }}>⬇ Download</a>
                        <button onClick={handleRemoveInvoice} className="icon-btn icon-btn-danger">🗑️</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:12 }}>No invoice uploaded yet.</p>
                      <button onClick={() => fileRef.current?.click()} className="btn btn-ghost" style={{ fontSize:'0.85rem' }} disabled={upInv}>
                        {upInv ? '⏳ Uploading…' : '📤 Upload Invoice (PDF or Image)'}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={handleInvoiceUpload} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
