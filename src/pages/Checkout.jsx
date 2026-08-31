import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import StripeCardForm from '../components/StripeCardForm.jsx'

const API_URL = 'http://localhost:3001'
const SHIPPING = 40

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [payment, setPayment] = useState('cod')
  const [promo, setPromo] = useState('')
  const [promoInfo, setPromoInfo] = useState(null)
  const [placed, setPlaced] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', address: user?.address || '', city: user?.city || '' })
  const [cardState, setCardState] = useState({ name: '', number: '', expiry: '', cvc: '' })
  const [cardValid, setCardValid] = useState(false)

  useEffect(() => setForm({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', address: user?.address || '', city: user?.city || '' }), [user])

  const discount = useMemo(() => {
    if (!promoInfo) return 0
    return promoInfo.type === 'percentage' ? Math.min(totalPrice * (Number(promoInfo.value) / 100), Number(promoInfo.maximumDiscount) || Infinity) : Math.min(Number(promoInfo.value) || 0, totalPrice)
  }, [promoInfo, totalPrice])
  const total = Math.max(0, totalPrice - discount + (items.length ? SHIPPING : 0))
  const canSubmit = payment !== 'card' || cardValid

  const change = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const applyPromo = async () => {
    setError('')
    if (!promo.trim()) return setPromoInfo(null)
    try {
      const r = await fetch(`${API_URL}/promoCodes?code=${encodeURIComponent(promo.trim().toUpperCase())}&active=true`)
      const data = await r.json()
      const p = data[0]
      if (!p) throw new Error('PROMO_INVALID')
      const now = Date.now()
      if (p.startDate && new Date(p.startDate).getTime() > now) throw new Error('PROMO_NOT_STARTED')
      if (p.endDate && new Date(p.endDate).getTime() < now) throw new Error('PROMO_EXPIRED')
      if (p.usageLimit != null && Number(p.usedCount || 0) >= Number(p.usageLimit)) throw new Error('PROMO_LIMIT')
      if (totalPrice < Number(p.minOrder || 0)) throw new Error(`MIN_${p.minOrder}`)
      setPromoInfo(p)
    } catch (e) {
      setPromoInfo(null)
      const msg = { PROMO_INVALID: 'كود الخصم غير صحيح', PROMO_EXPIRED: 'كود الخصم انتهت صلاحيته', PROMO_NOT_STARTED: 'كود الخصم لسه مش متاح', PROMO_LIMIT: 'كود الخصم وصل لحد الاستخدام', }[e.message]
      setError(msg || (e.message?.startsWith('MIN_') ? `الحد الأدنى لاستخدام الكود ${e.message.slice(4)} ج.م` : 'مش قادر أتحقق من الكود'))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!canSubmit || !items.length) return
    setError(''); setSubmitting(true)
    try {
      // Refresh every product immediately before creating the order.
      const freshItems = []
      for (const item of items) {
        const r = await fetch(`${API_URL}/products/${item.id}`)
        if (!r.ok) throw new Error('PRODUCT_MISSING')
        const p = await r.json()
        if (Number(p.stock) < item.qty) throw new Error(`STOCK_${p.name}_${p.stock}`)
        freshItems.push({ product: p, qty: item.qty })
      }

      const orderItems = freshItems.map(({ product: p, qty }) => ({ id: p.id, productId: p.id, sellerId: p.sellerId ?? null, name: p.name, qty, price: Number(p.price) || 0 }))
      const status = 'قيد المعالجة'
      const order = {
        userId: user?.id || null,
        customer: form,
        items: orderItems,
        payment,
        paymentStatus: payment === 'cod' ? 'Pending' : 'Paid (Simulation)',
        paymentDetails: payment === 'card' ? { last4: cardState.number.replace(/\D/g, '').slice(-4), cardHolder: cardState.name } : null,
        subtotal: totalPrice,
        discount: Math.round(discount * 100) / 100,
        promoCode: promoInfo?.code || null,
        shipping: SHIPPING,
        total: Math.round(total * 100) / 100,
        status,
        statusHistory: [{ status, at: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
      }
      const orderRes = await fetch(`${API_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) })
      if (!orderRes.ok) throw new Error('ORDER_FAILED')
      const created = await orderRes.json()

      // Deduct stock after the order is created.
      for (const { product: p, qty } of freshItems) {
        await fetch(`${API_URL}/products/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock: Number(p.stock) - qty }) })
      }
      if (promoInfo) await fetch(`${API_URL}/promoCodes/${promoInfo.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usedCount: Number(promoInfo.usedCount || 0) + 1 }) })
      await fetch(`${API_URL}/notifications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user?.id || null, email: form.email, type: 'order', title: 'تأكيد الطلب', message: `تم تأكيد طلبك #${String(created.id).slice(-6)} بقيمة ${created.total} ج.م`, read: false, createdAt: new Date().toISOString() }) })
      await clearCart()
      setOrderId(created.id); setPlaced(true)
    } catch (e) {
      const message = e.message?.startsWith('STOCK_') ? `الكمية المتاحة من ${e.message.split('_')[1]} هي ${e.message.split('_')[2]}` : 'حصل خطأ أثناء تأكيد الطلب — تأكد إن npm run api شغّال وحاول تاني'
      setError(message)
    } finally { setSubmitting(false) }
  }

  if (items.length === 0 && !placed) { navigate('/cart'); return null }
  if (placed) return <div className="container py-5 text-center"><i className="bi bi-check-circle" style={{ fontSize: '3rem', color: 'var(--leaf)' }}></i><h1 className="section-title h3 mt-3">تم استلام طلبك!</h1><p style={{ color: 'var(--coffee-700)' }}>طلب #{String(orderId).slice(-6)} اتسجل بنجاح. إشعارات الطلب هتظهر في حسابك.</p><div className="d-flex gap-3 justify-content-center mt-3"><button className="btn-brew" onClick={() => navigate('/products')}>واصل التسوق</button>{user && <button className="btn-brew-outline" onClick={() => navigate('/orders')}>شوف طلباتي</button>}</div></div>

  return <div className="container py-5">
    <h1 className="section-title h2 mb-4">إتمام الطلب</h1>
    {!user && <div className="alert mb-4" style={{ background: 'rgba(71,86,62,0.08)', color: 'var(--leaf)', border: '1px solid var(--leaf)' }}>بتكمّل الطلب كضيف. بيانات الطلب هتتحفظ معاه.</div>}
    <form className="row g-5" onSubmit={handleSubmit}>
      <div className="col-lg-7">
        <h2 className="h5 mb-3">بيانات الشحن</h2>
        <div className="row g-3 mb-4">
          {['name','phone','email','address','city'].map((f, i) => <div key={f} className={f === 'email' || f === 'address' ? 'col-12' : 'col-md-6'}><input required type={f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'} value={form[f]} onChange={change(f)} className="form-control form-control-beanroute" placeholder={{name:'الاسم بالكامل',phone:'رقم الموبايل',email:'البريد الإلكتروني',address:'العنوان بالتفصيل',city:'المدينة'}[f]} /></div>)}
        </div>
        <h2 className="h5 mb-3">طريقة الدفع</h2>
        <div className="d-flex flex-column gap-2">
          {[['cod','الدفع عند الاستلام','bi-cash-coin'],['card','بطاقة ائتمان (Simulation)','bi-credit-card'],['wallet','محفظة إلكترونية (Simulation)','bi-wallet2'],['paypal','PayPal (Simulation)','bi-paypal']].map(([id,label,icon]) => <div key={id}><label className="d-flex align-items-center gap-2 p-3" style={{ border: `1px solid ${payment === id ? 'var(--amber)' : 'var(--cream-line)'}`, borderRadius: 4, cursor: 'pointer' }}><input type="radio" name="payment" checked={payment === id} onChange={() => setPayment(id)} /><i className={`bi ${icon}`}></i>{label}</label>{id === 'card' && payment === 'card' && <div className="mt-2"><StripeCardForm cardState={cardState} setCardState={setCardState} onValidityChange={setCardValid} /></div>}</div>)}
        </div>
      </div>
      <div className="col-lg-5"><div className="origin-card p-4"><h2 className="h5 mb-3">ملخص الطلب</h2>{items.map(i => <div className="d-flex justify-content-between small mb-2" key={i.id}><span style={{ color:'var(--coffee-700)' }}>{i.name} × {i.qty}</span><span>{i.qty*i.price} ج.م</span></div>)}<div className="input-group my-3"><input className="form-control form-control-beanroute" placeholder="كود الخصم" value={promo} onChange={e=>setPromo(e.target.value)} /><button type="button" className="btn-brew-outline" onClick={applyPromo}>تفعيل</button></div>{promoInfo && <p className="small" style={{color:'var(--leaf)'}}>تم تطبيق {promoInfo.code} — خصم {discount} ج.م</p>}{error && <p className="small" style={{color:'var(--stamp-red)'}}>{error}</p>}<hr style={{borderColor:'var(--cream-line)'}}/><div className="d-flex justify-content-between mb-2"><span style={{color:'var(--coffee-700)'}}>المنتجات</span><span>{totalPrice} ج.م</span></div><div className="d-flex justify-content-between mb-2"><span style={{color:'var(--coffee-700)'}}>الخصم</span><span>- {discount} ج.م</span></div><div className="d-flex justify-content-between mb-3"><span style={{color:'var(--coffee-700)'}}>الشحن</span><span>{SHIPPING} ج.م</span></div><div className="d-flex justify-content-between mb-4 fw-bold fs-5"><span>الإجمالي</span><span>{total} ج.م</span></div><button type="submit" disabled={submitting || !canSubmit} className="btn-brew w-100">{submitting?'جاري التأكيد...':'تأكيد الطلب'}</button></div></div>
    </form>
  </div>
}
