require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const db = require('./backend/db/db');
const authRoutes = require('./backend/routes/authRoutes');
const contentRoutes = require('./backend/routes/contentRoutes');
const mediaRoutes = require('./backend/routes/mediaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/admin-assets', express.static(path.join(__dirname, 'public/admin')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/media', mediaRoutes);

// Admin Portal Route (Private)
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

// Public Birthday Website Route
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => {
  // If request starts with /api/, send 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Boot server
async function start() {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🎂 DOS LAXMI Birthday Website & Admin Portal Ready!`);
      console.log(`✨ Public Website: http://localhost:${PORT}`);
      console.log(`🔒 Admin Portal:   http://localhost:${PORT}/admin`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start if executed directly
if (require.main === module) {
  start();
} else {
  // Serverless execution (e.g. Vercel)
  db.init().catch(console.error);
}

module.exports = app;
