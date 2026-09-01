import React, { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'

import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import CoffeeMap from '../components/CoffeeMap.jsx'
import Reviews from '../components/Reviews.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`http://localhost:3001/products/${id}`)
      .then((res) => { if (!res.ok) throw new Error('not-found'); return res.json() })
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])
  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [cartError, setCartError] = useState('')

  if (loading) return <div className="container py-5">جاري تحميل المنتج...</div>
  if (!product) return <Navigate to="/products" replace />

  const wishlisted = isWishlisted(product.id)

  const handleAdd = async () => {
    if (Number(product.stock) <= 0) return
    if (qty > Number(product.stock)) {
      setQty(Number(product.stock))
      return
    }
    try {
      setCartError('')
      await addToCart(product, qty)
      setAdded(true)
    } catch (e) {
      setCartError(e.message?.startsWith('ONLY_') ? `المتاح حاليًا ${e.message.slice(5)} فقط` : 'مش قادر أضيف المنتج للسلة')
      return
    }
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="container py-5">
      <nav className="mb-4 small" style={{ color: 'var(--coffee-700)' }}>
        <Link to="/products" style={{ color: 'var(--coffee-700)' }}>المتجر</Link> / {product.name}
      </nav>

      <div className="row g-5">
        <div className="col-lg-5">
          <div className="origin-card">
            <div className="card-img-wrap" style={{ aspectRatio: '1/1' }}>
              <img src={product.image} alt={`بن ${product.name}`} />
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <span className="tag-pill mb-3 d-inline-block">{product.country}</span>
          <h1 className="section-title display-6 mb-2">{product.name}</h1>
          <p className="mb-4" style={{ color: 'var(--coffee-700)' }}>{product.farm}</p>

          <div className="d-flex flex-wrap gap-2 mb-4">
            {(product.notes || []).map((n) => (
              <span key={n} className="tag-pill tag-pill--outline">{n}</span>
            ))}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6 col-md-4">
              <small className="d-block" style={{ color: 'var(--coffee-700)' }}>الارتفاع</small>
              <strong>{product.altitude}</strong>
            </div>
            <div className="col-6 col-md-4">
              <small className="d-block" style={{ color: 'var(--coffee-700)' }}>المعالجة</small>
              <strong>{product.process}</strong>
            </div>
            <div className="col-6 col-md-4">
              <small className="d-block" style={{ color: 'var(--coffee-700)' }}>درجة التحميص</small>
              <strong>{product.roast}</strong>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4 mb-4">
            <div className="mb-2"><span className="tag-pill tag-pill--outline">{Number(product.stock) > 0 ? `متاح: ${product.stock}` : 'غير متوفر'}</span></div>
            <span className="fs-3 fw-bold" style={{ color: 'var(--coffee-950)' }}>
              {product.price} ج.م <small className="fs-6 fw-normal">/ {product.unit}</small>
            </span>
          </div>

          {cartError && <p className="small mb-2" style={{color:'var(--stamp-red)'}}>{cartError}</p>}

          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="d-flex align-items-center" style={{ border: '1px solid var(--cream-line)', borderRadius: '3px' }}>
              <button className="btn btn-sm" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="تقليل الكمية">−</button>
              <span className="px-3">{qty}</span>
              <button className="btn btn-sm" onClick={() => setQty((q) => Math.min(Number(product.stock) || 1, q + 1))} aria-label="زيادة الكمية">+</button>
            </div>
            <button disabled={Number(product.stock) <= 0} className="btn-brew flex-grow-1 flex-md-grow-0" onClick={handleAdd}>
              <i className="bi bi-basket3 me-2"></i>
              {Number(product.stock) <= 0 ? 'غير متوفر' : added ? 'اتضاف للسلة ✓' : 'أضف للسلة'}
            </button>
            <button
              className="btn-brew-outline d-flex align-items-center gap-2"
              onClick={() => toggleWishlist(product.id)}
              aria-label={wishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <i className={wishlisted ? 'bi bi-heart-fill' : 'bi bi-heart'} style={{ color: wishlisted ? 'var(--stamp-red)' : 'inherit' }}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Origin story — passport style */}
      <div className="row g-5 mt-4 pt-4" style={{ borderTop: '1px solid var(--cream-line)' }}>
        <div className="col-lg-5">
          <p className="section-eyebrow mb-1">قصة الرحلة</p>
          <h2 className="section-title h3 mb-3">من {product.farm}</h2>
          <p style={{ color: 'var(--coffee-700)', lineHeight: 1.9 }}>{product.story}</p>
          <p style={{ color: 'var(--coffee-700)', lineHeight: 1.9 }}>{product.roaster}</p>

          <div className="d-flex gap-3 mt-4 flex-wrap">
            <div className="stamp">
              <span className="fw-bold small">{product.country}</span>
              <small>المنشأ</small>
            </div>
            <div className="stamp" style={{ transform: 'rotate(6deg)' }}>
              <span className="fw-bold small">{(product.process || 'Washed').split(' ')[0]}</span>
              <small>المعالجة</small>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <p className="section-eyebrow mb-1">خريطة الرحلة</p>
          <h2 className="section-title h3 mb-3">من {product.country} لحد القاهرة</h2>
          <CoffeeMap product={product} />
          <p className="small mt-2" style={{ color: 'var(--coffee-700)' }}>
            <i className="bi bi-info-circle me-1"></i>
            الخط المنقّط بيمثل رحلة الشحن التقريبية من نقطة الحصاد لحد محمصتنا في القاهرة.
          </p>
        </div>
      </div>

      <Reviews productId={product.id} />
    </div>
  )
}
