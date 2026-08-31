import React, { createContext, useContext, useEffect, useState } from 'react'

// ⚠️ ده API وهمي (json-server) للعرض والتجربة بس — مش آمن أبدًا:
// الباسورد بيتخزن نص عادي وبيتبعت في الـ URL كـ query param.
// في مشروع حقيقي لازم backend بيعمل hashing للباسورد (bcrypt) ويستخدم JWT/Sessions.

const API_URL = 'http://localhost:3001'

const AuthContext = createContext(null)

const STORAGE_KEY = 'beanroute_user'

function translateError(message) {
  const map = {
    EMAIL_IN_USE: 'الإيميل ده متسجل بحساب قبل كده',
    INVALID_CREDENTIALS: 'الإيميل أو كلمة المرور غلط',
    WEAK_PASSWORD: 'كلمة المرور لازم تكون 6 حروف/أرقام على الأقل',
    ACCOUNT_RESTRICTED: 'الحساب ده متوقف من الإدارة — تواصل مع الدعم',
    NETWORK_ERROR: 'مش قادر أوصل للـ API — تأكد إنك مشغّل "npm run api" في تيرمينال تاني',
  }
  return map[message] || 'حصل خطأ غير متوقع، حاول تاني'
}

// بنستخرج بس الحقول اللي مفروض تبان في الواجهة (من غير الباسورد)
function toPublicUser(record) {
  const { id, name, email, phone, address, city, role, restricted, shopName, emailConfirmed } = record
  return { id, name, email, phone, address, city, role: role || 'customer', restricted: !!restricted, shopName, emailConfirmed: emailConfirmed !== false }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // استرجاع جلسة محفوظة محليًا لو موجودة
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const safeFetch = async (url, options) => {
    try {
      return await fetch(url, options)
    } catch {
      throw new Error('NETWORK_ERROR')
    }
  }

  const persistUser = (record) => {
    const publicUser = toPublicUser(record)
    setUser(publicUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(publicUser))
    return publicUser
  }

  const register = async (name, email, password, { phone = '', role = 'customer', shopName = '' } = {}) => {
    if (password.length < 6) throw new Error('WEAK_PASSWORD')

    // نتأكد الإيميل مش مستخدم قبل كده
    const checkRes = await safeFetch(`${API_URL}/users?email=${encodeURIComponent(email)}`)
    const existing = await checkRes.json()
    if (existing.length > 0) throw new Error('EMAIL_IN_USE')

    const newUser = {
      name, email, password, phone, address: '', city: '',
      role, shopName, restricted: false, emailConfirmed: false,
      createdAt: new Date().toISOString(),
    }
    const res = await safeFetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
    const created = await res.json()
    return persistUser(created)
  }

  const login = async (email, password) => {
    const res = await safeFetch(`${API_URL}/users?email=${encodeURIComponent(email)}`)
    const found = await res.json()
    const match = found.find((u) => u.password === password)
    if (!match) throw new Error('INVALID_CREDENTIALS')
    if (match.restricted) throw new Error('ACCOUNT_RESTRICTED')
    return persistUser(match)
  }

  const confirmEmail = async () => {
    if (!user) return
    const res = await safeFetch(`${API_URL}/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailConfirmed: true }) })
    const updated = await res.json()
    return persistUser(updated)
  }

  const resendConfirmation = async () => {
    if (!user) return
    await safeFetch(`${API_URL}/notifications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, email: user.email, type: 'email', title: 'تأكيد البريد الإلكتروني', message: `رابط تأكيد تجريبي لحساب ${user.email}. افتح صفحة تأكيد البريد داخل التطبيق.`, read: false, createdAt: new Date().toISOString() }) })
  }

  const updateProfile = async (updates) => {
    const res = await safeFetch(`${API_URL}/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const updated = await res.json()
    return persistUser(updated)
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = { user, loading, register, login, logout, updateProfile, confirmEmail, resendConfirmation, translateError }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
