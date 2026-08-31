import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

const API_URL = 'http://localhost:3001'

const roleLabels = { customer: 'عميل', seller: 'بائع', admin: 'أدمن' }

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/users`)
      setUsers(await res.json())
    } catch {
      setError('مش قادر أجيب المستخدمين — تأكد إن "npm run api" شغّال')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Soft delete: بنعمل restrict بدل الحذف الفعلي، عشان الحساب وتاريخه يفضل موجود
  const toggleRestricted = async (u) => {
    await fetch(`${API_URL}/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restricted: !u.restricted }),
    })
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, restricted: !x.restricted } : x)))
  }

  if (loading) return <p style={{ color: 'var(--coffee-700)' }}>جاري التحميل...</p>
  if (error) return <p style={{ color: 'var(--stamp-red)' }}>{error}</p>

  return (
    <div className="origin-card p-4">
      <h2 className="h5 mb-3">إدارة المستخدمين</h2>
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr style={{ color: 'var(--coffee-700)', fontSize: '0.85rem' }}>
              <th>الاسم</th>
              <th>الإيميل</th>
              <th>الدور</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td className="small">{u.email}</td>
                <td><span className="tag-pill tag-pill--outline">{roleLabels[u.role] || u.role}</span></td>
                <td>
                  {u.restricted ? (
                    <span className="tag-pill" style={{ background: 'var(--stamp-red)' }}>محظور</span>
                  ) : (
                    <span className="tag-pill" style={{ background: 'var(--leaf)' }}>نشط</span>
                  )}
                </td>
                <td>
                  {u.id !== currentUser.id && u.role !== 'admin' && (
                    <button
                      className="btn btn-sm"
                      onClick={() => toggleRestricted(u)}
                      style={{ border: '1px solid var(--cream-line)', fontSize: '0.8rem' }}
                    >
                      {u.restricted ? 'إعادة تفعيل' : 'حظر'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <p className="text-center mt-3" style={{ color: 'var(--coffee-700)' }}>مفيش مستخدمين مسجّلين لسه</p>}
    </div>
  )
}
