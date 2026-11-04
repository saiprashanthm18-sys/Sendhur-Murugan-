require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const path = require('path');
const fs = require('fs');

// Route imports
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const slotRoutes = require('./routes/slots');
const adminRoutes = require('./routes/admin');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Auto-connect DB for serverless environments
app.use(async (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    try {
      await connectDB();
    } catch (_) {}
  }
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Cafeteria API is running 🍽️' });
});

// ─── Serve Frontend Static Files in Production ────────────────────────────────
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Seed default pickup slots if none exist ──────────────────────────────────
const seedDefaultSlots = async () => {
  try {
    const PickupSlot = require('./models/PickupSlot');
    const today = new Date().toISOString().split('T')[0];
    const existing = await PickupSlot.countDocuments({ date: today });

    if (existing === 0) {
      const slotTimes = [
        '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
        '1:00 PM',  '1:15 PM',  '1:30 PM',  '1:45 PM',  '2:00 PM',
      ];

      const slots = slotTimes.map((time) => ({ time, maxCapacity: 20, date: today }));
      await PickupSlot.insertMany(slots);
      console.log(`✅ Seeded ${slots.length} default pickup slots for ${today}`);
    } else {
      console.log(`ℹ️  ${existing} pickup slot(s) already exist for today`);
    }
  } catch (err) {
    console.error('⚠️  Failed to seed pickup slots:', err.message);
  }
};

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDefaultSlots();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

if (require.main === module) {
  startServer();
} else {
  connectDB().catch(console.error);
}

module.exports = app;
