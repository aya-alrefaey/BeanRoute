import React, { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'

const API_URL = 'http://localhost:3001'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('الكل')
  const [roast, setRoast] = useState('الكل')
  const [category, setCategory] = useState('الكل')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [stockOnly, setStockOnly] = useState(false)
  const [sort, setSort] = useState('الترتيب الافتراضي')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/products?active=true`).then((r) => r.json()),
      fetch(`${API_URL}/categories?active=true`).then((r) => r.json()),
    ])
      .then(([productData, categoryData]) => {
        setProducts(productData)
        setCategories(categoryData)
      })
      .catch(() => setError('مش قادر أجيب المنتجات — تأكد إن npm run api شغّال'))
      .finally(() => setLoading(false))
  }, [])

  const countries = useMemo(() => ['الكل', ...new Set(products.map((p) => p.country).filter(Boolean))], [products])
  const roasts = useMemo(() => ['الكل', ...new Set(products.map((p) => p.roast).filter(Boolean))], [products])

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const text = `${p.name || ''} ${p.country || ''} ${(p.notes || []).join(' ')}`.toLowerCase()
      const q = query.trim().toLowerCase()
      const price = Number(p.price) || 0
      return (
        (!q || text.includes(q)) &&
        (country === 'الكل' || p.country === country) &&
        (roast === 'الكل' || p.roast === roast) &&
        (category === 'الكل' || p.categoryId === category) &&
        (minPrice === '' || price >= Number(minPrice)) &&
        (maxPrice === '' || price <= Number(maxPrice)) &&
        (!stockOnly || Number(p.stock) > 0)
      )
    })

    if (sort === 'الأرخص أولاً') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'الأغلى أولاً') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'الأعلى تقييماً') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return list
  }, [products, query, country, roast, category, minPrice, maxPrice, stockOnly, sort])

  if (loading) return <div className="container py-5">جاري تحميل المنتجات...</div>
  if (error) return <div className="container py-5" style={{ color: 'var(--stamp-red)' }}>{error}</div>

  return (
    <div className="container py-5">
      <div className="mb-4">
        <p className="section-eyebrow mb-1">المتجر</p>
        <h1 className="section-title h2">كل المناشئ المتاحة</h1>
      </div>

      <div className="origin-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-6 col-lg-4">
            <input className="form-control form-control-beanroute" placeholder="دوّر بالاسم أو البلد أو النكهة..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="col-6 col-lg-2">
            <select className="form-select form-control-beanroute" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="الكل">كل التصنيفات</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-6 col-lg-2">
            <select className="form-select form-control-beanroute" value={country} onChange={(e) => setCountry(e.target.value)}>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-6 col-lg-2">
            <select className="form-select form-control-beanroute" value={roast} onChange={(e) => setRoast(e.target.value)}>
              {roasts.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="col-6 col-lg-2">
            <select className="form-select form-control-beanroute" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>الترتيب الافتراضي</option>
              <option>الأرخص أولاً</option>
              <option>الأغلى أولاً</option>
              <option>الأعلى تقييماً</option>
            </select>
          </div>
          <div className="col-6 col-lg-2">
            <input type="number" min="0" className="form-control form-control-beanroute" placeholder="أقل سعر" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </div>
          <div className="col-6 col-lg-2">
            <input type="number" min="0" className="form-control form-control-beanroute" placeholder="أقصى سعر" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <label className="d-flex align-items-center gap-2 small" style={{ color: 'var(--coffee-700)' }}>
              <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} /> متاح في المخزون فقط
            </label>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5"><i className="bi bi-cup" style={{ fontSize: '2.5rem', color: 'var(--coffee-700)' }}></i><p className="mt-3" style={{ color: 'var(--coffee-700)' }}>مفيش نتائج مطابقة. جرب تغيّر الفلاتر.</p></div>
      ) : (
        <div className="row g-4">
          {filtered.map((p) => <div className="col-sm-6 col-lg-4" key={p.id}><ProductCard product={p} /></div>)}
        </div>
      )}
    </div>
  )
}
