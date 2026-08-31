import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'

export default function Navbar() {
  const { totalItems } = useCart()
  const { user, logout } = useAuth()
  const { ids: wishlistIds } = useWishlist()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const links = [
    { to: '/', label: 'الرئيسية', end: true },
    { to: '/products', label: 'المتجر' },
    { to: '/about', label: 'قصتنا' },
  ]

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="nav-beanroute py-3">
      <div className="container d-flex align-items-center justify-content-between">
        <NavLink to="/" className="d-flex align-items-center gap-2">
          <i className="bi bi-cup-hot-fill" style={{ color: 'var(--amber)', fontSize: '1.6rem' }}></i>
          <span className="wordmark fs-4" style={{ color: 'var(--coffee-950)' }}>BeanRoute</span>
        </NavLink>

        <div className="d-none d-lg-flex align-items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => 'nav-link-custom' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="d-flex align-items-center gap-2">
          {user ? (
            <div className="position-relative d-none d-md-block">
              <button
                className="nav-link-custom d-flex align-items-center gap-2 border-0 bg-transparent"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <i className="bi bi-person-circle"></i>
                {user.name || 'حسابي'}
                <i className="bi bi-chevron-down small"></i>
              </button>
              {menuOpen && (
                <div
                  className="position-absolute end-0 mt-2 p-2 d-flex flex-column"
                  style={{ background: 'var(--parchment)', border: '1px solid var(--cream-line)', borderRadius: 4, minWidth: 180, zIndex: 50 }}
                >
                  {user.role === 'admin' && (
                    <NavLink
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="btn btn-sm text-start d-flex align-items-center gap-2"
                      style={{ color: 'var(--amber-dark)' }}
                    >
                      <i className="bi bi-speedometer2"></i> لوحة التحكم
                    </NavLink>
                  )}
                  {user.role === 'seller' && (
                    <NavLink
                      to="/seller"
                      onClick={() => setMenuOpen(false)}
                      className="btn btn-sm text-start d-flex align-items-center gap-2"
                      style={{ color: 'var(--amber-dark)' }}
                    >
                      <i className="bi bi-shop"></i> لوحة البائع
                    </NavLink>
                  )}
                  <NavLink
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-sm text-start d-flex align-items-center gap-2"
                    style={{ color: 'var(--coffee-950)' }}
                  >
                    <i className="bi bi-person"></i> الملف الشخصي
                  </NavLink>
                  <NavLink
                    to="/notifications"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-sm text-start d-flex align-items-center gap-2"
                    style={{ color: 'var(--coffee-950)' }}
                  >
                    <i className="bi bi-bell"></i> الإشعارات
                  </NavLink>
                  <NavLink
                    to="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-sm text-start d-flex align-items-center gap-2"
                    style={{ color: 'var(--coffee-950)' }}
                  >
                    <i className="bi bi-receipt"></i> طلباتي
                  </NavLink>
                  <NavLink
                    to="/wishlist"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-sm text-start d-flex align-items-center gap-2"
                    style={{ color: 'var(--coffee-950)' }}
                  >
                    <i className="bi bi-heart"></i> المفضلة
                  </NavLink>
                  <button
                    className="btn btn-sm text-start d-flex align-items-center gap-2"
                    onClick={handleLogout}
                    style={{ color: 'var(--stamp-red)' }}
                  >
                    <i className="bi bi-box-arrow-right"></i> تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="d-none d-md-inline nav-link-custom">
              <i className="bi bi-person"></i> تسجيل الدخول
            </NavLink>
          )}

          <NavLink to="/wishlist" className="btn-brew-outline position-relative d-none d-sm-inline-flex align-items-center gap-2">
            <i className="bi bi-heart"></i>
            {wishlistIds.length > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{ background: 'var(--stamp-red)', fontSize: '0.65rem' }}
              >
                {wishlistIds.length}
              </span>
            )}
          </NavLink>

          <NavLink to="/cart" className="btn-brew-outline position-relative d-inline-flex align-items-center gap-2">
            <i className="bi bi-basket3"></i>
            <span className="d-none d-sm-inline">السلة</span>
            {totalItems > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{ background: 'var(--stamp-red)', fontSize: '0.65rem' }}
              >
                {totalItems}
              </span>
            )}
          </NavLink>
          <button className="btn d-lg-none border-0" onClick={() => setOpen(!open)} aria-label="فتح القائمة">
            <i className="bi bi-list fs-2" style={{ color: 'var(--coffee-950)' }}></i>
          </button>
        </div>
      </div>

      {open && (
        <div className="d-lg-none container mt-3 d-flex flex-column gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => 'nav-link-custom' + (isActive ? ' active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/wishlist" onClick={() => setOpen(false)} className="nav-link-custom">
            المفضلة {wishlistIds.length > 0 && `(${wishlistIds.length})`}
          </NavLink>
          {user ? (
            <>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setOpen(false)} className="nav-link-custom" style={{ color: 'var(--amber-dark)' }}>
                  لوحة التحكم
                </NavLink>
              )}
              {user.role === 'seller' && (
                <NavLink to="/seller" onClick={() => setOpen(false)} className="nav-link-custom" style={{ color: 'var(--amber-dark)' }}>
                  لوحة البائع
                </NavLink>
              )}
              <NavLink to="/profile" onClick={() => setOpen(false)} className="nav-link-custom">
                الملف الشخصي
              </NavLink>
              <NavLink to="/notifications" onClick={() => setOpen(false)} className="nav-link-custom">
                الإشعارات
              </NavLink>
              <NavLink to="/orders" onClick={() => setOpen(false)} className="nav-link-custom">
                طلباتي
              </NavLink>
              <button className="nav-link-custom text-start border-0 bg-transparent" onClick={handleLogout}>
                تسجيل الخروج ({user.name || user.email})
              </button>
            </>
          ) : (
            <NavLink to="/login" onClick={() => setOpen(false)} className="nav-link-custom">
              تسجيل الدخول
            </NavLink>
          )}
        </div>
      )}
    </nav>
  )
}
