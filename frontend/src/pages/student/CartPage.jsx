import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Clock } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { useCart } from '../../context/CartContext'
import { orders as ordersApi, admin as adminApi } from '../../api/endpoints'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, selectedSlot, setSelectedSlot, cartTotal } = useCart()
  const navigate = useNavigate()
  const [slots, setSlots] = useState([])
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(true)

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await adminApi.getPickupSlots()
        const slotData = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.slots)
          ? res.data.slots
          : Array.isArray(res.data)
          ? res.data
          : []
        setSlots(slotData)
      } catch {
        // Fallback slots
        setSlots([
          { _id: '1', time: '12:00 PM', currentBookings: 5, maxCapacity: 20 },
          { _id: '2', time: '12:15 PM', currentBookings: 8, maxCapacity: 20 },
          { _id: '3', time: '12:30 PM', currentBookings: 12, maxCapacity: 20 },
          { _id: '4', time: '12:45 PM', currentBookings: 3, maxCapacity: 20 },
          { _id: '5', time: '1:00 PM', currentBookings: 15, maxCapacity: 20 }
        ])
      } finally {
        setSlotsLoading(false)
      }
    }
    fetchSlots()
  }, [])

  const tax = cartTotal * 0.05
  const total = cartTotal + tax

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    if (!selectedSlot) {
      toast.error('Please select a pickup slot')
      return
    }
    setLoading(true)
    try {
      const orderData = {
        items: items.map((i) => ({ menuItem: i._id, quantity: i.quantity })),
        pickupSlot: selectedSlot,
        specialInstructions: instructions
      }
      const res = await ordersApi.createOrder(orderData)
      const orderId = res.data?.data?._id || res.data?.order?._id || res.data?._id || res.data?.orderId
      clearCart()
      toast.success('Order placed successfully! 🎉')
      navigate(`/orders/${orderId}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 px-4">
          <ShoppingBag size={72} className="text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Browse the menu and add items to get started</p>
          <Link
            to="/menu"
            className="flex items-center gap-2 bg-navy-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-navy-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Browse Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/menu" className="text-gray-500 hover:text-navy-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <span className="text-sm text-gray-500">({items.length} item{items.length !== 1 ? 's' : ''})</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {item.emoji || '🍽️'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                  <p className="text-teal-600 font-medium text-sm">₹{item.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-200 transition-colors text-gray-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-200 transition-colors text-gray-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-16 text-right">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => { removeItem(item._id); toast(`${item.name} removed`, { icon: '🗑️' }) }}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors ml-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Special instructions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any allergies, dietary requirements, or special requests..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-navy-600"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-lg">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Pickup Slot */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <Clock size={15} />
                  Pickup Slot *
                </label>
                {slotsLoading ? (
                  <div className="animate-pulse h-10 bg-gray-100 rounded-lg" />
                ) : (
                  <select
                    value={selectedSlot || ''}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-navy-600 bg-white ${
                      !selectedSlot ? 'border-orange-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">— Choose a time slot —</option>
                    {slots.map((slot) => {
                      const used = slot.currentBookings ?? slot.used ?? 0
                      const capacity = slot.maxCapacity ?? slot.capacity ?? 20
                      const full = used >= capacity
                      return (
                        <option key={slot._id} value={slot._id} disabled={full}>
                          {slot.time} ({used}/{capacity} slots booked){full ? ' — FULL' : ''}
                        </option>
                      )
                    })}
                  </select>
                )}
                {!selectedSlot && (
                  <p className="text-xs text-orange-500 mt-1">Please select a pickup slot to continue</p>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedSlot}
                className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    Place Order — ₹{total.toFixed(2)}
                  </>
                )}
              </button>
            </div>

            <Link
              to="/menu"
              className="flex items-center justify-center gap-2 w-full text-navy-600 hover:text-navy-700 text-sm font-medium py-2"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
