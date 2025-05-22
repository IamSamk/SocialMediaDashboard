const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mysql = require('mysql2');

// Log environment variables for debugging
console.log('Loaded environment variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? '***' : undefined,
  DB_NAME: process.env.DB_NAME
});

// Log database configuration (without password)
console.log('Database Configuration:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'SocialMediaAnalyticsPro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database Connection Error:', {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    throw err;
  }
  console.log('Database connected successfully');
  connection.release();
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database Pool Error:', {
    code: err.code,
    errno: err.errno,
    sqlState: err.sqlState,
    sqlMessage: err.sqlMessage
  });
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

// Export both the pool and promise pool
module.exports = {
  pool,
  promise: () => pool.promise()
};
