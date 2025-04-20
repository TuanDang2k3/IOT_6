const express = require('express');
const router = express.Router();
const sensorDataController = require('../controllers/sensorController');

router.get('/', sensorDataController.getAllSensorData);

// Get sensor data by channel ID
router.get('/channel/:channelId', sensorDataController.getSensorDataByChannel);

// Get latest sensor data for a channel
router.get('/channel/:channelId/latest', sensorDataController.getLatestSensorData);

// Add sensor data using channel API key
router.post('/api/:apiKey', sensorDataController.addSensorData);

module.exports = router;