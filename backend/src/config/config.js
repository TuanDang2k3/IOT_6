require('dotenv').config();

module.exports = {
  db: {
    name: process.env.DB_NAME || 'iot_system',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
  },
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
};