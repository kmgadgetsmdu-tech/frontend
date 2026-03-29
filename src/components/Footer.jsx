import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo-nav">KM Gadgets</div>
          <p>Kalyani Marketing and Gadgets — Madurai's trusted premium gadget store since 2016. Quality checked products at the best prices.</p>
          <div className="contact-item"><span className="contact-icon">📞</span><span className="contact-text"><a href="tel:7010913743">7010913743</a></span></div>
          <div className="contact-item"><span className="contact-icon">📍</span><span className="contact-text">Madurai, Tamil Nadu</span></div>
          <div className="contact-item"><span className="contact-icon">🕐</span><span className="contact-text">Mon – Sun: 9 AM – 8 PM</span></div>
          <div className="contact-item"><span className="contact-icon">📅</span><span className="contact-text">Established 2016</span></div>
          <div className="social-links">
            <a href="#" className="social-btn" title="WhatsApp">💬</a>
            <a href="#" className="social-btn" title="Facebook">📘</a>
            <a href="#" className="social-btn" title="Instagram">📸</a>
            <a href="#" className="social-btn" title="YouTube">▶️</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/shop?category=smartwatch">Smart Watches</Link></li>
            <li><Link to="/shop?category=headset">Headsets</Link></li>
            <li><Link to="/shop?category=speaker">Speakers</Link></li>
            <li><Link to="/shop?category=earbuds">Earbuds</Link></li>
            <li><Link to="/cart">My Cart</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Return Policy</a></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">FAQs</a></li>
            <li><Link to="/admin" style={{ color:'var(--text-dim)' }}>Admin Portal</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Get the latest deals and new arrivals straight to your inbox.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button type="button">→</button>
          </div>
          <div style={{ marginTop:'24px' }}>
            <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px' }}>We Accept</div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {['COD','UPI','Cards','Net Banking'].map(m => (
                <span key={m} style={{ padding:'4px 12px', background:'var(--card)', border:'1px solid var(--card-border)', borderRadius:'6px', fontSize:'0.75rem', fontWeight:600 }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} <strong>Kalyani Marketing and Gadgets</strong>. All rights reserved. Made with ❤️ in Madurai.
          &nbsp;|&nbsp; <Link to="/admin">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
