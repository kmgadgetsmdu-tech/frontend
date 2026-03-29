import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => JSON.parse(localStorage.getItem('kmg_user') || 'null'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kmg_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(r => { setUser(r.data); localStorage.setItem('kmg_user', JSON.stringify(r.data)); })
      .catch(() => { localStorage.removeItem('kmg_token'); localStorage.removeItem('kmg_user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('kmg_token', r.data.token);
    localStorage.setItem('kmg_user',  JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  }

  async function register(name, email, phone, password) {
    const r = await api.post('/auth/register', { name, email, phone, password });
    localStorage.setItem('kmg_token', r.data.token);
    localStorage.setItem('kmg_user',  JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  }

  function logout() {
    localStorage.removeItem('kmg_token');
    localStorage.removeItem('kmg_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
