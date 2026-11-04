import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

const CART_KEY = 'cafeteria_cart'
const SLOT_KEY = 'cafeteria_slot'

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadFromStorage(CART_KEY, []))
  const [selectedSlot, setSelectedSlotState] = useState(() => loadFromStorage(SLOT_KEY, null))

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem(SLOT_KEY, JSON.stringify(selectedSlot))
  }, [selectedSlot])

  const addItem = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === item._id)
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i._id !== id))
  }

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, quantity: qty } : i))
    )
  }

  const clearCart = () => {
    setItems([])
    setSelectedSlotState(null)
    localStorage.removeItem(CART_KEY)
    localStorage.removeItem(SLOT_KEY)
  }

  const setSelectedSlot = (slot) => {
    setSelectedSlotState(slot)
  }

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        selectedSlot,
        cartCount,
        cartTotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setSelectedSlot
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
