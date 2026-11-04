require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabase, isConfigured } = require('./config/supabase');

const seed = async () => {
  console.log('🌱 Starting Supabase seed process...');

  if (!isConfigured) {
    console.log('⚠️  SUPABASE_URL and SUPABASE_ANON_KEY are not set in your .env');
    console.log('💡 Quick Setup Tip:');
    console.log('   1. Create a free project at https://supabase.com');
    console.log('   2. Go to the SQL Editor and run the script in "supabase_schema.sql"');
    console.log('   3. Add your SUPABASE_URL and SUPABASE_ANON_KEY to your .env');
    process.exit(0);
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Seed users
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const studentPassword = bcrypt.hashSync('student123', 10);

    const { error: userErr } = await supabase.from('users').upsert([
      { id: 'usr_admin', name: 'Admin', email: 'admin@cafeteria.com', password: adminPassword, role: 'admin', student_id: '' },
      { id: 'usr_student', name: 'John Student', email: 'student@test.com', password: studentPassword, role: 'student', student_id: 'CS2024001' }
    ]);
    if (userErr) console.warn('Users seed error:', userErr.message);
    else console.log('👤 Users seeded (admin@cafeteria.com, student@test.com)');

    // Seed menu items
    const menuItems = [
      { id: 'item_1', name: 'Veg Meals', description: 'Complete vegetarian meal with rice, dal, sabzi, and roti', price: 70, category: 'meals', is_available: true, is_hidden: false, image: '🍱', preparation_time: 15 },
      { id: 'item_2', name: 'Masala Dosa', description: 'Crispy dosa stuffed with spiced potato filling, served with chutney & sambar', price: 45, category: 'breakfast', is_available: true, is_hidden: false, image: '🫓', preparation_time: 10 },
      { id: 'item_3', name: 'Veg Noodles', description: 'Stir-fried noodles with fresh vegetables and sauces', price: 60, category: 'snacks', is_available: true, is_hidden: false, image: '🍜', preparation_time: 12 },
      { id: 'item_4', name: 'Chicken Biryani', description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices', price: 120, category: 'meals', is_available: true, is_hidden: false, image: '🍛', preparation_time: 20 },
      { id: 'item_5', name: 'Samosa', description: 'Crispy fried pastry filled with spiced potatoes and peas', price: 20, category: 'snacks', is_available: true, is_hidden: false, image: '🥟', preparation_time: 5 },
      { id: 'item_6', name: 'Filter Coffee', description: 'Traditional South Indian filter coffee with fresh milk', price: 25, category: 'beverages', is_available: true, is_hidden: false, image: '☕', preparation_time: 5 },
      { id: 'item_7', name: 'Fresh Lime Soda', description: 'Refreshing lime juice with soda and a pinch of salt or sugar', price: 30, category: 'beverages', is_available: true, is_hidden: false, image: '🍋', preparation_time: 3 },
      { id: 'item_8', name: 'Gulab Jamun', description: 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup', price: 35, category: 'desserts', is_available: true, is_hidden: false, image: '🍮', preparation_time: 5 },
      { id: 'item_9', name: 'Paneer Butter Masala', description: 'Creamy tomato-based curry with soft paneer cubes', price: 110, category: 'meals', is_available: true, is_hidden: false, image: '🍲', preparation_time: 18 },
      { id: 'item_10', name: 'Idli Sambar', description: 'Steamed rice cakes served with lentil soup and coconut chutney', price: 40, category: 'breakfast', is_available: true, is_hidden: false, image: '🫙', preparation_time: 8 },
    ];

    const { error: menuErr } = await supabase.from('menu_items').upsert(menuItems);
    if (menuErr) console.warn('Menu seed error:', menuErr.message);
    else console.log(`🍽️  ${menuItems.length} menu items seeded`);

    // Seed pickup slots
    const slotTimes = [
      '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
      '1:00 PM',  '1:15 PM',  '1:30 PM',  '1:45 PM',  '2:00 PM',
    ];
    const slots = slotTimes.map((time, idx) => ({
      id: `slot_${today}_${idx + 1}`,
      time,
      max_capacity: 20,
      current_bookings: idx === 1 ? 5 : 2,
      is_active: true,
      date: today
    }));

    const { error: slotErr } = await supabase.from('pickup_slots').upsert(slots);
    if (slotErr) console.warn('Slots seed error:', slotErr.message);
    else console.log(`🕛 ${slots.length} pickup slots seeded for ${today}`);

    console.log('\n✅ Supabase seed completed successfully!');
    console.log('────────────────────────────────────');
    console.log('  Admin   → admin@cafeteria.com / admin123');
    console.log('  Student → student@test.com / student123');
    console.log('────────────────────────────────────\n');
  } catch (err) {
    console.error('❌ Seed error:', err);
  }
};

seed();
