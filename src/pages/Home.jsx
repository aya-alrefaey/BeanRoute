import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [banner, setBanner] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/products?active=true&_limit=3').then((r) => r.json()),
      fetch('http://localhost:3001/banners/home-hero').then((r) => r.ok ? r.json() : null),
    ]).then(([products, bannerData]) => {
      setFeatured(products)
      setBanner(bannerData)
    }).catch(() => {})
  }, [])

  return (
    <>
      {/* HERO */}
      <section className="hero-beanroute py-5">
        <div className="container py-4">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <p className="hero-eyebrow mb-3">من المزرعة إلى فنجانك</p>
              <h1 className="hero-title display-4 mb-4" style={{ color: 'var(--coffee-950)' }}>
                {banner?.active === false ? 'اكتشف رحلة البن من المزرعة إلى فنجانك' : (banner?.title || <>كل كيس بن... <span style={{ color: 'var(--amber)' }}>رحلة</span> لها اسم ووجهة</>)}
              </h1>
              <p className="fs-5 mb-4" style={{ color: 'var(--coffee-700)', maxWidth: '520px' }}>
                {banner?.subtitle || <>في BeanRoute بنجيب البن من مزارع بعينها في إثيوبيا وكولومبيا واليمن وغيرهم، وبنوريك
                خريطة رحلته الحقيقية من الأرض لحد الكوب.</>}
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/products" className="btn-brew">
                  اكتشف المتجر <i className="bi bi-arrow-left ms-1"></i>
                </Link>
                <Link to="/about" className="btn-brew-outline">
                  إزاي بنشتغل؟
                </Link>
              </div>

              <div className="d-flex align-items-center mt-5 gap-3">
                <div className="route-dot"></div>
                <div className="route-line"></div>
                <i className="bi bi-airplane" style={{ color: 'var(--coffee-700)' }}></i>
                <div className="route-line"></div>
                <div className="route-dot" style={{ background: 'var(--coffee-950)' }}></div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <small style={{ color: 'var(--coffee-700)' }}>المزرعة</small>
                <small style={{ color: 'var(--coffee-700)' }}>فنجانك</small>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop"
                  alt="حبوب بن محمصة"
                  className="img-fluid rounded-1"
                  style={{ border: '1px solid var(--cream-line)' }}
                />
                <div
                  className="stamp position-absolute"
                  style={{ bottom: '-20px', left: '-20px', background: 'var(--parchment)' }}
                >
                  <span className="fw-bold">6</span>
                  <small>مناشئ حول العالم</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ORIGINS */}
      <section className="container py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <div>
            <p className="section-eyebrow mb-1">مناشئ مختارة</p>
            <h2 className="section-title">ابدأ رحلتك من هنا</h2>
          </div>
          <Link to="/products" className="nav-link-custom">
            كل المنتجات <i className="bi bi-arrow-left"></i>
          </Link>
        </div>
        <div className="row g-4">
          {featured.map((p) => (
            <div className="col-md-4" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-5" style={{ background: 'var(--parchment-2)', borderTop: '1px solid var(--cream-line)', borderBottom: '1px solid var(--cream-line)' }}>
        <div className="container py-4">
          <p className="section-eyebrow mb-1 text-center">رحلة الكوب</p>
          <h2 className="section-title text-center mb-5">من شجرة البن لحد إيدك</h2>
          <div className="row text-center g-4">
            {[
              { icon: 'bi-flower2', title: 'القطف', text: 'كرزة البن بتتقطف يدويًا وهي ناضجة تمامًا من مزارع بعينها' },
              { icon: 'bi-droplet', title: 'المعالجة', text: 'غسيل أو تجفيف طبيعي حسب تقاليد كل منطقة' },
              { icon: 'bi-fire', title: 'التحميص', text: 'بتتحمص أسبوعيًا في القاهرة على درجة تناسب طبيعة كل حبة' },
              { icon: 'bi-cup-hot', title: 'التقديم', text: 'توصلك طازة، ومعاها خريطة الرحلة اللي قطعتها ليك' },
            ].map((step, i) => (
              <div className="col-6 col-md-3" key={i}>
                <div className="d-flex flex-column align-items-center">
                  <div
                    className="d-flex align-items-center justify-content-center mb-3"
                    style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--parchment)', border: '1px solid var(--cream-line)' }}
                  >
                    <i className={`bi ${step.icon} fs-3`} style={{ color: 'var(--amber-dark)' }}></i>
                  </div>
                  <h3 className="h6" style={{ color: 'var(--coffee-950)' }}>{step.title}</h3>
                  <p className="small" style={{ color: 'var(--coffee-700)' }}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-5 text-center">
        <h2 className="section-title mb-3">جاهز تجرب رحلة جديدة؟</h2>
        <p className="mb-4" style={{ color: 'var(--coffee-700)' }}>تصفح كل المناشئ وشوف خريطة كل واحدة منهم بنفسك</p>
        <Link to="/products" className="btn-brew">تصفح المتجر</Link>
      </section>
    </>
  )
}
