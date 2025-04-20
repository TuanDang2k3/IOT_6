const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Command = sequelize.define('Command', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  deviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  command: {
    type: DataTypes.STRING,
    allowNull: false, // Example: "LED_ON", "LED_OFF"
  },
  parameters: {
    type: DataTypes.JSON,
    allowNull: true, // Additional parameters for the command
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SENT', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING',
  },
  executedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'commands',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Command;