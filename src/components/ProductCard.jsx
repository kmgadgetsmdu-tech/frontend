import { Link } from 'react-router-dom';
import { fmt, disc, stars } from '../utils/helpers';
import { useCart }  from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    showToast(`${product.Name} added to cart`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const discount = disc(product.Price, product.OriginalPrice);
  const img      = product.images?.[0];
  const starsStr = stars(product.Rating || 0);

  return (
    <Link to={`/product/${product.Id}`} className="product-card">
      <div className="product-img" style={{ background: img ? 'var(--bg2)' : (product.Gradient || 'var(--bg2)') }}>
        {img
          ? <img src={img} alt={product.Name} className="product-img-real" />
          : <span style={{ fontSize:'4.5rem', filter:'drop-shadow(0 0 20px rgba(0,212,255,0.3))' }}>{product.Emoji || '📦'}</span>
        }
        {product.Badge && <span className="product-badge">{product.Badge}</span>}
      </div>
      <div className="product-info">
        <div className="product-name">{product.Name}</div>
        {product.Brand && <div className="product-brand">{product.Brand}</div>}
        <div className="product-rating">
          <span className="stars">{starsStr}</span>
          <span className="review-count">({product.Reviews || 0})</span>
        </div>
        <div className="product-price">
          <span className="price-current">{fmt(product.Price)}</span>
          {product.OriginalPrice > product.Price && (
            <span className="price-original">{fmt(product.OriginalPrice)}</span>
          )}
          {discount > 0 && <span className="price-discount">{discount}% off</span>}
        </div>
        {product.colors?.length > 0 && (
          <div className="product-colors">
            {product.colors.slice(0,4).map((c, i) => (
              <span key={i} className="color-dot" title={c.name} style={{ background: c.hex }} />
            ))}
          </div>
        )}
        <button className={`add-cart-btn${added ? ' added' : ''}`} onClick={handleAdd}>
          {added ? '✓ Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
