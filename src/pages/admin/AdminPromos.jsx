import React, { useEffect, useState } from 'react'

const API_URL = 'http://localhost:3001'

const initialForm = {
  code: '',
  type: 'percentage',
  value: '',
  minOrder: 0,
  maximumDiscount: '',
  usageLimit: '',
  endDate: '',
}

export default function AdminPromos() {
  const [list, setList] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadPromos = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/promoCodes`)
      if (!response.ok) throw new Error('تعذر تحميل أكواد الخصم')

      const data = await response.json()
      setList(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Promo codes error:', err)
      setError('مش قادرين نوصل إلى json-server. تأكدي إن npm run api شغال على port 3001.')
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromos()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const code = form.code.trim().toUpperCase()
    const discountValue = Number(form.value)

    if (!code || !discountValue || discountValue < 0) {
      setError('اكتبي كود الخصم وقيمة صحيحة للخصم.')
      setSaving(false)
      return
    }

    if (form.type === 'percentage' && discountValue > 100) {
      setError('نسبة الخصم لا يمكن أن تكون أكبر من 100%.')
      setSaving(false)
      return
    }

    const duplicate = list.some(
      (promo) => promo.code?.toUpperCase() === code && String(promo.id) !== String(editingId)
    )

    if (duplicate) {
      setError('كود الخصم ده موجود بالفعل.')
      setSaving(false)
      return
    }

    const oldPromo = editingId
      ? list.find((promo) => String(promo.id) === String(editingId))
      : null

    const body = {
      code,
      type: form.type,
      value: discountValue,
      minOrder: Number(form.minOrder) || 0,
      maximumDiscount:
        form.maximumDiscount === '' ? null : Number(form.maximumDiscount),
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
      usedCount: oldPromo?.usedCount || 0,
      endDate: form.endDate || null,
      active: oldPromo?.active ?? true,
    }

    try {
      const url = editingId
        ? `${API_URL}/promoCodes/${editingId}`
        : `${API_URL}/promoCodes`

      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('تعذر حفظ الكود')

      resetForm()
      setMessage(editingId ? 'تم تعديل كود الخصم بنجاح.' : 'تم إنشاء كود الخصم بنجاح.')
      await loadPromos()
    } catch (err) {
      console.error('Save promo error:', err)
      setError('حصل خطأ أثناء حفظ الكود. تأكدي إن json-server شغال.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (promo) => {
    setEditingId(promo.id)
    setForm({
      code: promo.code || '',
      type: promo.type || 'percentage',
      value: promo.value ?? '',
      minOrder: promo.minOrder ?? 0,
      maximumDiscount: promo.maximumDiscount ?? '',
      usageLimit: promo.usageLimit ?? '',
      endDate: promo.endDate ? String(promo.endDate).slice(0, 16) : '',
    })
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف كود الخصم؟')) return

    try {
      const response = await fetch(`${API_URL}/promoCodes/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Delete failed')

      if (String(editingId) === String(id)) resetForm()
      setMessage('تم حذف كود الخصم.')
      await loadPromos()
    } catch (err) {
      console.error('Delete promo error:', err)
      setError('تعذر حذف الكود.')
    }
  }

  const handleToggle = async (promo) => {
    try {
      const response = await fetch(`${API_URL}/promoCodes/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !promo.active }),
      })
      if (!response.ok) throw new Error('Toggle failed')

      await loadPromos()
    } catch (err) {
      console.error('Toggle promo error:', err)
      setError('تعذر تغيير حالة الكود.')
    }
  }

  return (
    <section>
      <div className="origin-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <p className="section-eyebrow mb-1">Discounts</p>
            <h2 className="h4 mb-0">أكواد الخصم</h2>
          </div>
          {editingId && (
            <button type="button" className="btn-brew-outline" onClick={resetForm}>
              إلغاء التعديل
            </button>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">كود الخصم</label>
            <input
              required
              name="code"
              className="form-control form-control-beanroute"
              placeholder="WELCOME10"
              value={form.code}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">نوع الخصم</label>
            <select
              name="type"
              className="form-select form-control-beanroute"
              value={form.type}
              onChange={handleChange}
            >
              <option value="percentage">نسبة %</option>
              <option value="fixed">مبلغ ثابت</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">قيمة الخصم</label>
            <input
              required
              type="number"
              min="0"
              name="value"
              className="form-control form-control-beanroute"
              placeholder={form.type === 'percentage' ? '10' : '50'}
              value={form.value}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">الحد الأدنى للطلب</label>
            <input
              type="number"
              min="0"
              name="minOrder"
              className="form-control form-control-beanroute"
              value={form.minOrder}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">أقصى خصم</label>
            <input
              type="number"
              min="0"
              name="maximumDiscount"
              className="form-control form-control-beanroute"
              placeholder="اختياري"
              value={form.maximumDiscount}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">حد الاستخدام</label>
            <input
              type="number"
              min="1"
              name="usageLimit"
              className="form-control form-control-beanroute"
              placeholder="اختياري"
              value={form.usageLimit}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">تاريخ الانتهاء</label>
            <input
              type="datetime-local"
              name="endDate"
              className="form-control form-control-beanroute"
              value={form.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <button disabled={saving} type="submit" className="btn-brew">
              {saving ? 'جاري الحفظ...' : editingId ? 'حفظ التعديل' : 'إنشاء الكود'}
            </button>
          </div>
        </form>
      </div>

      <div className="origin-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 mb-0">الأكواد الموجودة</h3>
          <span className="badge text-bg-secondary">{list.length} كود</span>
        </div>

        {loading ? (
          <div className="text-center py-4">جاري تحميل أكواد الخصم...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-4">مفيش أكواد خصم لسه.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>الخصم</th>
                  <th>الحد الأدنى</th>
                  <th>الاستخدام</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {list.map((promo) => (
                  <tr key={promo.id}>
                    <td><strong>{promo.code}</strong></td>
                    <td>
                      {promo.type === 'percentage'
                        ? `${promo.value}%`
                        : `${promo.value} ج.م`}
                    </td>
                    <td>{promo.minOrder || 0} ج.م</td>
                    <td>
                      {promo.usedCount || 0}
                      {promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${promo.active ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => handleToggle(promo)}
                      >
                        {promo.active ? 'فعال' : 'متوقف'}
                      </button>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark"
                          onClick={() => handleEdit(promo)}
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(promo.id)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
