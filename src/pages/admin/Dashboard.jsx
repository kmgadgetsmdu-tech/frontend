import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { fmt } from '../../utils/helpers';

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setL]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders/stats'),
      api.get('/orders?limit=5'),
    ]).then(([s, o]) => {
      setStats(s.data);
      setOrders(Array.isArray(o.data) ? o.data.slice(0,5) : []);
    }).catch(() => {}).finally(() => setL(false));
  }, []);

  const cards = stats ? [
    { label:'Total Orders',  value:stats.total      || 0, icon:'📦', cls:'',          bg:'linear-gradient(135deg,#0ea5e9,#6366f1)' },
    { label:'Pending',       value:stats.pending     || 0, icon:'⏳', cls:'pending',   bg:'linear-gradient(135deg,#f59e0b,#ef4444)' },
    { label:'Processing',    value:stats.processing  || 0, icon:'⚙️', cls:'processing', bg:'linear-gradient(135deg,#8b5cf6,#6366f1)' },
    { label:'Shipped',       value:stats.shipped     || 0, icon:'🚚', cls:'shipped',   bg:'linear-gradient(135deg,#0ea5e9,#06b6d4)' },
    { label:'Delivered',     value:stats.delivered   || 0, icon:'✅', cls:'delivered', bg:'linear-gradient(135deg,#10b981,#059669)' },
    { label:'Revenue',       value:fmt(stats.revenue || 0), icon:'💰', cls:'',         bg:'linear-gradient(135deg,#f59e0b,#eab308)' },
  ] : [];

  const STATUS_BADGE = { pending:'#f59e0b', processing:'#8b5cf6', shipped:'#0ea5e9', delivered:'#10b981', cancelled:'#ef4444' };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-title">Dashboard</h1>
        <p className="admin-subtitle">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text-dim)' }}>Loading…</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="stat-grid">
            {cards.map((c,i) => (
              <div key={i} className="stat-card" style={{ background: c.bg }}>
                <div className="stat-icon">{c.icon}</div>
                <div className="stat-value">{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="admin-section">
            <div className="section-head">
              <h3>Recent Orders</h3>
              <a href="/admin/orders" style={{ fontSize:'0.82rem', color:'var(--accent)' }}>View all →</a>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.Id}>
                      <td style={{ fontFamily:'monospace', fontSize:'0.82rem', color:'var(--accent)' }}>{o.Id}</td>
                      <td>{o.UserName}<br/><small style={{ color:'var(--text-dim)', fontSize:'0.75rem' }}>{o.UserEmail}</small></td>
                      <td style={{ fontWeight:700 }}>{fmt(o.Total)}</td>
                      <td>
                        <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:700, background:`${STATUS_BADGE[o.Status] || '#64748b'}22`, color: STATUS_BADGE[o.Status] || '#64748b', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                          {o.Status}
                        </span>
                      </td>
                      <td style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{o.Date}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--text-dim)', padding:'24px' }}>No orders yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
