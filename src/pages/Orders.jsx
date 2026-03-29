import { useEffect, useState } from 'react';
import api from '../api/axios';
import { fmt, statusBadge } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';

export default function Orders() {
  const { user }    = useAuth();
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('');
  const [selected,  setSelected]  = useState(null);
  const [invoice,   setInvoice]   = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [hasReview,  setHasReview]  = useState(false);

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    api.get(`/orders${params}`).then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  async function openOrder(order) {
    console.log('Opening order:', { id: order.Id, status: order.Status, userId: order.UserId });
    setSelected(order);
    setInvoice(null);
    setShowReview(false);
    setHasReview(false);
    if (order.Status === 'shipped' || order.Status === 'delivered') {
      api.get(`/orders/${order.Id}/invoice`).then(r => setInvoice(r.data)).catch(() => {});
    }
    if (order.Status === 'delivered') {
      api.get(`/reviews/order/${order.Id}`).then(r => setHasReview(r.data.hasReview)).catch(() => {});
    }
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

  const shown = filter ? orders.filter(o => o.Status === filter) : orders;

  return (
    <main style={{ paddingTop:'100px' }}>
      <div className="container">
        <div className="orders-header">
          <div>
            <h2>My Orders</h2>
            {user && <p style={{ color:'var(--text-muted)', marginTop:'4px', fontSize:'0.9rem' }}>Welcome, {user.name} 👋</p>}
          </div>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ padding:'9px 12px', borderRadius:'8px', background:'var(--card)', border:'1px solid var(--card-border)', color:'var(--text)', fontSize:'0.85rem' }}>
              <option value="">All Orders</option>
              {['pending','processing','shipped','delivered','cancelled'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px', color:'var(--text-dim)' }}>Loading…</div>
        ) : shown.length === 0 ? (
          <div className="cart-empty" style={{ display:'flex' }}>
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>You haven't placed any orders. <a href="/shop">Start shopping →</a></p>
          </div>
        ) : (
          <div id="orders-container">
            {shown.map(o => {
              const sb = statusBadge(o.Status);
              return (
                <div key={o.Id} className="order-card">
                  <div className="order-top">
                    <div>
                      <div className="order-id">🧾 {o.Id}</div>
                      <div className="order-date">{o.Date} &nbsp;·&nbsp; {o.Payment}</div>
                    </div>
                    <span className={`badge ${sb.cls}`}>{sb.label}</span>
                  </div>
                  <div className="order-items">
                    {o.items?.map((i, idx) => (
                      <div key={idx} className="order-item-row">
                        <span className="order-item-name">{i.name}</span>
                        <span className="order-item-qty">×{i.quantity}</span>
                        <span style={{ color:'var(--accent)', fontWeight:600 }}>{fmt(i.price * i.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-bottom">
                    <div style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>
                      {o.DeliveryDate ? `✅ Delivered: ${o.DeliveryDate}` : o.Status === 'shipped' ? '🚚 In Transit' : '📋 Processing your order'}
                    </div>
                    <div className="order-total">{fmt(o.Total)}</div>
                    <button onClick={() => openOrder(o)}
                      style={{ padding:'8px 16px', borderRadius:'8px', background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.2)', color:'var(--accent)', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }}>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Order Detail Modal ── */}
      {selected && (
        <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal" style={{ maxWidth:'650px' }}>
            <div className="modal-header">
              <h3>Order {selected.Id}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px' }}>
                <div style={{ background:'var(--bg)', borderRadius:'10px', padding:'14px' }}>
                  <div style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-dim)', marginBottom:'8px' }}>Order Info</div>
                  <div style={{ marginBottom:'6px' }}><strong>Status:</strong> <span className={`badge ${statusBadge(selected.Status).cls}`}>{statusBadge(selected.Status).label}</span></div>
                  <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'4px' }}>Date: <strong style={{ color:'var(--text)' }}>{selected.Date}</strong></div>
                  <div style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>Payment: <strong style={{ color:'var(--text)' }}>{selected.Payment}</strong></div>
                </div>
                <div style={{ background:'var(--bg)', borderRadius:'10px', padding:'14px' }}>
                  <div style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-dim)', marginBottom:'8px' }}>Delivery Address</div>
                  <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', lineHeight:1.8 }}>
                    {selected.address?.Line1}{selected.address?.Line2 ? `, ${selected.address.Line2}` : ''}<br />
                    {selected.address?.City}, {selected.address?.State} – {selected.address?.Pincode}
                  </div>
                </div>
              </div>

              {selected.items?.map((i, idx) => (
                <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'var(--bg)', borderRadius:'8px', marginBottom:'8px', fontSize:'0.88rem' }}>
                  <span style={{ fontWeight:500 }}>{i.name}</span>
                  <span style={{ color:'var(--text-muted)' }}>×{i.quantity}</span>
                  <span style={{ color:'var(--accent)', fontWeight:700 }}>{fmt(i.price * i.quantity)}</span>
                </div>
              ))}

              <div style={{ borderTop:'1px solid var(--card-border)', paddingTop:'12px', marginTop:'8px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-head)', fontWeight:800, fontSize:'1.1rem', color:'var(--accent)' }}>
                  <span>Total</span><span>{fmt(selected.Total)}</span>
                </div>
              </div>

              {/* Invoice */}
              {invoice && (
                <div style={{ marginTop:'16px', padding:'14px 16px', background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.22)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
                  <div>
                    <div style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-dim)', marginBottom:'4px' }}>📄 Invoice</div>
                    <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--success)' }}>{invoice.FileName}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-dim)', marginTop:'2px' }}>Uploaded: {invoice.UploadedAt}</div>
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={viewInvoice}
                      style={{ padding:'8px 16px', borderRadius:'8px', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', color:'var(--success)', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }}>
                      👁 View
                    </button>
                    <a href={invoice.FileData} download={invoice.FileName}
                      style={{ padding:'8px 16px', borderRadius:'8px', background:'var(--accent2)', color:'#fff', fontSize:'0.82rem', fontWeight:600, display:'inline-flex', alignItems:'center', gap:'6px', textDecoration:'none' }}>
                      ⬇ Download
                    </a>
                  </div>
                </div>
              )}

              {/* Review Section */}
              {selected.Status === 'delivered' && (
                <div style={{ marginTop:'20px', padding:'16px', background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'10px' }}>
                  {showReview ? (
                    <ReviewForm
                      orderId={selected.Id}
                      onClose={() => setShowReview(false)}
                      onSuccess={() => {
                        setHasReview(true);
                        setShowReview(false);
                      }}
                    />
                  ) : hasReview ? (
                    <div style={{ textAlign:'center', padding:'12px' }}>
                      <div style={{ fontSize:'1.8rem', marginBottom:'8px' }}>✅</div>
                      <p style={{ color:'var(--success)', fontWeight:600, marginBottom:'4px' }}>Thank you for your review!</p>
                      <p style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>Your feedback helps us improve the service</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ marginBottom:'12px', color:'var(--text-muted)' }}>⭐ How was your experience with this order?</p>
                      <button
                        onClick={() => setShowReview(true)}
                        style={{ padding:'10px 20px', borderRadius:'8px', background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.4)', color:'var(--accent)', fontSize:'0.9rem', fontWeight:600, cursor:'pointer', width:'100%' }}>
                        Share Your Feedback
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
