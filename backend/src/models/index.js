const sequelize = require('../config/database');
const Device = require('./device');
const Channel = require('./channel');
const SensorData = require('./SensorData');
const Command = require('./command');



Channel.hasMany(SensorData, { foreignKey: 'channelId', as: 'sensorData' });
SensorData.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });

Device.hasMany(Command, { foreignKey: 'deviceId', as: 'commands' });
Command.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' });

// Sync all models with database
async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}

module.exports = {
  sequelize,
  Device,
  Channel,
  SensorData,
  Command,
  syncDatabase
};