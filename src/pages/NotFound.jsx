import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <i className="bi bi-signpost-2" style={{ fontSize: '3rem', color: 'var(--coffee-700)' }}></i>
      <h1 className="section-title h2 mt-3">الصفحة مش موجودة</h1>
      <p className="mb-4" style={{ color: 'var(--coffee-700)' }}>يمكن الرحلة اتحولت... يلا نرجعلك للمتجر</p>
      <Link to="/" className="btn-brew">الرئيسية</Link>
    </div>
  )
}
