import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const [role, setRole] = useState('customer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [shopName, setShopName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, translateError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password, { phone, role, shopName })
      navigate('/confirm-email')
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="origin-card p-4 p-md-5">
            <div className="text-center mb-4">
              <i className="bi bi-cup-hot-fill" style={{ color: 'var(--amber)', fontSize: '2rem' }}></i>
              <h1 className="section-title h3 mt-2">إنشاء حساب جديد</h1>
              <p className="small" style={{ color: 'var(--coffee-700)' }}>انضم لمجتمع محبي البن المتخصص</p>
            </div>

            <div className="d-flex gap-2 mb-4 justify-content-center">
              {[
                { id: 'customer', label: 'عميل' },
                { id: 'seller', label: 'بائع (محمصة)' },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={role === r.id ? 'btn-brew' : 'btn-brew-outline'}
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="alert" style={{ background: 'rgba(166,61,51,0.1)', color: 'var(--stamp-red)', border: '1px solid var(--stamp-red)', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <input required value={name} onChange={(e) => setName(e.target.value)} className="form-control form-control-beanroute" placeholder="الاسم بالكامل" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control form-control-beanroute" placeholder="البريد الإلكتروني" />
              <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-control form-control-beanroute" placeholder="رقم الموبايل" />
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="form-control form-control-beanroute" placeholder="كلمة المرور (6 حروف على الأقل)" />
              {role === 'seller' && (
                <input value={shopName} onChange={(e) => setShopName(e.target.value)} className="form-control form-control-beanroute" placeholder="اسم المحمصة / المتجر" />
              )}
              <button type="submit" disabled={loading} className="btn-brew w-100">
                {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
              </button>
            </form>

            <p className="text-center small mt-4 mb-0" style={{ color: 'var(--coffee-700)' }}>
              عندك حساب؟ <Link to="/login" style={{ color: 'var(--amber-dark)', fontWeight: 600 }}>سجّل دخولك</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
