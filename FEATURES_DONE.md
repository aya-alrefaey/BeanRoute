# BeanRoute - React Only Completion

This version keeps the project React + json-server only.

Implemented/connected:
- User registration/login with roles and email-confirmation simulation
- Profile/address management and safe saved-card display (last 4 only)
- Per-user wishlist and cart persistence
- Stock validation and stock deduction at checkout
- Checkout for guest and logged-in users
- COD, Card, Wallet and PayPal as clearly labeled payment simulations
- Promo codes with limits/expiry/minimum order validation
- Orders, order history and tracking timeline
- Admin users, products, categories, orders, banners and promo codes
- Seller product/inventory management, seller orders and sales totals
- Verified-purchase review rule and one-review-per-product rule
- In-app order/email notification simulation

Run:
1. npm install
2. npm run api
3. npm run dev

The payment/email/social-login pieces are intentionally simulations because this project is React-only and has no secure backend. Never store full card numbers or CVV in db.json.
