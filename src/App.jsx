import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar          from './components/Navbar';
import Footer          from './components/Footer';
import ToastContainer  from './components/ToastContainer';

import Home       from './pages/Home';
import Shop       from './pages/Shop';
import Product    from './pages/Product';
import Cart       from './pages/Cart';
import Checkout   from './pages/Checkout';
import Orders     from './pages/Orders';
import Login           from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';

import AdminLayout    from './pages/admin/AdminLayout';
import AdminLogin     from './pages/admin/AdminLogin';
import Dashboard      from './pages/admin/Dashboard';
import AdminProducts  from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders    from './pages/admin/AdminOrders';
import AdminBanners   from './pages/admin/AdminBanners';
import AdminStory     from './pages/admin/AdminStory';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* ── Public storefront ── */}
        <Route path="/" element={<><Navbar /><Home />    <Footer /></>} />
        <Route path="/shop"      element={<><Navbar /><Shop />    <Footer /></>} />
        <Route path="/product/:id" element={<><Navbar /><Product /> <Footer /></>} />
        <Route path="/cart"      element={<><Navbar /><Cart />    <Footer /></>} />
        <Route path="/login"     element={<><Navbar /><Login />   <Footer /></>} />
        <Route path="/register"  element={<><Navbar /><Register /><Footer /></>} />
        <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /><Footer /></>} />

        {/* ── Authenticated storefront ── */}
        <Route path="/checkout" element={<PrivateRoute><Navbar /><Checkout /><Footer /></PrivateRoute>} />
        <Route path="/orders"   element={<PrivateRoute><Navbar /><Orders />  <Footer /></PrivateRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index           element={<Dashboard />} />
          <Route path="products"   element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders"     element={<AdminOrders />} />
          <Route path="banners"    element={<AdminBanners />} />
          <Route path="story"      element={<AdminStory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
