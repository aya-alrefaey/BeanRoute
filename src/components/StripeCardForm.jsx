import React, { useState } from 'react'

// ⚠️ محاكاة لفورم Stripe Elements بس — من غير أي اتصال حقيقي بـ Stripe.
// في مشروع حقيقي: هتستخدم @stripe/stripe-js + @stripe/react-stripe-js،
// وهتعمل PaymentIntent من backend حقيقي (مينفعش من الفرونت اند لوحده لأسباب أمان).
// كارت الاختبار الرسمي من Stripe: 4242 4242 4242 4242 — أي تاريخ مستقبلي وأي CVC.

const TEST_CARD = '4242424242424242'

function luhnCheck(num) {
  const digits = num.replace(/\D/g, '')
  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10)
    if (shouldDouble) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    shouldDouble = !shouldDouble
  }
  return digits.length >= 12 && sum % 10 === 0
}

function formatCard(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export default function StripeCardForm({ onValidityChange, cardState, setCardState }) {
  const [touched, setTouched] = useState(false)

  const cardValid = luhnCheck(cardState.number)
  const expiryValid = /^\d{2}\/\d{2}$/.test(cardState.expiry)
  const cvcValid = /^\d{3,4}$/.test(cardState.cvc)
  const allValid = cardValid && expiryValid && cvcValid && cardState.name.trim().length > 1

  React.useEffect(() => {
    onValidityChange(allValid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allValid])

  const useTestCard = () => {
    setCardState({ name: cardState.name || 'Test User', number: TEST_CARD, expiry: '12/30', cvc: '123' })
  }

  return (
    <div className="p-3" style={{ border: '1px solid var(--cream-line)', borderRadius: 4 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="small fw-bold d-flex align-items-center gap-2" style={{ color: 'var(--coffee-950)' }}>
          <i className="bi bi-shield-lock"></i> بيانات الكارت (وضع اختبار Stripe)
        </span>
        <button type="button" onClick={useTestCard} className="btn btn-sm p-0" style={{ color: 'var(--amber-dark)', fontSize: '0.78rem' }}>
          استخدم كارت تجريبي
        </button>
      </div>

      <div className="d-flex flex-column gap-2">
        <input
          className="form-control form-control-beanroute"
          placeholder="الاسم على الكارت"
          value={cardState.name}
          onChange={(e) => setCardState((s) => ({ ...s, name: e.target.value }))}
          onBlur={() => setTouched(true)}
        />
        <input
          className="form-control form-control-beanroute"
          placeholder="1234 1234 1234 1234"
          value={formatCard(cardState.number)}
          onChange={(e) => setCardState((s) => ({ ...s, number: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
          onBlur={() => setTouched(true)}
          inputMode="numeric"
        />
        <div className="row g-2">
          <div className="col-6">
            <input
              className="form-control form-control-beanroute"
              placeholder="MM/YY"
              value={cardState.expiry}
              onChange={(e) => setCardState((s) => ({ ...s, expiry: formatExpiry(e.target.value) }))}
              onBlur={() => setTouched(true)}
              inputMode="numeric"
            />
          </div>
          <div className="col-6">
            <input
              className="form-control form-control-beanroute"
              placeholder="CVC"
              value={cardState.cvc}
              onChange={(e) => setCardState((s) => ({ ...s, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              onBlur={() => setTouched(true)}
              inputMode="numeric"
            />
          </div>
        </div>
      </div>

      {touched && !allValid && (
        <p className="small mt-2 mb-0" style={{ color: 'var(--stamp-red)' }}>
          {!cardValid && cardState.number ? 'رقم الكارت مش صحيح. ' : ''}
          {!expiryValid && cardState.expiry ? 'تاريخ الانتهاء لازم يكون MM/YY. ' : ''}
          {!cvcValid && cardState.cvc ? 'CVC لازم يكون 3 أو 4 أرقام.' : ''}
          {!cardState.number && !cardState.expiry && !cardState.cvc ? 'كمّل بيانات الكارت.' : ''}
        </p>
      )}

      <p className="small mt-2 mb-0" style={{ color: 'var(--coffee-700)' }}>
        <i className="bi bi-info-circle me-1"></i>
        وضع اختبار — مفيش خصم فعلي. جرب كارت Stripe التجريبي: 4242 4242 4242 4242
      </p>
    </div>
  )
}
