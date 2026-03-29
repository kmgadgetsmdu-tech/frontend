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
    showToast(`${product.name} added to cart`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const discount = disc(product.price, product.original_price);
  const img      = product.images?.[0];
  const starsStr = stars(product.rating || 0);

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-img" style={{ background: img ? 'var(--bg2)' : (product.gradient || 'var(--bg2)') }}>
        {img
          ? <img src={img} alt={product.name} className="product-img-real" />
          : <span style={{ fontSize:'4.5rem', filter:'drop-shadow(0 0 20px rgba(0,212,255,0.3))' }}>{product.emoji || '📦'}</span>
        }
        {product.badge && <span className="product-badge">{product.badge}</span>}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        {product.brand && <div className="product-brand">{product.brand}</div>}
        <div className="product-rating">
          <span className="stars">{starsStr}</span>
          <span className="review-count">({product.reviews || 0})</span>
        </div>
        <div className="product-price">
          <span className="price-current">{fmt(product.price)}</span>
          {product.original_price > product.price && (
            <span className="price-original">{fmt(product.original_price)}</span>
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
