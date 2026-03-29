import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/admin.css';

const NAV = [
  { to:'/admin',            icon:'📊', label:'Dashboard',  end:true },
  { to:'/admin/products',   icon:'📦', label:'Products'  },
  { to:'/admin/categories', icon:'🏷️', label:'Categories'},
  { to:'/admin/orders',     icon:'🧾', label:'Orders'    },
  { to:'/admin/banners',    icon:'🖼️', label:'Banners'   },
  { to:'/admin/story',      icon:'📖', label:'Why Story' },
];

export default function AdminLayout() {
  const { user, logout }    = useAuth();
  const { theme, toggleTheme: toggle }   = useTheme();
  const navigate            = useNavigate();
  const [open, setOpen]     = useState(false);   // mobile sidebar

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={`admin-shell${open ? ' sidebar-open' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⚡</div>
          <span className="logo-text">KM Gadgets</span>
          <span className="logo-badge">Admin</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="sidebar-icon">{n.icon}</span>
              <span className="sidebar-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
          <div className="su-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
              <div className="su-info">
                <div className="su-name">{user?.name}</div>
              <div className="su-role">Administrator</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
            <button onClick={toggle} className="sidebar-btn" title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <a href="/" target="_blank" className="sidebar-btn" title="View store">🛍️</a>
            <button onClick={handleLogout} className="sidebar-btn sidebar-btn-danger" title="Logout">🚪</button>
          </div>
        </div>
      </aside>

      {/* ── Overlay (mobile) ── */}
      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      {/* ── Main ── */}
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="sidebar-toggle" onClick={() => setOpen(o => !o)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={22} height={22}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div className="topbar-right">
            <button onClick={toggle} className="icon-btn">{theme === 'dark' ? '☀️' : '🌙'}</button>
            <span style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{user?.email}</span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
