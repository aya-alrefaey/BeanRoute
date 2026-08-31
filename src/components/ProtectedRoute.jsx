import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// بيحمي أي صفحة تحتاج تسجيل دخول، واختياريًا دور معيّن (role)
// requiredRole: 'admin' | 'seller' | undefined (undefined = أي مستخدم مسجّل)
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="container py-5 text-center" style={{ color: 'var(--coffee-700)' }}>جاري التحميل...</div>
  }

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-shield-lock" style={{ fontSize: '3rem', color: 'var(--stamp-red)' }}></i>
        <h1 className="section-title h3 mt-3">مفيش صلاحية دخول</h1>
        <p style={{ color: 'var(--coffee-700)' }}>الصفحة دي مخصصة لحسابات {requiredRole === 'admin' ? 'الأدمن' : 'البائعين'} بس</p>
      </div>
    )
  }

  return children
}
