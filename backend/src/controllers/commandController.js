const { Command, Device } = require('../models');
const config = require('../config/config');

// Get all commands
exports.getAllCommands = async (req, res) => {
  try {
    const commands = await Command.findAll({
      include: [{ model: Device, as: 'device' }],
      order: [['created_at', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: commands,
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser
      }
    });
  } catch (error) {
    console.error('Error fetching commands:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get a single command by ID
exports.getCommandById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const command = await Command.findByPk(id, {
      include: [{ model: Device, as: 'device' }]
    });
    
    if (!command) {
      return res.status(404).json({
        success: false,
        error: 'Command not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: command,
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser
      }
    });
  } catch (error) {
    console.error('Error fetching command:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get pending commands for a device by MAC address
exports.getPendingCommandsByMac = async (req, res) => {
  try {
    const { macAddress } = req.params;
    
    const device = await Device.findOne({ where: { macAddress } });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
    
    // Update device last seen timestamp
    await device.update({ lastSeen: new Date() });
    
    const pendingCommands = await Command.findAll({
      where: {
        deviceId: device.id,
        status: 'PENDING'
      },
      order: [['created_at', 'ASC']]
    });
    
    // Update command status to SENT
    for (const command of pendingCommands) {
      await command.update({ status: 'SENT' });
    }
    
    return res.status(200).json({
      success: true,
      data: pendingCommands,
      meta: {
        timestamp: config.currentDate,
        device: device.name
      }
    });
  } catch (error) {
    console.error('Error fetching pending commands:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Create a new command
exports.createCommand = async (req, res) => {
  try {
    const { deviceId, command, parameters } = req.body;
    
    if (!deviceId || !command) {
      return res.status(400).json({
        success: false,
        error: 'Please provide deviceId and command'
      });
    }
    
    const device = await Device.findByPk(deviceId);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
    
    const newCommand = await Command.create({
      deviceId,
      command,
      parameters,
      status: 'PENDING'
    });
    
    return res.status(201).json({
      success: true,
      data: newCommand,
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser,
        device: device.name
      }
    });
  } catch (error) {
    console.error('Error creating command:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Update command status
exports.updateCommandStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { macAddress, status } = req.body;
    
    if (!status || !['PENDING', 'SENT', 'COMPLETED', 'FAILED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid status (PENDING, SENT, COMPLETED, FAILED)'
      });
    }
    
    const command = await Command.findByPk(id);
    
    if (!command) {
      return res.status(404).json({
        success: false,
        error: 'Command not found'
      });
    }
    
    // If macAddress is provided, verify that it matches the device
    if (macAddress) {
      const device = await Device.findByPk(command.deviceId);
      
      if (!device || device.macAddress !== macAddress) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized: MAC address does not match device'
        });
      }
      
      // Update device last seen timestamp
      await device.update({ lastSeen: new Date() });
    }
    
    // Update command status
    const updatedCommand = await command.update({
      status,
      executedAt: ['COMPLETED', 'FAILED'].includes(status) ? new Date() : command.executedAt
    });
    
    return res.status(200).json({
      success: true,
      data: updatedCommand,
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser
      }
    });
  } catch (error) {
    console.error('Error updating command status:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Delete a command
exports.deleteCommand = async (req, res) => {
  try {
    const { id } = req.params;
    
    const command = await Command.findByPk(id);
    
    if (!command) {
      return res.status(404).json({
        success: false,
        error: 'Command not found'
      });
    }
    
    await command.destroy();
    
    return res.status(200).json({
      success: true,
      data: {},
      message: 'Command deleted successfully',
      meta: {
        timestamp: config.currentDate,
        user: config.currentUser
      }
    });
  } catch (error) {
    console.error('Error deleting command:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};