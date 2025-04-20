// Current Date and Time (UTC): 2025-03-23 17:33:15
// Current User's Login: Furucrm-Tuan

const { Device } = require('../models');
const config = require('../config/config');

// Get all devices
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.findAll();
    
    return res.status(200).json({
      success: true,
      data: devices,
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser
      }
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get a single device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const device = await Device.findByPk(id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: device,
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser
      }
    });
  } catch (error) {
    console.error('Error fetching device:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Create a new device
exports.createDevice = async (req, res) => {
  try {
    const { name, macAddress, description } = req.body;
    
    if (!name || !macAddress) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and macAddress'
      });
    }
    
    const existingDevice = await Device.findOne({ where: { macAddress } });
    
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        error: 'Device with this MAC address already exists'
      });
    }
    
    const device = await Device.create({
      name,
      macAddress,
      description,
      lastSeen: new Date()
    });
    
    return res.status(201).json({
      success: true,
      data: device,
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser
      }
    });
  } catch (error) {
    console.error('Error creating device:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Update a device
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    
    const device = await Device.findByPk(id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
    
    const updatedDevice = await device.update({
      name: name || device.name,
      description: description !== undefined ? description : device.description,
      isActive: isActive !== undefined ? isActive : device.isActive
    });
    
    return res.status(200).json({
      success: true,
      data: updatedDevice,
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser
      }
    });
  } catch (error) {
    console.error('Error updating device:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Delete a device
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const device = await Device.findByPk(id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
    
    await device.destroy();
    
    return res.status(200).json({
      success: true,
      data: {},
      message: 'Device deleted successfully',
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser
      }
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Update device last seen
exports.updateDeviceLastSeen = async (req, res) => {
  try {
    const { macAddress } = req.params;
    
    const device = await Device.findOne({ where: { macAddress } });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
    
    await device.update({
      lastSeen: new Date()
    });
    
    return res.status(200).json({
      success: true,
      message: 'Device last seen updated',
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser
      }
    });
  } catch (error) {
    console.error('Error updating device last seen:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};