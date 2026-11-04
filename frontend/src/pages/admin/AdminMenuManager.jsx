import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  X, Check, AlertCircle, ChefHat
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import { menu as menuApi } from '../../api/endpoints'
import toast from 'react-hot-toast'

const CATEGORIES = ['Meals', 'Breakfast', 'Snacks', 'Beverages', 'Desserts']

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'Meals',
  preparationTime: '',
  emoji: '🍽️',
  isAvailable: true
}

function MenuForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          emoji: initial.image || initial.emoji || '🍽️',
          category: initial.category
            ? initial.category.charAt(0).toUpperCase() + initial.category.slice(1)
            : 'Meals'
        }
      : EMPTY_FORM
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      toast.error('Valid price is required'); return
    }
    onSubmit({ ...form, price: Number(form.price), preparationTime: Number(form.preparationTime) || undefined })
  }

  const emojiOptions = ['🍛', '🍜', '🥞', '🍳', '🥗', '🍿', '☕', '🧃', '🍰', '🧁', '🍔', '🥙', '🍱', '🍚', '🥤']

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Chicken Biryani"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.5"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (minutes)</label>
          <input
            type="number"
            name="preparationTime"
            value={form.preparationTime}
            onChange={handleChange}
            placeholder="10"
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Short description of the item..."
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Emoji Icon</label>
        <div className="flex flex-wrap gap-2">
          {emojiOptions.map(em => (
            <button
              key={em}
              type="button"
              onClick={() => setForm(p => ({ ...p, emoji: em }))}
              className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                form.emoji === em ? 'bg-navy-600 ring-2 ring-navy-600 ring-offset-1' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {em}
            </button>
          ))}
          <input
            type="text"
            name="emoji"
            value={form.emoji}
            onChange={handleChange}
            placeholder="Custom"
            maxLength={2}
            className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-navy-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isAvailable"
          name="isAvailable"
          checked={form.isAvailable}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300 text-navy-600 focus:ring-navy-600"
        />
        <label htmlFor="isAvailable" className="text-sm text-gray-700">Available for ordering</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-navy-600 hover:bg-navy-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : <Check size={16} />}
          {initial ? 'Update Item' : 'Add Item'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminMenuManager() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toggling, setToggling] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await menuApi.getMenuItems({ includeHidden: true })
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
        ? res.data
        : []
      setItems(data)
    } catch {
      toast.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleAdd = async (data) => {
    setSubmitting(true)
    try {
      await menuApi.createMenuItem(data)
      toast.success('Menu item added!')
      setShowModal(false)
      fetchItems()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (data) => {
    setSubmitting(true)
    try {
      await menuApi.updateMenuItem(editItem._id, data)
      toast.success('Menu item updated!')
      setEditItem(null)
      fetchItems()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update item')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id) => {
    setToggling(id)
    try {
      await menuApi.toggleAvailability(id)
      toast.success('Availability updated')
      fetchItems()
    } catch {
      toast.error('Failed to toggle availability')
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await menuApi.deleteMenuItem(id)
      toast.success(`"${name}" deleted`)
      fetchItems()
    } catch {
      toast.error('Failed to delete item')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Manager</h1>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} items in menu</p>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-navy-600 hover:bg-navy-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add New Item
          </button>
        </div>

        {/* Add Item Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="navy-header px-6 py-4 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <ChefHat size={20} />
                  <h2 className="font-semibold text-lg">Add New Menu Item</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <MenuForm onSubmit={handleAdd} onCancel={() => setShowModal(false)} loading={submitting} />
              </div>
            </div>
          </div>
        )}

        {/* Edit Inline Panel */}
        {editItem && (
          <div className="bg-white rounded-xl shadow-sm border border-navy-600 border-2 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Pencil size={18} className="text-navy-600" />
              <h2 className="font-semibold text-gray-900">Editing: {editItem.name}</h2>
            </div>
            <MenuForm
              initial={editItem}
              onSubmit={handleEdit}
              onCancel={() => setEditItem(null)}
              loading={submitting}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No menu items yet. Add your first item!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Item', 'Category', 'Price', 'Prep Time', 'Available', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${!item.isAvailable ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                            {item.image || item.emoji || '🍽️'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium capitalize">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-navy-700">₹{item.price}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {item.preparationTime ? `${item.preparationTime} min` : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggle(item._id)}
                          disabled={toggling === item._id}
                          className="flex items-center gap-1.5 transition-colors disabled:opacity-60"
                          title="Toggle availability"
                        >
                          {toggling === item._id ? (
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                          ) : item.isAvailable ? (
                            <ToggleRight size={28} className="text-teal-500" />
                          ) : (
                            <ToggleLeft size={28} className="text-gray-400" />
                          )}
                          <span className={`text-xs font-medium ${item.isAvailable ? 'text-teal-600' : 'text-gray-500'}`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setShowModal(false); setEditItem(item) }}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.name)}
                            disabled={deleting === item._id}
                            className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                          >
                            {deleting === item._id ? (
                              <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : <Trash2 size={13} />}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
