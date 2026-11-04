import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Clock, CheckCircle, ChefHat, BellRing, PartyPopper,
  ArrowLeft, XCircle, RefreshCw, Package
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import { orders as ordersApi } from '../../api/endpoints'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock, message: 'Your order has been received and is awaiting acceptance.' },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle, message: 'Great news! Your order has been accepted by the cafeteria.' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, message: 'Your order is being freshly prepared! Ready in ~10 mins.' },
  { key: 'ready', label: 'Ready for Collection', icon: BellRing, message: '🔔 Your order is ready! Please collect it from the counter.' },
  { key: 'completed', label: 'Completed', icon: PartyPopper, message: '🎉 Order completed. Enjoy your meal!' }
]

const STATUS_ORDER = ['pending', 'accepted', 'preparing', 'ready', 'completed']

export default function OrderTrackingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const intervalRef = useRef(null)

  const fetchOrder = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await ordersApi.getOrderById(id)
      setOrder(res.data?.data || res.data?.order || res.data)
    } catch {
      if (!silent) toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOrder()
    intervalRef.current = setInterval(() => fetchOrder(true), 15000)
    return () => clearInterval(intervalRef.current)
  }, [fetchOrder])

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await ordersApi.cancelOrder(id)
      toast.success('Order cancelled successfully')
      fetchOrder()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const currentStepIdx = order ? STATUS_ORDER.indexOf(order.status) : 0
  const isCancelled = order?.status === 'cancelled'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-24">
          <Package size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Order not found</h2>
          <Link to="/orders" className="text-navy-600 hover:underline text-sm mt-2 inline-block">← Back to orders</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/orders" className="text-gray-500 hover:text-navy-600">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
              <span>Total: <strong className="text-navy-700">₹{order.totalAmount?.toFixed(2)}</strong></span>
              {order.pickupSlot && (
                <span>📍 Pickup: <strong>{typeof order.pickupSlot === 'object' ? order.pickupSlot.time : order.pickupSlot}</strong></span>
              )}
              <StatusBadge status={order.status} size="lg" />
            </div>
          </div>
          <button
            onClick={() => fetchOrder(true)}
            className="text-gray-400 hover:text-navy-600 p-2 rounded-lg hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Progress Stepper */}
        {!isCancelled && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-6 uppercase tracking-wide">Order Progress</h2>

            {/* Desktop horizontal stepper */}
            <div className="hidden sm:block">
              <div className="relative">
                {/* Progress bar */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 mx-8">
                  <div
                    className="h-full bg-teal-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, (currentStepIdx / (STEPS.length - 1)) * 100)}%` }}
                  />
                </div>
                <div className="relative flex justify-between">
                  {STEPS.map((step, idx) => {
                    const Icon = step.icon
                    const done = idx < currentStepIdx
                    const active = idx === currentStepIdx
                    return (
                      <div key={step.key} className="flex flex-col items-center w-20">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                          done ? 'bg-teal-500 text-white' :
                          active ? 'bg-navy-600 text-white ring-4 ring-navy-100' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <p className={`text-xs mt-2 text-center leading-tight font-medium ${
                          active ? 'text-navy-700' : done ? 'text-teal-600' : 'text-gray-400'
                        }`}>{step.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mobile vertical stepper */}
            <div className="sm:hidden space-y-4">
              {STEPS.map((step, idx) => {
                const Icon = step.icon
                const done = idx < currentStepIdx
                const active = idx === currentStepIdx
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      done ? 'bg-teal-500 text-white' :
                      active ? 'bg-navy-600 text-white' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-semibold ${active ? 'text-navy-700' : done ? 'text-teal-700' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {active && <p className="text-xs text-gray-500 mt-0.5">{step.message}</p>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Status message */}
            {currentStepIdx >= 0 && (
              <div className={`mt-5 p-3 rounded-lg text-sm ${
                order.status === 'ready' ? 'bg-green-50 text-green-700 border border-green-200' :
                order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                {STEPS[currentStepIdx]?.message || ''}
              </div>
            )}
          </div>
        )}

        {/* Cancelled state */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-5 flex items-center gap-3">
            <XCircle size={24} className="text-red-500 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Order Cancelled</p>
              <p className="text-sm text-red-500">This order has been cancelled.</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Ordered Items</h2>
          <div className="divide-y divide-gray-50">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.menuItem?.emoji || '🍽️'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.menuItem?.name || item.name}</p>
                    <p className="text-xs text-gray-500">₹{item.price || item.menuItem?.price} × {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 text-sm">
                  ₹{((item.price || item.menuItem?.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>₹{order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>

        {/* Cancel button */}
        {order.status === 'pending' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 font-medium transition-colors disabled:opacity-60"
          >
            <XCircle size={18} />
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">Auto-refreshes every 15 seconds</p>
      </div>
    </div>
  )
}
