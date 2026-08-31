import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'نظرة عامة', icon: 'bi-speedometer2', end: true },
  { to: '/admin/users', label: 'المستخدمين', icon: 'bi-people' },
  { to: '/admin/orders', label: 'الطلبات', icon: 'bi-receipt' },
  { to: '/admin/products', label: 'المنتجات', icon: 'bi-box-seam' },
  { to: '/admin/categories', label: 'التصنيفات', icon: 'bi-tags' },
  { to: '/admin/banners', label: 'محتوى الصفحة الرئيسية', icon: 'bi-image' },
  { to: '/admin/promos', label: 'أكواد الخصم', icon: 'bi-ticket-perforated' },
]

export default function AdminLayout() {
  return (
    <div className="container py-5">
      <p className="section-eyebrow mb-1">لوحة التحكم</p>
      <h1 className="section-title h2 mb-4">إدارة BeanRoute</h1>

      <div className="row g-4">
        <div className="col-lg-3">
          <div className="origin-card p-2 d-flex flex-lg-column gap-1 flex-row flex-wrap">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  'd-flex align-items-center gap-2 p-2 rounded-1' + (isActive ? '' : '')
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--parchment)' : 'var(--coffee-950)',
                  background: isActive ? 'var(--coffee-950)' : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                })}
              >
                <i className={`bi ${l.icon}`}></i> {l.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="col-lg-9">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
