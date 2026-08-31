import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer-beanroute pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-cup-hot-fill" style={{ color: 'var(--amber)', fontSize: '1.5rem' }}></i>
              <span className="wordmark fs-4">BeanRoute</span>
            </div>
            <p style={{ color: 'var(--parchment-2)', maxWidth: '320px' }}>
              بنّ بنعرف اسم المزرعة اللي جاء منها، وبنحكي رحلته من الأرض لحد الكوب اللي في إيدك.
            </p>
          </div>
          <div className="col-md-2">
            <h6 className="text-uppercase mb-3" style={{ letterSpacing: '0.08em', fontSize: '0.8rem', color: 'var(--amber)' }}>المتجر</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/products">كل المنتجات</Link></li>
              <li><Link to="/about">قصتنا</Link></li>
              <li><Link to="/cart">السلة</Link></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="text-uppercase mb-3" style={{ letterSpacing: '0.08em', fontSize: '0.8rem', color: 'var(--amber)' }}>الحساب</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/login">تسجيل الدخول</Link></li>
              <li><Link to="/register">إنشاء حساب</Link></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="text-uppercase mb-3" style={{ letterSpacing: '0.08em', fontSize: '0.8rem', color: 'var(--amber)' }}>تواصل معنا</h6>
            <div className="d-flex gap-3 fs-5">
              <a href="#"><i className="bi bi-instagram"></i></a>
              <a href="#"><i className="bi bi-facebook"></i></a>
              <a href="#"><i className="bi bi-whatsapp"></i></a>
            </div>
          </div>
        </div>
        <hr style={{ borderColor: 'rgba(241,230,214,0.15)' }} className="my-4" />
        <p className="text-center mb-0" style={{ color: 'var(--parchment-2)', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} BeanRoute — مشروع أكاديمي (Final Project) مبني بـ React
        </p>
      </div>
    </footer>
  )
}
