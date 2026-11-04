import api from './axios'

// Auth endpoints
export const auth = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
}

// Menu endpoints
export const menu = {
  getMenuItems: (params) => api.get('/menu', { params }),
  createMenuItem: (data) => api.post('/menu', data),
  updateMenuItem: (id, data) => api.put(`/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),
  toggleAvailability: (id) => api.patch(`/menu/${id}/toggle`)
}

// Orders endpoints
export const orders = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`)
}

// Slot endpoints (public)
export const slots = {
  getPickupSlots: () => api.get('/slots')
}

// Admin endpoints
export const admin = {
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  getStats: () => api.get('/admin/stats'),
  getPickupSlots: () => api.get('/slots'),
  resetSlots: () => api.post('/admin/slots/reset')
}
