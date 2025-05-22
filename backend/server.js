const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS with more permissive settings for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middleware
app.use(express.json());

// Import routes
const youtubeRoutes = require('./routes/youtube');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const goalsRoutes = require('./routes/goals');
const reviewsRoutes = require('./routes/reviews');
const trendsRoutes = require('./routes/trends');
const toolUsageRoutes = require('./routes/toolusage');
const anomaliesRoutes = require('./routes/anomalies');
const testRoutes = require('./routes/test');

// Mount routes with /api prefix
app.use('/api/youtube', youtubeRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/toolusage', toolUsageRoutes);
app.use('/api/anomalies', anomaliesRoutes);
app.use('/api/test', testRoutes);

// Test route for frontend connection
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    stack: err.stack,
    response: err.response?.data
  });
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler (must be after routes)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Check required environment variables
const requiredEnv = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'GOOGLE_CLIENT_ID',
  'YOUTUBE_API_KEY'
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error('Missing required environment variables:', missingEnv);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS enabled for:', ['http://localhost:5173', 'http://127.0.0.1:5173']);
  console.log('Available routes:');
  console.log('- GET  /api/test');
  console.log('- GET  /api/test/db');
  console.log('- GET  /api/youtube/test-config');
  console.log('- GET  /api/auth/test-db');
  console.log('- POST /api/auth/oauth-login');
});


