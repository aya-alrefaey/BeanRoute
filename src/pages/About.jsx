import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 text-center mb-5">
          <p className="section-eyebrow mb-1">قصتنا</p>
          <h1 className="section-title display-6">بنّ ليه اسم... مش بس نوع</h1>
          <p className="fs-5 mt-3" style={{ color: 'var(--coffee-700)' }}>
            بدأنا BeanRoute من سؤال بسيط: ليه لما نشتري بن، بنعرف بس "بن عربي" أو "بن برازيلي"،
            من غير ما نعرف اسم المزرعة ولا القصة اللي وراها؟ قررنا نبني متجر بيربطك مباشرة
            بمصدر كل حبة بن.
          </p>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {[
          { icon: 'bi-geo-alt', title: 'شفافية كاملة', text: 'كل منتج معاه اسم المزرعة، الارتفاع، وطريقة المعالجة' },
          { icon: 'bi-map', title: 'خريطة حقيقية', text: 'تقدر تشوف رحلة بنك بالظبط من المنشأ لحد المحمصة' },
          { icon: 'bi-people', title: 'دعم المزارعين', text: 'بنشتغل مباشرة مع تعاونيات ومزارع صغيرة حول العالم' },
        ].map((v) => (
          <div className="col-md-4" key={v.title}>
            <div className="origin-card p-4 h-100 text-center">
              <i className={`bi ${v.icon} fs-2 mb-3`} style={{ color: 'var(--amber-dark)' }}></i>
              <h3 className="h5">{v.title}</h3>
              <p className="small mb-0" style={{ color: 'var(--coffee-700)' }}>{v.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/products" className="btn-brew">اكتشف المناشئ</Link>
      </div>
    </div>
  )
}
