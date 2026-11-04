# 🍽️ Campus Cafeteria Pre-Order & Queue Management System

A high-performance full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application architected to minimize physical cafeteria queues, reduce student wait times, and streamline kitchen operations during peak campus meal hours.

---

## 🏗️ System Architecture & Tech Stack

```
                              ┌─────────────────────────────────────┐
                              │     React.js Frontend (Vite)        │
                              │  Tailwind CSS v4 + Lucide Icons     │
                              │  React Router DOM v7 + Context API  │
                              └──────────────────┬──────────────────┘
                                                 │ HTTP / JSON
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │      Node.js + Express REST API     │
                              │       JWT Auth Middleware + RBAC    │
                              │    Slot Capacity & Counter Logic    │
                              └──────────────────┬──────────────────┘
                                                 │ Mongoose ODM
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │          MongoDB Database           │
                              │  Users | MenuItems | Orders | Slots │
                              └─────────────────────────────────────┘
```

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React, React Hot Toast, React Router DOM v7
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS
- **Database**: MongoDB with Mongoose ODM (Schemas for `User`, `MenuItem`, `Order`, `PickupSlot`)
- **Architecture**: Modular Controller-Service-Route structure, atomic slot capacity checks, automated order numbering (#1000+)

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
  - Pricing, prep time badges, and high-contrast stock availability chips (*In Stock* vs *Out of Stock*).
  - Inline add-to-cart and dynamic quantity adjuster.
- **Interactive Cart & Slot Scheduling**:
  - Items summary with quantity increments and deletions.
  - Dedicated **Pickup Time Slot selector** (e.g., 12:15 PM, 12:30 PM) displaying live remaining capacity (`used/maxCapacity`) to prevent peak crowding.
  - Special dietary instructions box.
- **Checkout & Auto Order Generation**:
  - Server-side slot capacity validation (prevents overbooking).
  - Unique auto-increment order number generation starting from `#1000`.
- **Live 5-Stage Order Tracking**:
  - Visual animated stepper across 5 distinct phases:
    1. 🕒 **Pending** (Order Placed)
    2. 📋 **Accepted** (Cafeteria Confirmed)
    3. 👨‍🍳 **Preparing** (Fresh Preparation in Progress)
    4. 🔔 **Ready for Collection** (High-contrast flashing badge)
    5. 🎉 **Completed** (Handed over)
  - Auto-polling every 15 seconds.
  - Self-cancel option when an order is still in `Pending` state (automatically restores slot capacity).

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
  - `preparing` ➔ **Mark Ready** (Green)
  - `ready` ➔ **Complete** (Emerald)
- **Menu Management (CRUD)**:
  - Add new menu items with custom emoji/image, price, category, and estimated prep time.
  - Inline edit existing items.
  - Single-click **Stock Toggle** (*In-Stock* / *Out-of-Stock*).
  - Soft-delete (hide) menu items.
- **Queue & Slot Management**:
  - Reset daily pickup slot bookings with one click for a new cafeteria shift.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on `mongodb://localhost:27017`

### 1. Database Seeding
To populate default accounts, 10 menu items, and today's pickup slots:
```bash
npm run seed
```

### 2. Run Both Frontend and Backend Concurrently
From the project root:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

## 📡 REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student or user |
| `POST` | `/api/auth/login` | Public | Sign in and receive JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch current profile |

### Menu (`/api/menu`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/menu` | Public | Get all active menu items (supports `?category=` and `?search=`) |
| `GET` | `/api/menu/:id` | Public | Get item details |
| `POST` | `/api/menu` | Admin | Create new menu item |
| `PUT` | `/api/menu/:id` | Admin | Update menu item |
| `DELETE` | `/api/menu/:id` | Admin | Soft-delete / hide menu item |
| `PATCH` | `/api/menu/:id/toggle` | Admin | Toggle availability (In-Stock / Out-of-Stock) |

### Pickup Slots (`/api/slots`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/slots` | Public | Fetch today's pickup slots with booking counters |

### Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Student | Place order with slot reservation |
| `GET` | `/api/orders/my` | Student | Get user's order history |
| `GET` | `/api/orders/:id` | Authenticated | Track order by ID (with 5-stage status) |
| `PATCH` | `/api/orders/:id/cancel`| Student | Cancel order (if still pending) |

### Admin Operations (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/orders` | Admin | Get all queue pre-orders |
| `PATCH`| `/api/admin/orders/:id/status` | Admin | Advance order status |
| `GET` | `/api/admin/stats` | Admin | Counters: total, pending, preparing, ready, completed |
| `POST` | `/api/admin/slots/reset` | Admin | Reset daily pickup slot bookings |
