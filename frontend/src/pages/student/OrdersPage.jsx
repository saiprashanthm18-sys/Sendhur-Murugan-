import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Package, RefreshCw, ClipboardList } from 'lucide-react'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import { OrderRowSkeleton } from '../../components/LoadingSkeleton'
import { orders as ordersApi } from '../../api/endpoints'
import toast from 'react-hot-toast'

export default function OrdersPage() {
  const [orderList, setOrderList] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef(null)

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await ordersApi.getMyOrders()
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.orders)
        ? res.data.orders
        : Array.isArray(res.data)
        ? res.data
        : []
      setOrderList(data)
    } catch {
      if (!silent) toast.error('Failed to load orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    intervalRef.current = setInterval(() => fetchOrders(true), 30000)
    return () => clearInterval(intervalRef.current)
  }, [fetchOrders])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatItems = (items) => {
    if (!items?.length) return '-'
    return items.map(i => `${i.menuItem?.name || i.name} ×${i.quantity}`).join(', ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track all your pre-orders</p>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy-600 font-medium border border-gray-200 bg-white px-3 py-2 rounded-lg hover:border-navy-300 transition-colors"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order #', 'Date', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)}
              </tbody>
            </table>
          </div>
        ) : orderList.length === 0 ? (
          <div className="text-center py-24">
            <ClipboardList size={72} className="text-gray-200 mx-auto mb-5" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-500 text-sm mb-6">Your order history will appear here</p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-navy-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-navy-700 transition-colors"
            >
              <Package size={18} />
              Order Now
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {orderList.map((order) => (
                <div key={order._id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 text-sm">#{order.orderNumber || order._id?.slice(-6).toUpperCase()}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{formatDate(order.createdAt)}</p>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">{formatItems(order.items)}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-700">₹{order.totalAmount?.toFixed(2)}</span>
                    <Link to={`/orders/${order._id}`} className="flex items-center gap-1 text-xs text-navy-600 font-medium hover:underline">
                      <Eye size={14} />View
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order #', 'Date & Time', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orderList.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <span className="line-clamp-1">{formatItems(order.items)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-navy-700">₹{order.totalAmount?.toFixed(2)}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">Auto-refreshes every 30 seconds</p>
      </div>
    </div>
  )
}
