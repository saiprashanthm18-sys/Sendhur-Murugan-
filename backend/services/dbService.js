const bcrypt = require('bcryptjs');
const { supabase, isConfigured } = require('../config/supabase');

// ─── Initial In-Memory Seed (Fallback when Supabase URL is not set) ───────────
const today = new Date().toISOString().split('T')[0];

const defaultUsers = [
  {
    id: 'usr_admin',
    _id: 'usr_admin',
    name: 'Admin',
    email: 'admin@cafeteria.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    studentId: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_student',
    _id: 'usr_student',
    name: 'John Student',
    email: 'student@test.com',
    password: bcrypt.hashSync('student123', 10),
    role: 'student',
    studentId: 'CS2024001',
    createdAt: new Date().toISOString()
  }
];

const defaultMenuItems = [
  { id: 'item_1', _id: 'item_1', name: 'Veg Meals', description: 'Complete vegetarian meal with rice, dal, sabzi, and roti', price: 70, category: 'meals', isAvailable: true, isHidden: false, image: '🍱', preparationTime: 15 },
  { id: 'item_2', _id: 'item_2', name: 'Masala Dosa', description: 'Crispy dosa stuffed with spiced potato filling, served with chutney & sambar', price: 45, category: 'breakfast', isAvailable: true, isHidden: false, image: '🫓', preparationTime: 10 },
  { id: 'item_3', _id: 'item_3', name: 'Veg Noodles', description: 'Stir-fried noodles with fresh vegetables and sauces', price: 60, category: 'snacks', isAvailable: true, isHidden: false, image: '🍜', preparationTime: 12 },
  { id: 'item_4', _id: 'item_4', name: 'Chicken Biryani', description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices', price: 120, category: 'meals', isAvailable: true, isHidden: false, image: '🍛', preparationTime: 20 },
  { id: 'item_5', _id: 'item_5', name: 'Samosa', description: 'Crispy fried pastry filled with spiced potatoes and peas', price: 20, category: 'snacks', isAvailable: true, isHidden: false, image: '🥟', preparationTime: 5 },
  { id: 'item_6', _id: 'item_6', name: 'Filter Coffee', description: 'Traditional South Indian filter coffee with fresh milk', price: 25, category: 'beverages', isAvailable: true, isHidden: false, image: '☕', preparationTime: 5 },
  { id: 'item_7', _id: 'item_7', name: 'Fresh Lime Soda', description: 'Refreshing lime juice with soda and a pinch of salt or sugar', price: 30, category: 'beverages', isAvailable: true, isHidden: false, image: '🍋', preparationTime: 3 },
  { id: 'item_8', _id: 'item_8', name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup', price: 35, category: 'desserts', isAvailable: true, isHidden: false, image: '🍮', preparationTime: 5 },
  { id: 'item_9', _id: 'item_9', name: 'Paneer Butter Masala', description: 'Creamy tomato-based curry with soft paneer cubes', price: 110, category: 'meals', isAvailable: true, isHidden: false, image: '🍲', preparationTime: 18 },
  { id: 'item_10', _id: 'item_10', name: 'Idli Sambar', description: 'Steamed rice cakes served with lentil soup and coconut chutney', price: 40, category: 'breakfast', isAvailable: true, isHidden: false, image: '🫙', preparationTime: 8 }
];

const slotTimes = [
  '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
  '1:00 PM',  '1:15 PM',  '1:30 PM',  '1:45 PM',  '2:00 PM'
];

const defaultSlots = slotTimes.map((time, idx) => ({
  id: `slot_${idx + 1}`,
  _id: `slot_${idx + 1}`,
  time,
  maxCapacity: 20,
  currentBookings: idx === 1 ? 5 : (idx === 2 ? 8 : 2),
  isActive: true,
  date: today
}));

// In-Memory store
const memoryStore = {
  users: [...defaultUsers],
  menuItems: [...defaultMenuItems],
  pickupSlots: [...defaultSlots],
  orders: []
};

// ─── Helpers: Format objects for client ───────────────────────────────────────
const normalizeItem = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    category: row.category,
    isAvailable: row.is_available ?? row.isAvailable ?? true,
    isHidden: row.is_hidden ?? row.isHidden ?? false,
    image: row.image || '🍽️',
    preparationTime: Number(row.preparation_time ?? row.preparationTime ?? 10),
    createdAt: row.created_at || row.createdAt
  };
};

const normalizeSlot = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    time: row.time,
    maxCapacity: Number(row.max_capacity ?? row.maxCapacity ?? 20),
    currentBookings: Number(row.current_bookings ?? row.currentBookings ?? 0),
    isActive: row.is_active ?? row.isActive ?? true,
    date: row.date
  };
};

const normalizeOrder = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    orderNumber: row.order_number ?? row.orderNumber,
    student: row.student,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    pickupSlot: row.pickup_slot ?? row.pickupSlot,
    pickupTime: row.pickup_time ?? row.pickupTime,
    totalAmount: Number(row.total_amount ?? row.totalAmount),
    status: row.status,
    statusHistory: typeof row.status_history === 'string' ? JSON.parse(row.status_history) : (row.status_history || row.statusHistory || []),
    specialInstructions: row.special_instructions ?? row.specialInstructions ?? '',
    createdAt: row.created_at || row.createdAt
  };
};

const normalizeUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role || 'student',
    studentId: row.student_id ?? row.studentId ?? '',
    createdAt: row.created_at || row.createdAt
  };
};

// ─── Database Operations Service ──────────────────────────────────────────────
const dbService = {
  // ── Users ──
  async findUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (isConfigured) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return normalizeUser(data);
    }
    const found = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    return found ? normalizeUser(found) : null;
  },

  async findUserById(id) {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return normalizeUser(data);
    }
    const found = memoryStore.users.find(u => u.id === id || u._id === id);
    return found ? normalizeUser(found) : null;
  },

  async createUser(userData) {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userToInsert = {
      id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || 'student',
      student_id: userData.studentId || '',
      created_at: new Date().toISOString()
    };

    if (isConfigured) {
      const { data, error } = await supabase
        .from('users')
        .insert([userToInsert])
        .select()
        .single();
      if (error) throw error;
      return normalizeUser(data);
    }

    const memoryUser = {
      ...userToInsert,
      _id: id,
      studentId: userToInsert.student_id,
      createdAt: userToInsert.created_at
    };
    memoryStore.users.push(memoryUser);
    return normalizeUser(memoryUser);
  },

  // ── Menu Items ──
  async getMenuItems({ category, search, includeHidden } = {}) {
    if (isConfigured) {
      let query = supabase.from('menu_items').select('*');
      if (includeHidden !== 'true' && includeHidden !== true) {
        query = query.eq('is_hidden', false);
      }
      if (category && category.toLowerCase() !== 'all') {
        query = query.eq('category', category.toLowerCase());
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      query = query.order('category', { ascending: true }).order('name', { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeItem);
    }

    let items = memoryStore.menuItems;
    if (includeHidden !== 'true' && includeHidden !== true) {
      items = items.filter(i => !i.isHidden);
    }
    if (category && category.toLowerCase() !== 'all') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        (i.description && i.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return items.map(normalizeItem);
  },

  async getMenuItemById(id) {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return normalizeItem(data);
    }
    const found = memoryStore.menuItems.find(i => i.id === id || i._id === id);
    return found ? normalizeItem(found) : null;
  },

  async createMenuItem(itemData) {
    const id = `item_${Date.now()}`;
    const toInsert = {
      id,
      name: itemData.name,
      description: itemData.description || '',
      price: Number(itemData.price),
      category: itemData.category.toLowerCase(),
      is_available: itemData.isAvailable ?? true,
      is_hidden: false,
      image: itemData.image || itemData.emoji || '🍽️',
      preparation_time: Number(itemData.preparationTime || 10),
      created_at: new Date().toISOString()
    };

    if (isConfigured) {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([toInsert])
        .select()
        .single();
      if (error) throw error;
      return normalizeItem(data);
    }

    const memItem = {
      ...toInsert,
      _id: id,
      isAvailable: toInsert.is_available,
      isHidden: false,
      preparationTime: toInsert.preparation_time
    };
    memoryStore.menuItems.push(memItem);
    return normalizeItem(memItem);
  },

  async updateMenuItem(id, updates) {
    const toUpdate = {};
    if (updates.name !== undefined) toUpdate.name = updates.name;
    if (updates.description !== undefined) toUpdate.description = updates.description;
    if (updates.price !== undefined) toUpdate.price = Number(updates.price);
    if (updates.category !== undefined) toUpdate.category = updates.category.toLowerCase();
    if (updates.isAvailable !== undefined) toUpdate.is_available = updates.isAvailable;
    if (updates.image !== undefined) toUpdate.image = updates.image;
    if (updates.emoji !== undefined && !updates.image) toUpdate.image = updates.emoji;
    if (updates.preparationTime !== undefined) toUpdate.preparation_time = Number(updates.preparationTime);

    if (isConfigured) {
      const { data, error } = await supabase
        .from('menu_items')
        .update(toUpdate)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normalizeItem(data);
    }

    const idx = memoryStore.menuItems.findIndex(i => i.id === id || i._id === id);
    if (idx === -1) return null;
    memoryStore.menuItems[idx] = {
      ...memoryStore.menuItems[idx],
      ...updates,
      price: updates.price ? Number(updates.price) : memoryStore.menuItems[idx].price,
      preparationTime: updates.preparationTime ? Number(updates.preparationTime) : memoryStore.menuItems[idx].preparationTime,
      image: updates.image || updates.emoji || memoryStore.menuItems[idx].image
    };
    return normalizeItem(memoryStore.menuItems[idx]);
  },

  async deleteMenuItem(id) {
    if (isConfigured) {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_hidden: true })
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    const item = memoryStore.menuItems.find(i => i.id === id || i._id === id);
    if (item) item.isHidden = true;
    return true;
  },

  async toggleMenuItemAvailability(id) {
    const item = await this.getMenuItemById(id);
    if (!item) return null;
    const newStatus = !item.isAvailable;
    if (isConfigured) {
      const { data, error } = await supabase
        .from('menu_items')
        .update({ is_available: newStatus })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normalizeItem(data);
    }
    const memItem = memoryStore.menuItems.find(i => i.id === id || i._id === id);
    if (memItem) memItem.isAvailable = newStatus;
    return normalizeItem(memItem);
  },

  // ── Pickup Slots ──
  async getPickupSlots(date = today) {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('pickup_slots')
        .select('*')
        .eq('date', date)
        .eq('is_active', true)
        .order('id', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) {
        // Auto-seed default slots for today in Supabase
        const slotsToInsert = slotTimes.map((time, idx) => ({
          id: `slot_${date}_${idx + 1}`,
          time,
          max_capacity: 20,
          current_bookings: 0,
          is_active: true,
          date
        }));
        const { data: inserted, error: insertErr } = await supabase
          .from('pickup_slots')
          .insert(slotsToInsert)
          .select();
        if (insertErr) console.warn('Slots auto-seed error:', insertErr.message);
        return (inserted || slotsToInsert).map(normalizeSlot);
      }
      return data.map(normalizeSlot);
    }
    return memoryStore.pickupSlots.map(normalizeSlot);
  },

  async getPickupSlotById(id) {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('pickup_slots')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return normalizeSlot(data);
    }
    const found = memoryStore.pickupSlots.find(s => s.id === id || s._id === id);
    return found ? normalizeSlot(found) : null;
  },

  async incrementSlotBookings(slotId, increment = 1) {
    if (isConfigured) {
      const slot = await this.getPickupSlotById(slotId);
      if (!slot) return null;
      const updated = Math.max(0, (slot.currentBookings || 0) + increment);
      const { data, error } = await supabase
        .from('pickup_slots')
        .update({ current_bookings: updated })
        .eq('id', slotId)
        .select()
        .single();
      if (error) throw error;
      return normalizeSlot(data);
    }
    const slot = memoryStore.pickupSlots.find(s => s.id === slotId || s._id === slotId);
    if (slot) {
      slot.currentBookings = Math.max(0, (slot.currentBookings || 0) + increment);
    }
    return normalizeSlot(slot);
  },

  async resetDailySlots(date = today) {
    if (isConfigured) {
      const { error } = await supabase
        .from('pickup_slots')
        .update({ current_bookings: 0 })
        .eq('date', date);
      if (error) throw error;
      return true;
    }
    memoryStore.pickupSlots.forEach(s => { s.currentBookings = 0; });
    return true;
  },

  // ── Orders ──
  async getNextOrderNumber() {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('order_number')
        .order('order_number', { ascending: false })
        .limit(1);
      if (error) throw error;
      if (!data || data.length === 0 || !data[0].order_number) return 1001;
      return Number(data[0].order_number) + 1;
    }
    const max = memoryStore.orders.reduce((m, o) => Math.max(m, o.orderNumber || 1000), 1000);
    return max + 1;
  },

  async createOrder(orderData) {
    const id = `ord_${Date.now()}`;
    const orderNumber = await this.getNextOrderNumber();

    const orderRow = {
      id,
      order_number: orderNumber,
      student: orderData.student,
      items: orderData.items,
      pickup_slot: orderData.pickupSlot,
      pickup_time: orderData.pickupTime,
      total_amount: Number(orderData.totalAmount),
      status: 'pending',
      status_history: [
        { status: 'pending', timestamp: new Date().toISOString(), updatedBy: orderData.student?.name || 'Student' }
      ],
      special_instructions: orderData.specialInstructions || '',
      created_at: new Date().toISOString()
    };

    if (isConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderRow])
        .select()
        .single();
      if (error) throw error;
      return normalizeOrder(data);
    }

    const memOrder = {
      ...orderRow,
      _id: id,
      orderNumber,
      totalAmount: orderRow.total_amount,
      pickupSlot: orderRow.pickup_slot,
      pickupTime: orderRow.pickup_time,
      statusHistory: orderRow.status_history,
      specialInstructions: orderRow.special_instructions,
      createdAt: orderRow.created_at
    };
    memoryStore.orders.unshift(memOrder);
    return normalizeOrder(memOrder);
  },

  async getOrdersByStudent(studentId) {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Filter by student id
      return (data || [])
        .map(normalizeOrder)
        .filter(o => o.student?.id === studentId || o.student?._id === studentId);
    }
    return memoryStore.orders
      .filter(o => o.student?.id === studentId || o.student?._id === studentId)
      .map(normalizeOrder);
  },

  async getOrderById(id) {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return normalizeOrder(data);
    }
    const found = memoryStore.orders.find(o => o.id === id || o._id === id);
    return found ? normalizeOrder(found) : null;
  },

  async getAllOrders({ status, limit = 50 } = {}) {
    if (isConfigured) {
      let query = supabase.from('orders').select('*');
      if (status && status !== 'All' && status !== 'all') {
        query = query.eq('status', status.toLowerCase());
      }
      query = query.order('created_at', { ascending: false }).limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(normalizeOrder);
    }
    let list = memoryStore.orders;
    if (status && status !== 'All' && status !== 'all') {
      list = list.filter(o => o.status === status.toLowerCase());
    }
    return list.slice(0, limit).map(normalizeOrder);
  },

  async updateOrderStatus(id, newStatus, updatedByName = 'Staff') {
    const order = await this.getOrderById(id);
    if (!order) return null;

    const newHistory = [
      ...(order.statusHistory || []),
      { status: newStatus, timestamp: new Date().toISOString(), updatedBy: updatedByName }
    ];

    if (isConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          status_history: newHistory
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normalizeOrder(data);
    }

    const memOrder = memoryStore.orders.find(o => o.id === id || o._id === id);
    if (memOrder) {
      memOrder.status = newStatus;
      memOrder.statusHistory = newHistory;
    }
    return normalizeOrder(memOrder);
  },

  async getStats() {
    const all = await this.getAllOrders({ limit: 1000 });
    return {
      total: all.length,
      pending: all.filter(o => o.status === 'pending').length,
      accepted: all.filter(o => o.status === 'accepted').length,
      preparing: all.filter(o => o.status === 'preparing').length,
      ready: all.filter(o => o.status === 'ready').length,
      completed: all.filter(o => o.status === 'completed').length,
      cancelled: all.filter(o => o.status === 'cancelled').length
    };
  }
};

module.exports = dbService;
