const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Get all devices
router.get('/', deviceController.getAllDevices);

// Get a single device by ID
router.get('/:id', deviceController.getDeviceById);

// Create a new device
router.post('/', deviceController.createDevice);

// Update a device
router.put('/:id', deviceController.updateDevice);

// Delete a device
router.delete('/:id', deviceController.deleteDevice);

// Update device last seen
router.post('/ping/:macAddress', deviceController.updateDeviceLastSeen);

module.exports = router;