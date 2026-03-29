import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value:'',            label:'Newest First' },
  { value:'price_asc',   label:'Price: Low to High' },
  { value:'price_desc',  label:'Price: High to Low' },
  { value:'rating',      label:'Top Rated' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const category = searchParams.get('category') || '';
  const q        = searchParams.get('q')        || '';
  const sort     = searchParams.get('sort')     || '';

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q)        params.set('q', q);
    if (sort)     params.set('sort', sort);
    api.get(`/products?${params}`).then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [category, q, sort]);

  function setParam(key, val) {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  }

  return (
    <main>
      <div className="shop-layout">
        {/* ── Sidebar ── */}
        <aside className="filter-sidebar">
          <h3>Filters</h3>

          <div className="filter-group">
            <h4>Categories</h4>
            <div className="filter-option" onClick={() => setParam('category', '')}>
              <input type="checkbox" readOnly checked={!category} />
              <label>All Products</label>
            </div>
            {categories.map(c => (
              <div key={c.Id} className="filter-option" onClick={() => setParam('category', category === c.Slug ? '' : c.Slug)}>
                <input type="checkbox" readOnly checked={category === c.Slug} />
                <label>{c.Icon} {c.Name}</label>
              </div>
            ))}
          </div>

          {(category || q || sort) && (
            <button className="clear-filters" onClick={() => setSearchParams({})}>
              Clear Filters
            </button>
          )}
        </aside>

        {/* ── Main grid ── */}
        <div className="shop-main">
          <div className="shop-toolbar">
            <div className="result-count">
              Showing <span>{products.length}</span> product{products.length !== 1 ? 's' : ''}
            </div>
            <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
              <div className="nav-search" style={{ padding:'7px 14px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input value={q} onChange={e => setParam('q', e.target.value)} placeholder="Search products…" />
              </div>
              <select className="sort-select" value={sort} onChange={e => setParam('sort', e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'80px', color:'var(--text-dim)' }}>Loading…</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px', color:'var(--text-dim)' }}>No products found. Try a different search or category.</div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.Id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
