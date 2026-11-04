import { useState, useEffect, useCallback, useRef } from 'react'
import { RefreshCw, RotateCcw, AlertCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import { OrderRowSkeleton } from '../../components/LoadingSkeleton'
import { admin as adminApi } from '../../api/endpoints'
import toast from 'react-hot-toast'

const FILTER_TABS = ['All', 'pending', 'accepted', 'preparing', 'ready', 'completed']

const TAB_LABELS = {
  All: 'All',
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed'
}

export default function AdminOrderQueue() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [updating, setUpdating] = useState(null)
  const [resetting, setResetting] = useState(false)
  const intervalRef = useRef(null)

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const params = activeTab !== 'All' ? { status: activeTab } : {}
      const res = await adminApi.getAllOrders(params)
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.orders)
        ? res.data.orders
        : Array.isArray(res.data)
        ? res.data
        : []
      setOrders(data)
    } catch {
      if (!silent) toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchOrders()
    intervalRef.current = setInterval(() => fetchOrders(true), 15000)
    return () => clearInterval(intervalRef.current)
  }, [fetchOrders])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await adminApi.updateOrderStatus(orderId, newStatus)
      toast.success(`Status updated to ${newStatus}`)
      fetchOrders(true)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleResetSlots = async () => {
    if (!window.confirm('Reset all pickup slots? This cannot be undone.')) return
    setResetting(true)
    try {
      await adminApi.resetSlots()
      toast.success('Pickup slots reset successfully')
    } catch {
      toast.error('Failed to reset slots')
    } finally {
      setResetting(false)
    }
  }

  const getNextStatus = (current) => {
    const map = { pending: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'completed' }
    return map[current]
  }

  const getActionConfig = (status) => {
    const config = {
      pending: { label: 'Accept Order', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
      accepted: { label: 'Start Prep', className: 'bg-orange-500 hover:bg-orange-600 text-white' },
      preparing: { label: 'Mark Ready', className: 'bg-green-500 hover:bg-green-600 text-white' },
      ready: { label: 'Complete', className: 'bg-emerald-700 hover:bg-emerald-800 text-white' }
    }
    return config[status]
  }

  const formatTime = (d) => {
    const date = new Date(d)
    const now = new Date()
    const diff = Math.floor((now - date) / 60000)
    if (diff < 1) return 'just now'
    if (diff < 60) return `${diff}m ago`
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const displayedOrders = orders

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Queue</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {orders.length} order{orders.length !== 1 ? 's' : ''} {activeTab !== 'All' ? `· ${TAB_LABELS[activeTab]}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(true)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-navy-600 font-medium border border-gray-200 bg-white px-3 py-2 rounded-lg hover:border-navy-300 transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              onClick={handleResetSlots}
              disabled={resetting}
              className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium border border-orange-200 bg-orange-50 px-3 py-2 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-60"
            >
              <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
              Reset Slots
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-5 bg-white rounded-xl border border-gray-100 p-1.5 shadow-sm">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-navy-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <table className="w-full">
              <tbody>{Array.from({ length: 8 }).map((_, i) => <OrderRowSkeleton key={i} />)}</tbody>
            </table>
          ) : displayedOrders.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No {activeTab !== 'All' ? TAB_LABELS[activeTab].toLowerCase() : ''} orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Order #', 'Student', 'Items', 'Slot', 'Status', 'Time', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayedOrders.map((order) => {
                    const nextStatus = getNextStatus(order.status)
                    const actionConfig = getActionConfig(order.status)
                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5 text-sm font-bold text-gray-900">
                          #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.student?.name || '—'}</p>
                            <p className="text-xs text-gray-500">{order.student?.studentId || order.student?.email || ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600 max-w-xs">
                          <div>
                            {order.items?.map((item, i) => (
                              <span key={i} className="text-xs block">
                                {item.menuItem?.name || item.name} ×{item.quantity}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">
                          {typeof order.pickupSlot === 'object' ? order.pickupSlot?.time : order.pickupSlot || '—'}
                        </td>
                        <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-3.5 text-sm text-gray-500">{formatTime(order.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          {actionConfig && order.status !== 'cancelled' ? (
                            <button
                              onClick={() => handleStatusUpdate(order._id, nextStatus)}
                              disabled={updating === order._id}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${actionConfig.className}`}
                            >
                              {updating === order._id ? (
                                <span className="flex items-center gap-1">
                                  <RefreshCw size={12} className="animate-spin" />
                                  ...
                                </span>
                              ) : actionConfig.label}
                            </button>
                          ) : order.status === 'cancelled' ? (
                            <span className="text-xs text-red-400 font-medium">Cancelled</span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
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
        <p className="text-xs text-gray-400 text-center mt-4">Auto-refreshes every 15 seconds</p>
      </div>
    </div>
  )
}
