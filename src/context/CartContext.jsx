import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'

const API_URL = 'http://localhost:3001'
const CartContext = createContext(null)
const GUEST_KEY = 'beanroute_guest_cart'

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]') } catch { return [] }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const saveServerCart = async (next) => {
    if (!user) return
    const res = await fetch(`${API_URL}/carts?userId=${encodeURIComponent(user.id)}`)
    const carts = await res.json()
    const payload = { userId: user.id, items: next.map(({ id, qty }) => ({ id, qty })) }
    if (carts[0]) {
      await fetch(`${API_URL}/carts/${carts[0].id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    } else {
      await fetch(`${API_URL}/carts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    }
  }

  const hydrate = async (stored) => {
    const ids = stored.map(i => i.id).join(',')
    if (!ids) return stored
    try {
      const products = await Promise.all(stored.map(async item => {
        const r = await fetch(`${API_URL}/products/${item.id}`)
        if (!r.ok) return null
        const p = await r.json()
        const max = Number(p.stock) || 0
        if (max <= 0) return null
        return { id: p.id, name: p.name, country: p.country, price: Number(p.price) || 0, unit: p.unit, image: p.image, qty: Math.min(item.qty, max), stock: max, sellerId: p.sellerId ?? null }
      }))
      return products.filter(Boolean)
    } catch { return stored }
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        if (user) {
          const r = await fetch(`${API_URL}/carts?userId=${encodeURIComponent(user.id)}`)
          const carts = await r.json()
          const stored = carts[0]?.items || []
          const hydrated = await hydrate(stored)
          if (!cancelled) setItems(hydrated)
        } else {
          const hydrated = await hydrate(readLocal())
          if (!cancelled) setItems(hydrated)
        }
      } catch { if (!cancelled) setItems([]) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [user])

  const persist = async (next) => {
    setItems(next)
    if (user) {
      try { await saveServerCart(next) } catch { /* keep UI responsive */ }
    } else {
      localStorage.setItem(GUEST_KEY, JSON.stringify(next.map(({ id, qty }) => ({ id, qty }))))
    }
  }

  const addToCart = async (product, qty = 1) => {
    const requested = Math.max(1, Number(qty) || 1)
    const freshRes = await fetch(`${API_URL}/products/${product.id}`)
    if (!freshRes.ok) throw new Error('PRODUCT_NOT_FOUND')
    const fresh = await freshRes.json()
    const stock = Number(fresh.stock) || 0
    if (stock <= 0) throw new Error('OUT_OF_STOCK')
    const existing = items.find(i => i.id === fresh.id)
    const nextQty = (existing?.qty || 0) + requested
    if (nextQty > stock) throw new Error(`ONLY_${stock}_AVAILABLE`)
    const next = existing
      ? items.map(i => i.id === fresh.id ? { ...i, qty: nextQty, stock } : i)
      : [...items, { id: fresh.id, name: fresh.name, country: fresh.country, price: Number(fresh.price) || 0, unit: fresh.unit, image: fresh.image, qty: requested, stock, sellerId: fresh.sellerId ?? null }]
    await persist(next)
  }

  const removeFromCart = async (id) => persist(items.filter(i => i.id !== id))

  const updateQty = async (id, qty) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    const n = Number(qty)
    if (n < 1) return removeFromCart(id)
    const r = await fetch(`${API_URL}/products/${id}`)
    if (!r.ok) return
    const p = await r.json()
    const stock = Number(p.stock) || 0
    if (n > stock) throw new Error(`ONLY_${stock}_AVAILABLE`)
    await persist(items.map(i => i.id === id ? { ...i, qty: n, stock } : i))
  }

  const clearCart = async () => {
    setItems([])
    if (user) {
      try { await saveServerCart([]) } catch {}
    } else localStorage.removeItem(GUEST_KEY)
  }

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.price, 0), [items])

  return <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
