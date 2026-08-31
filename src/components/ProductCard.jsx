import React from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext.jsx'

export default function ProductCard({ product }) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(product.id)

  return (
    <div className="origin-card h-100 position-relative">
      <button
        className="position-absolute d-flex align-items-center justify-content-center"
        onClick={() => toggleWishlist(product.id)}
        aria-label={wishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        style={{
          top: 10, left: 10, zIndex: 5, width: 36, height: 36, borderRadius: '50%',
          background: 'var(--parchment)', border: '1px solid var(--cream-line)',
        }}
      >
        <i
          className={wishlisted ? 'bi bi-heart-fill' : 'bi bi-heart'}
          style={{ color: wishlisted ? 'var(--stamp-red)' : 'var(--coffee-700)' }}
        ></i>
      </button>
      <Link to={`/products/${product.id}`}>
        <div className="card-img-wrap">
          <img src={product.image} alt={`بن ${product.name} من ${product.country}`} loading="lazy" />
        </div>
      </Link>
      <div className="p-3">
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="tag-pill">{product.country}</span>
          <span className="tag-pill tag-pill--outline">{product.roast}</span>
        </div>
        <Link to={`/products/${product.id}`} className="text-decoration-none">
          <h3 className="h5 mb-1" style={{ color: 'var(--coffee-950)' }}>{product.name}</h3>
        </Link>
        <p className="mb-2 small" style={{ color: 'var(--coffee-700)' }}>
          {(product.notes || []).slice(0, 3).join(' · ')}
        </p>
        <div className="d-flex align-items-center justify-content-between">
          <span className="fw-bold" style={{ color: 'var(--coffee-950)' }}>{product.price} ج.م <small className="fw-normal">/ {product.unit}</small></span>
          <Link to={`/products/${product.id}`} className="btn-brew btn-sm">
            اعرف الرحلة
          </Link>
        </div>
        <div className="small mt-2" style={{ color: Number(product.stock) > 0 ? 'var(--coffee-700)' : 'var(--stamp-red)' }}>{Number(product.stock) > 0 ? `متاح: ${product.stock}` : 'غير متوفر'}</div>
      </div>
    </div>
  )
}
