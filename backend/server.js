require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cafeteria API is running (Supabase Edition) 🍽️',
    database: process.env.SUPABASE_URL ? 'Supabase PostgreSQL' : 'In-Memory / Local'
  });
});

// ─── Serve Frontend Static Files in Production ────────────────────────────────
const distCandidates = [
  path.join(__dirname, '../dist'),
  path.join(__dirname, '../frontend/dist')
];

let staticDir = null;
for (const cand of distCandidates) {
  if (fs.existsSync(path.join(cand, 'index.html'))) {
    staticDir = cand;
    break;
  }
}

if (staticDir) {
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(staticDir, 'index.html'));
  });
} else {
  // If static directory not bundled in serverless function, return 200 API status on /
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Cafeteria API is running (Supabase Edition) 🍽️',
      status: 'online',
      endpoints: {
        health: '/api/health',
        menu: '/api/menu',
        slots: '/api/slots',
        auth: '/api/auth',
        orders: '/api/orders'
      }
    });
  });
}

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server (when run directly with node server.js) ─────────────────────
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Cafeteria Server running on http://localhost:${PORT}`);
    console.log(`📌 Database: ${process.env.SUPABASE_URL ? 'Supabase' : 'In-Memory'}`);
  });
}

module.exports = app;
