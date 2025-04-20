const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const Channel = sequelize.define('Channel', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fields: {
    type: DataTypes.JSON, 
    allowNull: false,
    defaultValue:[],
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Unique API key for each channel
    defaultValue: () => crypto.randomBytes(16).toString('hex'), // Generate random API key
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'channels',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Channel;