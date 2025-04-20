const { SensorData, Channel } = require('../models');
const { Op } = require('sequelize');

// Get all sensor data (with pagination)
exports.getAllSensorData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await SensorData.findAndCountAll({
      limit,
      offset,
      order: [['timestamp', 'DESC']],
      include: [{ 
        model: Channel, 
        as: 'channel',
        attributes: ['id', 'name', 'fields'] 
      }]
    });
    
    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit
      },
      meta: {
        timestamp: '2025-03-28 02:35:49',
        user: 'Furucrm-Tuan'
      }
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get sensor data by channel
exports.getSensorDataByChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    
    // Find channel to verify it exists and get fields
    const channel = await Channel.findByPk(channelId);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }
    
    // Build where clause
    const whereClause = { channelId }; // Note: using camelCase as defined in model
    
    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      whereClause.timestamp = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      whereClause.timestamp = {
        [Op.lte]: endDate
      };
    }
    
    // Query sensor data
    const sensorData = await SensorData.findAll({
      where: whereClause,
      limit,
      order: [['timestamp', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: sensorData,
      meta: {
        timestamp: '2025-03-28 02:35:49',
        user: 'Furucrm-Tuan',
        channel: {
          id: channel.id,
          name: channel.name,
          fields: channel.fields
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sensor data for channel:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get latest sensor data for a channel
exports.getLatestSensorData = async (req, res) => {
  try {
    const { channelId } = req.params;
    
    // Find channel to verify it exists
    const channel = await Channel.findByPk(channelId);
    
    if (!channel) {
      return res.status(404).json({
        success: false,
        error: 'Channel not found'
      });
    }
    
    // Get latest data point
    const latestData = await SensorData.findOne({
      where: { channelId }, // Note: using camelCase as defined in model
      order: [['timestamp', 'DESC']]
    });
    
    if (!latestData) {
      return res.status(404).json({
        success: false,
        error: 'No sensor data found for this channel'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: latestData,
      meta: {
        timestamp: '2025-03-28 02:35:49',
        user: 'Furucrm-Tuan',
        channel: {
          id: channel.id,
          name: channel.name,
          fields: channel.fields
        }
      }
    });
  } catch (error) {
    console.error('Error fetching latest sensor data:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Add sensor data using channel API key
exports.addSensorData = async (req, res) => {
  try {
    const { apiKey } = req.params;
    const sensorData = req.body;
    
    console.log(`Processing request to add sensor data with API key: ${apiKey}`);
    
    if (!sensorData || typeof sensorData !== 'object' || Array.isArray(sensorData)) {
      return res.status(400).json({
        success: false,
        error: 'Data must be a valid JSON object'
      });
    }
    
    // Find channel by API key
    console.log(`Searching for channel with API key: ${apiKey}`);
    
    const channel = await Channel.findOne({ 
      where: { apiKey } // Note: using camelCase as defined in the model
    });
    
    // Debug output
    console.log('Channel search result:', channel ? `Found channel ID: ${channel.id}` : 'Channel not found');
    
    if (!channel) {
      console.log(`No channel found with API key: ${apiKey}`);
      return res.status(404).json({
        success: false,
        error: 'Invalid API key'
      });
    }
    
    // Optional: Validate fields against channel field definitions
    if (channel.fields && channel.fields.length > 0) {
      const definedFields = channel.fields.map(field => field.name);
      const providedFields = Object.keys(sensorData);
      
      const validFields = providedFields.filter(field => definedFields.includes(field));
      
      if (validFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid fields provided',
          validFields: definedFields
        });
      }
      
      // Uncomment to log valid fields
      // console.log(`Valid fields found: ${validFields.join(', ')}`);
    }
    
    // Create sensor data record
    console.log(`Creating sensor data for channel ID: ${channel.id}`);
    const newData = await SensorData.create({
      channelId: channel.id,
      data: sensorData,
      timestamp: new Date()
    });
    
    console.log(`Successfully created sensor data with ID: ${newData.id}`);
    
    return res.status(201).json({
      success: true,
      data: newData,
      meta: {
        timestamp: '2025-03-28 02:35:49',
        channel: channel.name
      }
    });
  } catch (error) {
    console.error('Error details when adding sensor data:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};