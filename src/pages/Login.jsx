import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, translateError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="origin-card p-4 p-md-5">
            <div className="text-center mb-4">
              <i className="bi bi-cup-hot-fill" style={{ color: 'var(--amber)', fontSize: '2rem' }}></i>
              <h1 className="section-title h3 mt-2">تسجيل الدخول</h1>
              <p className="small" style={{ color: 'var(--coffee-700)' }}>كمّل رحلتك مع BeanRoute</p>
            </div>

            {error && (
              <div className="alert" style={{ background: 'rgba(166,61,51,0.1)', color: 'var(--stamp-red)', border: '1px solid var(--stamp-red)', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control form-control-beanroute" placeholder="البريد الإلكتروني" />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control form-control-beanroute" placeholder="كلمة المرور" />
              <button type="submit" disabled={loading} className="btn-brew w-100">
                {loading ? 'جاري الدخول...' : 'دخول'}
              </button>
            </form>

            <p className="text-center small mt-4 mb-0" style={{ color: 'var(--coffee-700)' }}>
              معندكش حساب؟ <Link to="/register" style={{ color: 'var(--amber-dark)', fontWeight: 600 }}>سجّل دلوقتي</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
