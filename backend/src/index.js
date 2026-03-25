const express = require('express');
const cors = require('cors');
const skillRoutes = require('./routes/skills');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const botRoutes = require('./routes/bot');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/skills', skillRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bot', botRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
