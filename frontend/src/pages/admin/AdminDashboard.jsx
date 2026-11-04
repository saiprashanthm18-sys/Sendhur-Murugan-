import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Clock, ChefHat, Bell, RefreshCw,
  TrendingUp, AlertCircle
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import { StatCardSkeleton, OrderRowSkeleton } from '../../components/LoadingSkeleton'
import { admin as adminApi } from '../../api/endpoints'
import toast from 'react-hot-toast'

function StatCard({ title, value, icon: Icon, color, bgColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const intervalRef = useRef(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [statsRes, ordersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllOrders({ limit: 10, sort: '-createdAt' })
      ])
      setStats(statsRes.data?.data || statsRes.data?.stats || statsRes.data)
      const orders = Array.isArray(ordersRes.data?.data)
        ? ordersRes.data.data
        : Array.isArray(ordersRes.data?.orders)
        ? ordersRes.data.orders
        : Array.isArray(ordersRes.data)
        ? ordersRes.data
        : []
      setRecentOrders(orders)
    } catch {
      if (!silent) toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(() => fetchData(true), 20000)
    return () => clearInterval(intervalRef.current)
  }, [fetchData])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await adminApi.updateOrderStatus(orderId, newStatus)
      toast.success(`Order status updated to ${newStatus}`)
      fetchData(true)
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setUpdating(null)
    }
  }

  const getNextStatus = (current) => {
    const map = { pending: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'completed' }
    return map[current]
  }

  const getNextLabel = (current) => {
    const map = { pending: 'Accept', accepted: 'Start Prep', preparing: 'Mark Ready', ready: 'Complete' }
    return map[current]
  }

  const getNextBtnClass = (current) => {
    const map = {
      pending: 'bg-blue-500 hover:bg-blue-600',
      accepted: 'bg-orange-500 hover:bg-orange-600',
      preparing: 'bg-green-500 hover:bg-green-600',
      ready: 'bg-emerald-700 hover:bg-emerald-800'
    }
    return map[current] || ''
  }

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Live cafeteria overview</p>
          </div>
          <button
            onClick={() => fetchData(true)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy-600 font-medium border border-gray-200 bg-white px-3 py-2 rounded-lg hover:border-navy-300 transition-colors"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Active Orders"
              value={stats?.totalActive || stats?.active || 0}
              icon={ShoppingBag}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Pending / Waiting"
              value={stats?.pending || 0}
              icon={Clock}
              color="text-gray-600"
              bgColor="bg-gray-100"
            />
            <StatCard
              title="Preparing"
              value={stats?.preparing || 0}
              icon={ChefHat}
              color="text-orange-600"
              bgColor="bg-orange-50"
            />
            <StatCard
              title="Ready for Pickup"
              value={stats?.ready || 0}
              icon={Bell}
              color="text-green-600"
              bgColor="bg-green-50"
            />
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-navy-600" />
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <Link to="/admin/orders" className="text-sm text-navy-600 hover:text-navy-700 font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <table className="w-full">
              <tbody>{Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)}</tbody>
            </table>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No recent orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    {['Order #', 'Student', 'Items', 'Slot', 'Status', 'Time', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => {
                    const nextStatus = getNextStatus(order.status)
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{order.student?.name || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                          <span className="line-clamp-1">
                            {order.items?.map(i => i.menuItem?.name || i.name).join(', ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {typeof order.pickupSlot === 'object' ? order.pickupSlot?.time : order.pickupSlot || '—'}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatTime(order.createdAt)}</td>
                        <td className="px-4 py-3">
                          {nextStatus && order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, nextStatus)}
                              disabled={updating === order._id}
                              className={`text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${getNextBtnClass(order.status)}`}
                            >
                              {updating === order._id ? '...' : getNextLabel(order.status)}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">Auto-refreshes every 20 seconds</p>
      </div>
    </div>
  )
}
