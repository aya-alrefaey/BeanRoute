import React, { useEffect, useState } from 'react'

const API_URL = 'http://localhost:3001'
const emptyForm = {
  name: '',
  country: '',
  price: '',
  unit: '250 جم',
  stock: '',
  image: '',
  description: '',
  categoryId: '',
  roast: '',
  notes: '',
  farm: '',
  altitude: '',
  process: '',
  latitude: '',
  longitude: ''
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([fetch(`${API_URL}/products?_sort=name`), fetch(`${API_URL}/categories?_sort=name`)])
      setProducts(await pRes.json())
      setCategories(await cRes.json())
    } catch { setError('مش قادر أجيب البيانات — تأكد إن npm run api شغّال') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const change = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const reset = () => { setForm(emptyForm); setEditingId(null) }

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
    const payload = {
  name: form.name.trim(),
  country: form.country.trim(),
  price: Number(form.price),
  unit: form.unit,
  stock: Number(form.stock),

  image:
    form.image ||
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',

  description: form.description,

  categoryId: form.categoryId || null,

  roast: form.roast || 'تحميص متوسط',

  notes: form.notes
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean),

  farm: form.farm || `مزرعة ${form.country}`,

  altitude: form.altitude || '1500–1800م',

  process: form.process || 'مغسول (Washed)',

  story:
    form.description ||
    `رحلة بن مميزة من ${form.country} إلى محمصة BeanRoute في القاهرة.`,

  roaster:
    'اتحمصت في محمصة BeanRoute بالقاهرة، دفعة أسبوعية',

  coords: [
    Number(form.latitude) || 30.0444,
    Number(form.longitude) || 31.2357
  ],

  active: true
}
      if (editingId) await fetch(`${API_URL}/products/${editingId}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      else await fetch(`${API_URL}/products`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      reset(); await load()
    } catch { setError('حصل خطأ أثناء حفظ المنتج') }
    finally { setSaving(false) }
  }

  const edit = (p) => setForm({
  name: p.name || '',
  country: p.country || '',
  price: p.price || '',
  unit: p.unit || '250 جم',
  stock: p.stock ?? 0,
  image: p.image || '',
  description: p.description || p.story || '',
  categoryId: p.categoryId || '',
  roast: p.roast || '',
  notes: (p.notes || []).join(', '),

  farm: p.farm || '',
  altitude: p.altitude || '',
  process: p.process || '',

  latitude: p.coords?.[0] ?? '',
  longitude: p.coords?.[1] ?? ''
})
  const startEdit = (p) => { edit(p); setEditingId(p.id); window.scrollTo({top:0,behavior:'smooth'}) }
  const remove = async (id) => { if (!window.confirm('متأكد إنك عايز تحذف المنتج؟')) return; await fetch(`${API_URL}/products/${id}`, {method:'DELETE'}); setProducts((x)=>x.filter((p)=>p.id!==id)) }
  const toggleActive = async (p) => { const active=!p.active; await fetch(`${API_URL}/products/${p.id}`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({active})}); setProducts((x)=>x.map((i)=>i.id===p.id?{...i,active}:i)) }

  return <div>
    <div className="origin-card p-4 mb-4">
      <h2 className="h5 mb-3">{editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
      <form onSubmit={submit} className="row g-3">
        <div className="col-md-6"><input required className="form-control form-control-beanroute" placeholder="اسم المنتج" value={form.name} onChange={change('name')} /></div>
        <div className="col-md-6"><input required className="form-control form-control-beanroute" placeholder="بلد المنشأ" value={form.country} onChange={change('country')} /></div>
        <div className="col-6 col-md-3"><input required type="number" min="0" className="form-control form-control-beanroute" placeholder="السعر" value={form.price} onChange={change('price')} /></div>
        <div className="col-6 col-md-3"><input required type="number" min="0" className="form-control form-control-beanroute" placeholder="المخزون" value={form.stock} onChange={change('stock')} /></div>
        <div className="col-md-6"><select required className="form-select form-control-beanroute" value={form.categoryId} onChange={change('categoryId')}><option value="">اختار التصنيف</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="col-md-6"><input className="form-control form-control-beanroute" placeholder="درجة التحميص" value={form.roast} onChange={change('roast')} /></div>
        <div className="col-md-6"><input className="form-control form-control-beanroute" placeholder="رابط الصورة" value={form.image} onChange={change('image')} /></div>
        <div className="col-md-6"><input className="form-control form-control-beanroute" placeholder="النكهات، افصل بينهم بفاصلة" value={form.notes} onChange={change('notes')} /></div>
        <div className="col-12"><textarea className="form-control form-control-beanroute" rows="3" placeholder="الوصف" value={form.description} onChange={change('description')} /></div>
        <div className="col-md-6">
  <input
    className="form-control form-control-beanroute"
    placeholder="اسم المزرعة"
    value={form.farm}
    onChange={change('farm')}
  />
</div>

<div className="col-md-6">
  <input
    className="form-control form-control-beanroute"
    placeholder="الارتفاع مثال: 1800–2000م"
    value={form.altitude}
    onChange={change('altitude')}
  />
</div>

<div className="col-md-6">
  <input
    className="form-control form-control-beanroute"
    placeholder="طريقة المعالجة"
    value={form.process}
    onChange={change('process')}
  />
</div>

<div className="col-md-3">
  <input
    type="number"
    step="any"
    className="form-control form-control-beanroute"
    placeholder="Latitude"
    value={form.latitude}
    onChange={change('latitude')}
  />
</div>

<div className="col-md-3">
  <input
    type="number"
    step="any"
    className="form-control form-control-beanroute"
    placeholder="Longitude"
    value={form.longitude}
    onChange={change('longitude')}
  />
</div>
        <div className="col-12 d-flex gap-2"><button disabled={saving} className="btn-brew">{saving?'جاري الحفظ...':editingId?'حفظ التعديلات':'إضافة المنتج'}</button>{editingId&&<button type="button" className="btn-brew-outline" onClick={reset}>إلغاء</button>}</div>
     
      </form>
      {error && <p className="mt-3 mb-0" style={{color:'var(--stamp-red)'}}>{error}</p>}
    </div>

    {loading ? <p>جاري التحميل...</p> : <div className="d-flex flex-column gap-3">{products.map(p=><div className="origin-card p-3" key={p.id}>
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <img src={p.image} alt={p.name} style={{width:70,height:70,objectFit:'cover',borderRadius:4}} />
        <div className="flex-grow-1"><strong>{p.name}</strong><div className="small" style={{color:'var(--coffee-700)'}}>{p.country} · {p.price} ج.م · المخزون: {p.stock}</div><div className="small">{categories.find(c=>c.id===p.categoryId)?.name || 'بدون تصنيف'} · {p.active===false?'غير ظاهر':'ظاهر'}</div></div>
        <button className="btn btn-sm" onClick={()=>startEdit(p)} style={{border:'1px solid var(--cream-line)'}}>تعديل</button>
        <button className="btn btn-sm" onClick={()=>toggleActive(p)} style={{border:'1px solid var(--cream-line)'}}>{p.active===false?'تفعيل':'إخفاء'}</button>
        <button className="btn btn-sm" onClick={()=>remove(p.id)} style={{border:'1px solid var(--cream-line)',color:'var(--stamp-red)'}}>حذف</button>
      </div>
    </div>)}</div>}
  </div>
}
