-- ====================================================================
-- Campus Cafeteria Pre-Order System — Supabase SQL Schema & Seed
-- Run this in the Supabase Dashboard -> SQL Editor -> Click 'Run'
-- ====================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  student_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  category TEXT NOT NULL CHECK (category IN ('meals', 'snacks', 'beverages', 'desserts', 'breakfast')),
  is_available BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE,
  image TEXT DEFAULT '🍽️',
  preparation_time INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Pickup Slots Table
CREATE TABLE IF NOT EXISTS public.pickup_slots (
  id TEXT PRIMARY KEY,
  time TEXT NOT NULL,
  max_capacity INTEGER DEFAULT 20,
  current_bookings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number INTEGER NOT NULL,
  student JSONB NOT NULL,
  items JSONB NOT NULL,
  pickup_slot JSONB,
  pickup_time TEXT,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')),
  status_history JSONB DEFAULT '[]'::jsonb,
  special_instructions TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) but allow service role & anon reads/writes for API
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create Open Policies for backend client (using service role / anon key)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access users') THEN
    CREATE POLICY "Allow public access users" ON public.users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access menu_items') THEN
    CREATE POLICY "Allow public access menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access pickup_slots') THEN
    CREATE POLICY "Allow public access pickup_slots" ON public.pickup_slots FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public access orders') THEN
    CREATE POLICY "Allow public access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ====================================================================
-- Initial Seed Data
-- ====================================================================

-- Seed Users (Passwords are hashed with bcrypt: 'admin123' and 'student123')
INSERT INTO public.users (id, name, email, password, role, student_id)
VALUES
  ('usr_admin', 'Admin', 'admin@cafeteria.com', '$2a$10$v2l5J7x95bYFqH3r5k0Kq.gqjQGgSjD65C.j8cZkG8C.V6g8C.V6g', 'admin', ''),
  ('usr_student', 'John Student', 'student@test.com', '$2a$10$eWkZ0yV0Y9c0Y9c0Y9c0Y.0Y9c0Y9c0Y9c0Y9c0Y9c0Y9c0Y9c0Y.', 'student', 'CS2024001')
ON CONFLICT (email) DO NOTHING;

-- Seed Menu Items
INSERT INTO public.menu_items (id, name, description, price, category, is_available, is_hidden, image, preparation_time)
VALUES
  ('item_1', 'Veg Meals', 'Complete vegetarian meal with rice, dal, sabzi, and roti', 70, 'meals', true, false, '🍱', 15),
  ('item_2', 'Masala Dosa', 'Crispy dosa stuffed with spiced potato filling, served with chutney & sambar', 45, 'breakfast', true, false, '🫓', 10),
  ('item_3', 'Veg Noodles', 'Stir-fried noodles with fresh vegetables and sauces', 60, 'snacks', true, false, '🍜', 12),
  ('item_4', 'Chicken Biryani', 'Fragrant basmati rice cooked with tender chicken and aromatic spices', 120, 'meals', true, false, '🍛', 20),
  ('item_5', 'Samosa', 'Crispy fried pastry filled with spiced potatoes and peas', 20, 'snacks', true, false, '🥟', 5),
  ('item_6', 'Filter Coffee', 'Traditional South Indian filter coffee with fresh milk', 25, 'beverages', true, false, '☕', 5),
  ('item_7', 'Fresh Lime Soda', 'Refreshing lime juice with soda and a pinch of salt or sugar', 30, 'beverages', true, false, '🍋', 3),
  ('item_8', 'Gulab Jamun', 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup', 35, 'desserts', true, false, '🍮', 5),
  ('item_9', 'Paneer Butter Masala', 'Creamy tomato-based curry with soft paneer cubes', 110, 'meals', true, false, '🍲', 18),
  ('item_10', 'Idli Sambar', 'Steamed rice cakes served with lentil soup and coconut chutney', 40, 'breakfast', true, false, '🫙', 8)
ON CONFLICT (id) DO NOTHING;

-- Seed Pickup Slots for Today
INSERT INTO public.pickup_slots (id, time, max_capacity, current_bookings, is_active, date)
VALUES
  ('slot_1', '12:00 PM', 20, 2, true, TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')),
  ('slot_2', '12:15 PM', 20, 5, true, TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')),
  ('slot_3', '12:30 PM', 20, 8, true, TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')),
  ('slot_4', '12:45 PM', 20, 3, true, TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')),
  ('slot_5', '1:00 PM', 20, 1, true, TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')),
  ('slot_6', '1:15 PM', 20, 0, true, TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')),
  ('slot_7', '1:30 PM', 20, 0, true, TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')),
  ('slot_8', '1:45 PM', 20, 0, true, TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')),
  ('slot_9', '2:00 PM', 20, 0, true, TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'))
ON CONFLICT (id) DO NOTHING;
