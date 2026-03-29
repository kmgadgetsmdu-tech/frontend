import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useCart }  from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount }    = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [settings, setSettings]   = useState({
    CompanyName: 'KM Gadgets',
    CompanySubtitle: 'Kalyani Marketing & Gadgets',
    LogoData: null
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }

  function doSearch(e) {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  }

  function handleLogout() { logout(); navigate('/'); }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          {settings.LogoData ? (
            <img src={settings.LogoData} alt="Logo" style={{ height: '50px', width: 'auto' }} />
          ) : (
            <div className="logo-icon">KMG</div>
          )}
          <div className="logo-text">
            <div className="name">{settings.CompanyName}</div>
            <div className="tagline">{settings.CompanySubtitle}</div>
          </div>
        </Link>

        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to={'/shop?category=smartwatch'}>Watches</NavLink>
          <NavLink to={'/shop?category=headset'}>Headsets</NavLink>
          <NavLink to={'/shop?category=speaker'}>Speakers</NavLink>
          {user && <NavLink to="/orders">My Orders</NavLink>}
        </div>

        <form className="nav-search" onSubmit={doSearch}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Search gadgets…" autoComplete="off" />
        </form>

        <div className="nav-actions">
          <Link to="/cart" className="icon-btn" title="Cart">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            {cartCount > 0 && <span id="cart-count">{cartCount > 99 ? '99+' : cartCount}</span>}
          </Link>

          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            <span>{theme === 'light' ? '☀️' : '🌙'}</span>
          </button>

          {user
            ? <button className="btn-login" onClick={handleLogout}><span>Logout</span></button>
            : <Link to="/login" className="btn-login"><span>Login</span></Link>
          }
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(v => !v)}>
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu open">
          <NavLink to="/"        onClick={() => setMenuOpen(false)}>🏠 Home</NavLink>
          <NavLink to="/shop"    onClick={() => setMenuOpen(false)}>🛍️ Shop</NavLink>
          <NavLink to="/shop?category=smartwatch" onClick={() => setMenuOpen(false)}>⌚ Smart Watches</NavLink>
          <NavLink to="/shop?category=headset"    onClick={() => setMenuOpen(false)}>🎧 Headsets</NavLink>
          <NavLink to="/shop?category=speaker"    onClick={() => setMenuOpen(false)}>🔊 Speakers</NavLink>
          <NavLink to="/cart"    onClick={() => setMenuOpen(false)}>🛒 Cart {cartCount > 0 ? `(${cartCount})` : ''}</NavLink>
          {user
            ? <><NavLink to="/orders" onClick={() => setMenuOpen(false)}>📦 My Orders</NavLink>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  style={{ padding:'12px 4px', color:'var(--hot)', background:'none', border:'none', borderBottom:'1px solid var(--card-border)', textAlign:'left', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'1rem' }}>
                  👤 Logout
                </button></>
            : <NavLink to="/login" onClick={() => setMenuOpen(false)}>👤 Login / Register</NavLink>
          }
          <a href="#contact" onClick={() => setMenuOpen(false)}>📍 Contact</a>
        </div>
      )}
    </nav>
  );
}
