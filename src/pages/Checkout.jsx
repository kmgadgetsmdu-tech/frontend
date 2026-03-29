import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart }  from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { fmt }      from '../utils/helpers';

const PAYMENT_METHODS = ['COD', 'UPI', 'Card', 'Net Banking'];

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ line1:'', line2:'', city:'', state:'Tamil Nadu', pincode:'', phone:'', notes:'' });
  const [payment, setPayment]     = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount]   = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [placing, setPlacing]     = useState(false);

  // Razorpay config
  const [rzpKey, setRzpKey] = useState('');
  useEffect(() => {
    api.get('/payments/config').then(r => setRzpKey(r.data.keyId)).catch(() => {});
  }, []);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function applyCoupon() {
    try {
      const r = await api.post('/coupons/validate', { code: couponCode, orderTotal: cartTotal });
      setDiscount(r.data.discount);
      setCouponMsg(`✅ ${r.data.code} applied — saving ${fmt(r.data.discount)}`);
    } catch (err) {
      setDiscount(0);
      setCouponMsg(err.response?.data?.message || 'Invalid coupon');
    }
  }

  // ── Load Razorpay script dynamically ───────────────────────────
  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const s = document.createElement('script');
      s.id  = 'razorpay-script';
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload  = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  // ── Build the order payload ────────────────────────────────────
  function buildOrderPayload(total) {
    const codFee = payment === 'COD' ? 49 : 0;
    return {
      items:    cart.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price })),
      address:  { line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode },
      payment,
      notes:    form.notes || null,
      subtotal: cartTotal,
      shipping: 0,
      discount,
      codFee,
      total,
    };
  }

  // ── Place order (COD or online via Razorpay) ───────────────────
  async function placeOrder(e) {
    e.preventDefault();
    if (!cart.length) return showToast('Your cart is empty', 'error');

    const isOnline = payment !== 'COD';
    const codFee   = payment === 'COD' ? 49 : 0;
    const total    = cartTotal - discount + codFee;

    setPlacing(true);
    try {
      // COD path — same as before
      if (!isOnline) {
        await api.post('/orders', buildOrderPayload(total));
        clearCart();
        showToast('Order placed successfully! 🎉', 'success');
        navigate('/orders');
        return;
      }

      // ── Online payment via Razorpay ────────────────────────────
      if (!rzpKey || rzpKey.includes('yourkeyhere')) {
        showToast('Online payment is not configured yet. Please use COD.', 'error');
        setPlacing(false);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) { showToast('Failed to load payment gateway', 'error'); setPlacing(false); return; }

      // 1. Create Razorpay order on backend
      const { data: rpOrder } = await api.post('/payments/create-order', {
        amount:  total,
        receipt: `kmg_${Date.now()}`,
        notes:   { payment },
      });

      // 2. Open Razorpay checkout
      const options = {
        key:       rzpKey,
        amount:    rpOrder.amount,
        currency:  rpOrder.currency,
        name:      'KM Gadgets',
        description: `Payment for ${cart.length} item(s)`,
        order_id:  rpOrder.orderId,
        prefill: {
          name:    form.phone ? undefined : undefined,
          contact: form.phone || '',
        },
        theme: { color: '#7c3aed' },
        handler: async function (response) {
          try {
            // 3. Place order in our system
            const orderRes = await api.post('/orders', buildOrderPayload(total));
            const kmgOrderId = orderRes.data?.id || orderRes.data?.Id;

            // 4. Verify payment & link to order
            await api.post('/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              kmgOrderId,
            });

            clearCart();
            showToast('Payment successful! Order placed 🎉', 'success');
            navigate('/orders');
          } catch (err) {
            showToast(err.response?.data?.message || 'Payment verified but order failed. Contact support.', 'error');
          }
        },
        modal: {
          ondismiss: function () {
            setPlacing(false);
            showToast('Payment cancelled', 'error');
          },
        },
      };

      const rzpObj = new window.Razorpay(options);
      rzpObj.on('payment.failed', function (resp) {
        showToast(`Payment failed: ${resp.error.description}`, 'error');
        setPlacing(false);
      });
      rzpObj.open();
      return; // Don't reset placing — Razorpay handles it

    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      if (payment === 'COD') setPlacing(false);
    }
  }

  const codFee  = payment === 'COD' ? 49 : 0;
  const finalTotal = cartTotal - discount + codFee;

  return (
    <main style={{ paddingTop:'100px' }}>
      <div className="container">
        <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.8rem', marginBottom:'24px' }}>Checkout</h2>
        <form onSubmit={placeOrder} className="checkout-layout">

          {/* ── Address ── */}
          <div>
            <div className="form-section">
              <h3 className="form-section-title">📍 Delivery Address</h3>
              {[
                { name:'line1',   label:'Address Line 1 *', required:true },
                { name:'line2',   label:'Address Line 2',   required:false },
                { name:'city',    label:'City *',           required:true },
                { name:'state',   label:'State *',          required:true },
                { name:'pincode', label:'Pincode *',        required:true },
                { name:'phone',   label:'Phone *',          required:true },
              ].map(f => (
                <div key={f.name} className="form-field">
                  <label>{f.label}</label>
                  <input name={f.name} value={form[f.name]} onChange={handleChange} required={f.required} />
                </div>
              ))}
              <div className="form-field">
                <label>Delivery Notes (optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">💳 Payment Method</h3>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {PAYMENT_METHODS.map(m => (
                  <button key={m} type="button" onClick={() => setPayment(m)}
                    style={{ padding:'8px 18px', borderRadius:'8px', border:`1px solid ${payment===m ? 'var(--accent)' : 'var(--card-border)'}`,
                      background: payment===m ? 'rgba(0,212,255,0.08)' : 'var(--card)', color: payment===m ? 'var(--accent)' : 'var(--text-muted)',
                      cursor:'pointer', fontWeight: payment===m ? 700 : 400, transition:'all 0.2s' }}>
                    {m}
                  </button>
                ))}
              </div>
              {payment === 'COD' && (
                <div style={{ marginTop:'12px', padding:'10px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'8px', fontSize:'0.82rem', color:'var(--warning)' }}>
                  ⚠️ COD advance fee of ₹49 applies
                </div>
              )}
            </div>
          </div>

          {/* ── Summary ── */}
          <div>
            <div className="cart-summary">
              <h3 style={{ fontFamily:'var(--font-head)', marginBottom:'16px' }}>Order Summary</h3>
              {cart.map(i => (
                <div key={i.productId} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'8px' }}>
                  <span>{i.name} ×{i.quantity}</span>
                  <span>{fmt(i.price * i.quantity)}</span>
                </div>
              ))}

              <div style={{ borderTop:'1px solid var(--card-border)', paddingTop:'12px', marginTop:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'0.88rem', color:'var(--text-muted)' }}>
                  <span>Subtotal</span><span>{fmt(cartTotal)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'0.88rem', color:'var(--success)' }}>
                  <span>Delivery</span><span>FREE</span>
                </div>
                {discount > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'0.88rem', color:'var(--success)' }}>
                    <span>Coupon Discount</span><span>-{fmt(discount)}</span>
                  </div>
                )}
                {codFee > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'0.88rem', color:'var(--warning)' }}>
                    <span>COD Advance</span><span>{fmt(codFee)}</span>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-head)', fontWeight:800, fontSize:'1.15rem', color:'var(--accent)', paddingTop:'8px', borderTop:'1px solid var(--card-border)' }}>
                  <span>Total</span><span>{fmt(finalTotal)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div style={{ marginTop:'16px' }}>
                <div style={{ display:'flex', gap:'8px' }}>
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    style={{ flex:1, padding:'9px 12px', borderRadius:'8px', background:'var(--bg)', border:'1px solid var(--card-border)', color:'var(--text)', fontSize:'0.85rem' }} />
                  <button type="button" onClick={applyCoupon}
                    style={{ padding:'9px 16px', borderRadius:'8px', background:'var(--accent2)', color:'#fff', fontWeight:600, border:'none', cursor:'pointer' }}>
                    Apply
                  </button>
                </div>
                {couponMsg && <div style={{ marginTop:'6px', fontSize:'0.78rem', color: discount > 0 ? 'var(--success)' : 'var(--danger)' }}>{couponMsg}</div>}
              </div>

              <button type="submit" className="btn-primary" style={{ width:'100%', padding:'14px', marginTop:'20px', fontSize:'1rem' }} disabled={placing}>
                {placing ? 'Placing Order…' : '🛍️ Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
