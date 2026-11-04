# 🍽️ Campus Cafeteria Pre-Order & Queue Management System

A high-performance full-stack web application powered by **React.js, Node.js/Express, and Supabase (PostgreSQL)** architected to minimize physical cafeteria queues, reduce student wait times, and streamline kitchen operations during peak campus meal hours.

---

## 🏗️ System Architecture & Tech Stack

```
                              ┌──────────────────────────────────────────┐
                              │        React.js Frontend (Vite)          │
                              │  Tailwind CSS v4 • Lucide React Icons    │
                              │  React Router DOM v7 • Context API       │
                              └────────────────────┬─────────────────────┘
                                                   │ HTTP / JSON
                                                   ▼
                              ┌──────────────────────────────────────────┐
                              │      Node.js + Express.js REST API       │
                              │  JWT Auth & RBAC ('student' | 'admin')   │
                              │  Capacity Validator • Order Numberer     │
                              └────────────────────┬─────────────────────┘
                                                   │ @supabase/supabase-js
                                                   ▼
                              ┌──────────────────────────────────────────┐
                              │        Supabase Cloud (PostgreSQL)       │
                              │     users • menu_items • pickup_slots    │
                              │                  orders                  │
                              └──────────────────────────────────────────┘
```

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React, React Hot Toast, React Router DOM v7
- **Backend**: Node.js, Express.js REST API, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS
- **Database**: **Supabase** (PostgreSQL) via official `@supabase/supabase-js` SDK (with automatic local in-memory fallback for zero-friction local testing)
- **Deployment**: Vercel Serverless ready with edge routing (`vercel.json`)

---

## ⚡ Quick 2-Minute Supabase Setup

1. Create a free account and project at **[supabase.com](https://supabase.com)**.
2. In your Supabase dashboard, go to the **SQL Editor** (left sidebar).
3. Open the file **`supabase_schema.sql`** in this project, copy all its contents, paste them into the SQL Editor, and click **Run**.
   - *This automatically creates the 4 tables (`users`, `menu_items`, `pickup_slots`, `orders`), RLS security policies, and default menu & user data!*
4. Go to **Project Settings** $\rightarrow$ **API** and copy:
   - **Project URL** $\rightarrow$ `SUPABASE_URL`
   - **anon / public key** $\rightarrow$ `SUPABASE_ANON_KEY`
5. In your local `.env` (or Vercel Environment Variables), set:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   JWT_SECRET=cafeteria_jwt_secret_key_2024
   ```

---

## 🔑 Demo Credentials

| Role | Email | Password | Features & Privileges |
| :--- | :--- | :--- | :--- |
| **Student** | `student@test.com` | `student123` | Browse menu, Cart, select Pickup Slot, Place order (#1000+), Live 5-stage tracker |
| **Admin / Staff** | `admin@cafeteria.com` | `admin123` | Live order queue, 1-click status actions, Menu CRUD, Operational summary cards |

> 💡 *The login page also provides 1-click "Quick Demo Login" buttons to instantly sign in as Student or Admin.*

---

## 📱 Features

### 1. Student Module
- **Authentication**: JWT-based sign-in and registration with Student ID support.
- **Dynamic Menu Grid**:
  - Live category filters: *All, Meals, Breakfast, Snacks, Beverages, Desserts*.
  - Real-time search by item name and description.
  - Pricing in ₹ (*Veg Meals ₹70, Masala Dosa ₹45, Veg Noodles ₹60, Chicken Biryani ₹120, etc.*).
  - High-contrast stock availability chips (*In Stock* vs *Out of Stock*).
  - Preparation time chips and category icons.
  - Interactive cart controls with inline quantity adjusters.
- **Interactive Cart & Slot Scheduling**:
  - Items summary with quantity increments and deletions.
  - Dedicated **Pickup Time Slot selector** (e.g., 12:15 PM, 12:30 PM) displaying live remaining capacity (`used/maxCapacity`) to prevent peak crowding.
  - Special dietary instructions box.
- **Checkout & Auto Order Generation**:
  - Server-side slot capacity validation (prevents overbooking).
  - Unique auto-increment order number generation starting from `#1000`.
- **Live 5-Stage Order Tracking**:
  - Visual animated stepper across 5 distinct phases:
    $$\text{Pending} \longrightarrow \text{Accepted} \longrightarrow \text{Preparing} \longrightarrow \text{Ready for Collection} \longrightarrow \text{Completed}$$
  - Dynamic status-specific alerts and timestamps.
  - Auto-polling every 15 seconds.
  - Self-cancel action available while in `Pending` state (automatically restores slot capacity).

### 2. Admin & Staff Module
- **Operational Summary Cards**:
  - Total Active Orders
  - Pending / Waiting Queue
  - Preparing Queue
  - Ready for Collection Queue
- **Live Order Queue Dashboard**:
  - Real-time table view showing Order #, Student Name, Student ID, Items list, Scheduled Pickup Slot, Order Time, Status Badge.
  - Filter by tabs: *All, Pending, Accepted, Preparing, Ready, Completed*.
- **1-Click Status Controller**:
  - `pending` ➔ **Accept Order** (Blue)
  - `accepted` ➔ **Start Prep** (Orange)
  - `preparing` ➔ **Mark Ready** (Green pulsing)
  - `ready` ➔ **Complete** (Dark Emerald)
- **Menu Management (CRUD)**:
  - Add new menu items with modal form (name, category, price, preparation time, emoji/image).
  - Inline edit panel for existing items.
  - Single-click **Stock Toggle** (*In-Stock* / *Out-of-Stock*).
  - Soft-delete (hide) menu items.
- **Queue & Slot Management**:
  - Single-click **Reset Daily Slots** button to clear slot capacities for the next shift.

---

## 🚀 Running the Project

### Start Both Frontend and Backend Concurrently
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

### Build for Production (Vercel)
```bash
npm run build
```
