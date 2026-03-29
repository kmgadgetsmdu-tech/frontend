import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { fmt, disc, stars } from '../utils/helpers';
import { useCart }  from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Product() {
  const { id }        = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [qty, setQty]         = useState(1);
  const [imgIdx, setImgIdx]   = useState(0);
  const [added, setAdded]     = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(r => setProduct(r.data)).catch(() => {});
  }, [id]);

  if (!product) return (
    <main style={{ paddingTop:'120px', textAlign:'center', color:'var(--text-dim)' }}>Loading…</main>
  );

  function handleAdd() {
    addToCart(product, qty);
    showToast(`${product.Name} added to cart 🛒`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const discount = disc(product.Price, product.OriginalPrice);
  const img      = product.images?.[imgIdx];

  return (
    <main>
      <div className="product-detail">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{product.Name}</span>
        </div>

        {/* Main grid */}
        <div className="pd-grid">
          {/* Image column */}
          <div className="pd-img-wrap">
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background: product.Gradient || 'var(--bg2)', borderRadius:'16px', overflow:'hidden' }}>
              {img
                ? <img src={img} alt={product.Name} style={{ maxWidth:'100%', maxHeight:'400px', objectFit:'contain' }} />
                : <span style={{ fontSize:'7rem' }}>{product.Emoji || '📦'}</span>
              }
            </div>
            {product.images?.length > 1 && (
              <div className="pd-thumbs-row">
                {product.images.map((src, i) => (
                  <button key={i} className={`pd-thumb${i === imgIdx ? ' active' : ''}`} onClick={() => setImgIdx(i)}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="pd-info">
            {product.Badge && <span className="pd-badge">{product.Badge}</span>}
            <h1 className="pd-name">{product.Name}</h1>
            {product.Brand && (
              <div style={{ color:'var(--text-dim)', fontSize:'0.9rem', marginBottom:'14px' }}>{product.Brand}</div>
            )}

            <div className="pd-rating">
              <span className="stars">{stars(product.Rating)}</span>
              <span className="review-count">({product.Reviews} reviews)</span>
            </div>

            <div className="pd-price">
              <span className="price-current">{fmt(product.Price)}</span>
              {product.OriginalPrice > product.Price && (
                <span className="price-original">{fmt(product.OriginalPrice)}</span>
              )}
              {discount > 0 && <span className="price-discount">{discount}% off</span>}
            </div>

            {product.Description && (
              <p className="pd-desc">{product.Description}</p>
            )}

            {product.colors?.length > 0 && (
              <div style={{ marginBottom:'20px' }}>
                <span style={{ fontSize:'0.82rem', color:'var(--text-dim)', marginRight:'10px' }}>Colors:</span>
                {product.colors.map((c, i) => (
                  <span key={i} title={c.name} style={{
                    display:'inline-block', width:'22px', height:'22px', borderRadius:'50%',
                    background: c.hex, border:'2px solid var(--card-border)', marginRight:'6px',
                    cursor:'pointer'
                  }} />
                ))}
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
              <label style={{ fontSize:'0.85rem', color:'var(--text-dim)' }}>Qty:</label>
              <div className="qty-selector">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.Stock, q + 1))}>+</button>
              </div>
              <span style={{ fontSize:'0.8rem', color: product.Stock < 10 ? 'var(--hot)' : 'var(--success)' }}>
                {product.Stock > 0 ? `${product.Stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="pd-actions">
              <button
                className={`add-cart-btn${added ? ' added' : ''}`}
                onClick={handleAdd}
                disabled={product.Stock === 0}
                style={{ flex:1 }}
              >
                {added ? '✓ Added to Cart' : '🛒 Add to Cart'}
              </button>
            </div>

            {product.features?.length > 0 && (
              <div className="pd-features" style={{ marginTop:'28px' }}>
                <h4>Features</h4>
                <ul>
                  {product.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
