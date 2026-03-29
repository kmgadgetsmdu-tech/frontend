import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import TestimonialCarousel from '../components/TestimonialCarousel';
import WhyStory from '../components/WhyStory';

export default function Home() {
  const [banners,    setBanners]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured,   setFeatured]   = useState([]);
  const [hotDeals,   setHotDeals]   = useState([]);
  const [reviews,    setReviews]    = useState([]);
  const [story,      setStory]      = useState(null);
  const [bannerIdx,  setBannerIdx]  = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get('/banners').then(r      => setBanners(r.data)).catch(() => {});
    api.get('/categories').then(r   => setCategories(r.data)).catch(() => {});
    api.get('/products?sort=rating&limit=4').then(r => setFeatured(r.data)).catch(() => {});
    api.get('/products?hot=true&limit=6').then(r => setHotDeals(r.data)).catch(() => {});
    api.get('/reviews').then(r      => setReviews(r.data)).catch(() => {});
    api.get('/story').then(r        => setStory(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    timerRef.current = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [banners]);

  function goTo(i) {
    clearInterval(timerRef.current);
    setBannerIdx(i);
    timerRef.current = setInterval(() => setBannerIdx(idx => (idx + 1) % banners.length), 5000);
  }

  const banner = banners[bannerIdx];

  return (
    <main>
      {/* ── Hero Banner Slider ── */}
      <section className="hero-section">
        <div className="banner-slider" style={{ minHeight: banners.length ? '520px' : '0' }}>
          {banners.map((b, i) => (
            <div key={b.id} className={`banner-slide${i === bannerIdx ? ' active' : ''}`}
              style={{ background: b.gradient }}>
              <div className="banner-content">
                <div className="banner-text">
                  <div className="banner-offer">{b.offer}</div>
                  <h1>{b.title} <span></span></h1>
                  <p>{b.subtitle}</p>
                  <div className="banner-btns">
                    <Link to={b.link || '/shop'} className="btn-primary">{b.cta}</Link>
                    <Link to="/shop" className="btn-outline">Explore All →</Link>
                  </div>
                </div>
                <div className="banner-icon-wrap">{b.icon}</div>
              </div>
            </div>
          ))}
        </div>
        {banners.length > 1 && (
          <>
            <button className="slider-arrow slider-prev" onClick={() => goTo((bannerIdx - 1 + banners.length) % banners.length)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button className="slider-arrow slider-next" onClick={() => goTo((bannerIdx + 1) % banners.length)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
            <div className="slider-controls">
              {banners.map((_, i) => (
                <button key={i} className={`dot${i === bannerIdx ? ' active' : ''}`} onClick={() => goTo(i)} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── Stats Bar ── */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <div className="stat-num">5000+</div>
            <div className="stat-label">Happy Customers</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">200+</div>
            <div className="stat-label">Products Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">8+</div>
            <div className="stat-label">Years of Excellence</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">100%</div>
            <div className="stat-label">Quality Checked</div>
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="section" style={{ paddingTop: '64px' }}>
          <div className="container">
            <div className="section-header">
              <h2>Shop by Category</h2>
              <p>Explore our wide range of premium electronic gadgets</p>
              <div className="section-divider" />
            </div>
            <div className="categories-grid">
              {categories.map(c => (
                <Link to={`/shop?category=${c.slug}`} key={c.id} className="cat-card">
                  <div className="cat-icon">{c.icon}</div>
                  <div className="cat-name">{c.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="section" style={{ background:'rgba(255,255,255,0.01)', borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <div className="container">
            <div className="section-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', textAlign:'left', marginBottom:'36px' }}>
              <div>
                <h2 style={{ marginBottom:'8px' }}>Featured Products</h2>
                <p>Best picks, hand-curated for you</p>
              </div>
              <Link to="/shop" className="btn-outline" style={{ whiteSpace:'nowrap', padding:'10px 24px', fontSize:'0.9rem' }}>View All →</Link>
            </div>
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Story ── */}
      {story?.enabled && story.chapters?.length > 0 && (
        <WhyStory chapters={story.chapters} />
      )}

      {/* ── Hot Deals ── */}
      {hotDeals.length > 0 && (
        <section className="section-sm dark-section" style={{ background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' }}>
          <div className="container">
            <div className="section-header">
              <h2>Hot Deals Today</h2>
              <p>Limited time offers — grab them before they are gone!</p>
              <div className="section-divider" />
            </div>
            <div className="products-grid">
              {hotDeals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div style={{ textAlign:'center', marginTop:'32px' }}>
              <Link to="/shop" className="btn-outline">View All Products</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {reviews && reviews.length > 0 ? (
        <TestimonialCarousel reviews={reviews} />
      ) : (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>What Our Customers Say</h2>
              <p>Real reviews from real buyers across Madurai</p>
              <div className="section-divider" />
            </div>
            <div className="testimonials-grid">
              {[
                { name:'Rajesh K.', text:'Bought a smartwatch for my son. Excellent quality, works perfectly. Price was much cheaper than other shops. Highly recommended!' },
                { name:'Priya S.',  text:'The earbuds sound amazing. Delivery was super fast. Customer support helped me pick the right model for my budget.' },
                { name:'Arun P.',   text:'Ordered the BoomBox speaker. Rich bass, excellent build. Genuine product. Will definitely buy again from KM Gadgets!' },
              ].map((t, i) => (
                <div key={i} className="testimonial-card">
                  <div className="t-quote">"</div>
                  <p className="t-text">{t.text}</p>
                  <div className="t-author">
                    <div className="t-avatar" style={{ background:'linear-gradient(135deg,var(--accent),var(--accent2))' }}>{t.name[0]}</div>
                    <div>
                      <div className="t-name">{t.name}</div>
                      <div className="t-stars">★★★★★</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
