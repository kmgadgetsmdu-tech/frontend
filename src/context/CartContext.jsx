import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const CartContext = createContext(null);

// Cart item = { productId, name, price, quantity, image }
function loadCart() {
  return JSON.parse(localStorage.getItem('kmg_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('kmg_cart', JSON.stringify(cart));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => { saveCart(cart); }, [cart]);

  function addToCart(product, qty = 1) {
    setCart(prev => {
      const ex = prev.find(i => i.productId === product.id);
      if (ex) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: qty, image: product.images?.[0] || '' }];
    });
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }

  function updateQty(productId, qty) {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  }

  function clearCart() { setCart([]); }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
