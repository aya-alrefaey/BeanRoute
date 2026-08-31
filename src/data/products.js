// المنتجات أصبحت تُقرأ من json-server. الملف متروك فقط للتوافق مع أي imports قديمة.
export const products = []
export const getProductById = async (id) => {
  const response = await fetch(`http://localhost:3001/products/${id}`)
  if (!response.ok) return null
  return response.json()
}
