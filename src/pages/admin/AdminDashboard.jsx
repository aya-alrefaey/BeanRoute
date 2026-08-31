import React, { useEffect, useState } from 'react'

const API_URL = 'http://localhost:3001'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/orders`),
          fetch(`${API_URL}/products?active=true`),
        ])
        const users = await usersRes.json()
        const orders = await ordersRes.json()
        const products = await productsRes.json()
        const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

        setStats({
          usersCount: users.length,
          customersCount: users.filter((u) => u.role === 'customer').length,
          sellersCount: users.filter((u) => u.role === 'seller').length,
          ordersCount: orders.length,
          revenue,
          productsCount: products.length,
        })
      } catch {
        setError('مش قادر أجيب الإحصائيات — تأكد إن "npm run api" شغّال')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p style={{ color: 'var(--coffee-700)' }}>جاري التحميل...</p>
  if (error) return <p style={{ color: 'var(--stamp-red)' }}>{error}</p>

  const cards = [
    { label: 'إجمالي المستخدمين', value: stats.usersCount, icon: 'bi-people' },
    { label: 'العملاء', value: stats.customersCount, icon: 'bi-person' },
    { label: 'البائعين', value: stats.sellersCount, icon: 'bi-shop' },
    { label: 'إجمالي الطلبات', value: stats.ordersCount, icon: 'bi-receipt' },
    { label: 'إجمالي الإيرادات', value: `${stats.revenue} ج.م`, icon: 'bi-cash-stack' },
    { label: 'المنتجات في الكتالوج', value: stats.productsCount, icon: 'bi-box-seam' },
  ]

  return (
    <div className="row g-3">
      {cards.map((c) => (
        <div className="col-sm-6 col-xl-4" key={c.label}>
          <div className="origin-card p-4 h-100">
            <i className={`bi ${c.icon} fs-3 mb-2 d-block`} style={{ color: 'var(--amber-dark)' }}></i>
            <div className="fs-3 fw-bold" style={{ color: 'var(--coffee-950)' }}>{c.value}</div>
            <div className="small" style={{ color: 'var(--coffee-700)' }}>{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
