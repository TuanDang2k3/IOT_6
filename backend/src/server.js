const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const { syncDatabase } = require('./models');

// Import routes
const deviceRoutes = require('./routes/deviceRoutes');
const channelRoutes = require('./routes/channelRoutes');
const sensorDataRoutes = require('./routes/sensorRoutes');
const commandRoutes = require('./routes/commandRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/sensor', sensorDataRoutes);
app.use('/api/commands', commandRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Server is running',
    environment: config.app.env,
    currentUser: config.currentUser,
    currentDate: config.currentDate
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'ESP32 Weather Monitoring API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.app.port;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Sync database models
  await syncDatabase();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;