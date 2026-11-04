import { useState, useEffect, useCallback } from 'react'
import { Search, ShoppingCart, Plus, Minus, Star } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { MenuItemSkeleton } from '../../components/LoadingSkeleton'
import { menu as menuApi } from '../../api/endpoints'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Meals', 'Breakfast', 'Snacks', 'Beverages', 'Desserts']

const CATEGORY_EMOJIS = {
  meals: '🍛',
  breakfast: '🥞',
  snacks: '🍿',
  beverages: '☕',
  desserts: '🍰',
  all: '🍽️'
}

function MenuItemCard({ item }) {
  const { items, addItem, updateQuantity, removeItem } = useCart()
  const cartItem = items.find((i) => i._id === item._id)
  const qty = cartItem ? cartItem.quantity : 0

  const handleAdd = () => {
    addItem(item)
    toast.success(`${item.name} added to cart`)
  }

  const handleIncrease = () => updateQuantity(item._id, qty + 1)
  const handleDecrease = () => {
    if (qty === 1) {
      removeItem(item._id)
      toast(`${item.name} removed from cart`, { icon: '🗑️' })
    } else {
      updateQuantity(item._id, qty - 1)
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col ${!item.isAvailable ? 'opacity-70' : ''}`}>
      {/* Image / Emoji area */}
      <div className="relative h-40 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <span className="text-6xl">{item.image || item.emoji || '🍽️'}</span>
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {item.isAvailable ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        {item.preparationTime && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-xs text-gray-600 px-2 py-0.5 rounded-full">
            ⏱️ {item.preparationTime} min
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h3>
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full whitespace-nowrap capitalize">
            {CATEGORY_EMOJIS[item.category?.toLowerCase()] || '🍽️'} {item.category}
          </span>
        </div>

        {item.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-lg font-bold text-navy-700">₹{item.price}</span>

          {!item.isAvailable ? (
            <button disabled className="bg-gray-100 text-gray-400 text-xs font-medium px-3 py-1.5 rounded-lg cursor-not-allowed">
              Unavailable
            </button>
          ) : qty === 0 ? (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 bg-navy-600 hover:bg-navy-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-navy-600 rounded-lg overflow-hidden">
              <button
                onClick={handleDecrease}
                className="text-white px-2 py-1.5 hover:bg-navy-700 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-white text-sm font-semibold w-5 text-center">{qty}</span>
              <button
                onClick={handleIncrease}
                className="text-white px-2 py-1.5 hover:bg-navy-700 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const { cartCount } = useCart()

  const fetchMenu = useCallback(async () => {
    try {
      const res = await menuApi.getMenuItems()
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.items)
        ? res.data.items
        : Array.isArray(res.data)
        ? res.data
        : []
      setMenuItems(data)
    } catch {
      toast.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  const filtered = menuItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = activeCategory === 'All' || item.category?.toLowerCase() === activeCategory.toLowerCase()
    return matchSearch && matchCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero header */}
      <div className="navy-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Campus Cafeteria Menu</h1>
          <p className="text-blue-200 text-sm">Fresh food, pre-ordered just for you 🌟</p>

          {/* Search bar */}
          <div className="mt-5 relative max-w-xl">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for meals, snacks, beverages..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white text-gray-900 shadow-md focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-navy-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {CATEGORY_EMOJIS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <MenuItemSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery ? `No results for "${searchQuery}"` : 'No items in this category'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-navy-600 hover:underline text-sm font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <MenuItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
