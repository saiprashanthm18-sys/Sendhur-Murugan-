export default function StatusBadge({ status, size = 'sm' }) {
  const configs = {
    pending: {
      label: 'Pending',
      className: 'bg-gray-100 text-gray-700 border border-gray-200'
    },
    accepted: {
      label: 'Accepted',
      className: 'bg-blue-100 text-blue-700 border border-blue-200'
    },
    preparing: {
      label: 'Preparing',
      className: 'bg-orange-100 text-orange-700 border border-orange-200'
    },
    ready: {
      label: 'Ready for Pickup',
      className: 'bg-green-100 text-green-700 border border-green-200 pulse-ready'
    },
    completed: {
      label: 'Completed',
      className: 'bg-emerald-800 text-white border border-emerald-900'
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-700 border border-red-200'
    }
  }

  const config = configs[status] || { label: status, className: 'bg-gray-100 text-gray-600' }
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${config.className}`}>
      {status === 'ready' && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
      )}
      {config.label}
    </span>
  )
}
