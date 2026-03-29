import { Link } from 'react-router-dom';
import { fmt }    from '../utils/helpers';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal } = useCart();

  if (!cart.length) return (
    <main>
      <div className="cart-empty">
        <div className="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p><Link to="/shop">Browse products →</Link></p>
      </div>
    </main>
  );

  return (
    <main>
      <div className="cart-layout">
        {/* Items column */}
        <div>
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.6rem', fontWeight:800, marginBottom:'24px' }}>
            Shopping Cart <span style={{ fontSize:'1rem', color:'var(--text-dim)', fontWeight:400 }}>({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
          </h2>

          {cart.map(item => (
            <div key={item.productId} className="cart-item">
              <div className="cart-item-img">
                {item.image
                  ? <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontSize:'2.5rem' }}>📦</span>
                }
              </div>
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                {item.brand && <div className="cart-item-brand">{item.brand}</div>}
                <div className="cart-item-controls">
                  <div className="qty-selector">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-price">{fmt(item.price * item.quantity)}</div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    style={{ background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontSize:'1.1rem', lineHeight:1 }}
                    title="Remove"
                  >✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary column */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>{fmt(cartTotal)}</span>
          </div>
          <div className="summary-row" style={{ color:'var(--success)' }}>
            <span>Delivery</span>
            <span>FREE 🎉</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{fmt(cartTotal)}</span>
          </div>
          <Link to="/checkout" className="add-cart-btn" style={{ display:'block', textAlign:'center', marginTop:'20px', padding:'14px', border:'none', borderRadius:'12px', fontSize:'1rem', fontWeight:600, cursor:'pointer', textDecoration:'none' }}>
            Proceed to Checkout →
          </Link>
          <Link to="/shop" style={{ display:'block', textAlign:'center', marginTop:'12px', color:'var(--text-dim)', fontSize:'0.85rem' }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
