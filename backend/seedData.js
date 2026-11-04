require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const PickupSlot = require('./models/PickupSlot');

const seed = async () => {
  await connectDB();
  console.log('🌱 Starting seed...');

  // ─── Clear existing data ───────────────────────────────────────────────────
  await User.deleteMany({});
  await MenuItem.deleteMany({});
  await PickupSlot.deleteMany({});
  console.log('🗑️  Cleared existing Users, MenuItems, and PickupSlots');

  // ─── Seed Users ───────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@cafeteria.com',
    password: 'admin123',
    role: 'admin',
  });

  const student = await User.create({
    name: 'John Student',
    email: 'student@test.com',
    password: 'student123',
    role: 'student',
    studentId: 'CS2024001',
  });

  console.log(`👤 Created admin: ${admin.email}`);
  console.log(`👤 Created student: ${student.email}`);

  // ─── Seed Menu Items ──────────────────────────────────────────────────────
  const menuItems = [
    {
      name: 'Veg Meals',
      description: 'Complete vegetarian meal with rice, dal, sabzi, and roti',
      price: 70,
      category: 'meals',
      image: '🍱',
      preparationTime: 15,
    },
    {
      name: 'Masala Dosa',
      description: 'Crispy dosa stuffed with spiced potato filling, served with chutney & sambar',
      price: 45,
      category: 'breakfast',
      image: '🫓',
      preparationTime: 10,
    },
    {
      name: 'Veg Noodles',
      description: 'Stir-fried noodles with fresh vegetables and sauces',
      price: 60,
      category: 'snacks',
      image: '🍜',
      preparationTime: 12,
    },
    {
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices',
      price: 120,
      category: 'meals',
      image: '🍛',
      preparationTime: 20,
    },
    {
      name: 'Samosa',
      description: 'Crispy fried pastry filled with spiced potatoes and peas',
      price: 20,
      category: 'snacks',
      image: '🥟',
      preparationTime: 5,
    },
    {
      name: 'Filter Coffee',
      description: 'Traditional South Indian filter coffee with fresh milk',
      price: 25,
      category: 'beverages',
      image: '☕',
      preparationTime: 5,
    },
    {
      name: 'Fresh Lime Soda',
      description: 'Refreshing lime juice with soda and a pinch of salt or sugar',
      price: 30,
      category: 'beverages',
      image: '🍋',
      preparationTime: 3,
    },
    {
      name: 'Gulab Jamun',
      description: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup',
      price: 35,
      category: 'desserts',
      image: '🍮',
      preparationTime: 5,
    },
    {
      name: 'Paneer Butter Masala',
      description: 'Creamy tomato-based curry with soft paneer cubes',
      price: 110,
      category: 'meals',
      image: '🍲',
      preparationTime: 18,
    },
    {
      name: 'Idli Sambar',
      description: 'Steamed rice cakes served with lentil soup and coconut chutney',
      price: 40,
      category: 'breakfast',
      image: '🫙',
      preparationTime: 8,
    },
  ];

  const createdItems = await MenuItem.insertMany(menuItems);
  console.log(`🍽️  Created ${createdItems.length} menu items`);

  // ─── Seed Pickup Slots ────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const slotTimes = [
    '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
    '1:00 PM',  '1:15 PM',  '1:30 PM',  '1:45 PM',  '2:00 PM',
  ];

  const slots = slotTimes.map((time) => ({ time, maxCapacity: 20, date: today }));
  const createdSlots = await PickupSlot.insertMany(slots);
  console.log(`🕛 Created ${createdSlots.length} pickup slots for ${today}`);

  console.log('\n✅ Seed completed successfully!');
  console.log('────────────────────────────────────');
  console.log('  Admin   → admin@cafeteria.com / admin123');
  console.log('  Student → student@test.com / student123');
  console.log('────────────────────────────────────\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
