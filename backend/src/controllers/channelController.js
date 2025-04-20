const Channel = require('../models/channel');
const crypto = require('crypto');
const config = require('../config/config');

// Get all channels
exports.getAllChannels = async (req, res) => {
  try {
    const channels = await Channel.findAll();
    
    return res.status(200).json({
      success: true,
      data: channels,
      meta: {
        timestamp: '2025-03-22 04:33:54',
        user: 'Furucrm-Tuan'
      }
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get a single channel by ID
exports.getChannelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const channel = await Channel.findByPk(id);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: channel,
      meta: {
        timestamp: '2025-03-22 04:33:54',
        user: 'Furucrm-Tuan'
      }
    });
  } catch (error) {
    console.error('Error fetching channel:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Create a new channel
exports.createChannel = async (req, res) => {
  try {
    const { name, field_name, description, is_public } = req.body;
    
    if (!name || !field_name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and field_name'
      });
    }
    
    // Generate a unique API key for the channel
    const apiKey = crypto.randomBytes(16).toString('hex');
    
    const channel = await Channel.create({
      name,
      field_name,
      description,

      api_key: apiKey,
      is_public: is_public || false
    });
    
    return res.status(201).json({
      success: true,
      data: channel,
      meta: {
        timestamp: '2025-03-22 04:33:54',
        user: 'Furucrm-Tuan'
      }
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Update a channel
exports.updateChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, field_name, description, unit, is_public } = req.body;
    
    const channel = await Channel.findByPk(id);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }
    
    const updatedChannel = await channel.update({
      name: name || channel.name,
      field_name: field_name || channel.field_name,
      description: description !== undefined ? description : channel.description,
      unit: unit !== undefined ? unit : channel.unit,
      is_public: is_public !== undefined ? is_public : channel.is_public
    });
    
    return res.status(200).json({
      success: true,
      data: updatedChannel,
      meta: {
        timestamp: '2025-03-22 04:33:54',
        user: 'Furucrm-Tuan'
      }
    });
  } catch (error) {
    console.error('Error updating channel:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Regenerate API key for a channel
exports.regenerateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    
    const channel = await Channel.findByPk(id);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }
    
    const newApiKey = crypto.randomBytes(16).toString('hex');
    
    await channel.update({
      api_key: newApiKey
    });
    
    return res.status(200).json({
      success: true,
      data: { apiKey: newApiKey },
      message: 'API key regenerated successfully',
      meta: {
        timestamp: '2025-03-22 04:33:54',
        user: 'Furucrm-Tuan'
      }
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Delete a channel
exports.deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const channel = await Channel.findByPk(id);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }
    
    await channel.destroy();
    
    return res.status(200).json({
      success: true,
      data: {},
      message: 'Channel deleted successfully',
      meta: {
        timestamp: '2025-03-22 04:33:54',
        user: 'Furucrm-Tuan'
      }
    });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};