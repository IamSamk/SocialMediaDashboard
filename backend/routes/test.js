const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/db', async (req, res) => {
  try {
    // Test basic connection
    const [result] = await db.promise().query('SELECT 1');
    console.log('Basic connection test:', result);

    // Check required tables
    const tables = ['users', 'platforms', 'platform_accounts', 'posts', 'engagements'];
    const tableStatus = {};

    for (const table of tables) {
      try {
        const [rows] = await db.promise().query(`SELECT COUNT(*) as count FROM ${table}`);
        tableStatus[table] = {
          exists: true,
          count: rows[0].count
        };
      } catch (err) {
        tableStatus[table] = {
          exists: false,
          error: err.message
        };
      }
    }

    // Check YouTube platform
    const [ytPlatform] = await db.promise().query(`SELECT * FROM platforms WHERE name = 'YouTube'`);
    
    res.json({ 
      message: 'Database connection successful',
      tables: tableStatus,
      youtube_platform: ytPlatform[0] || null
    });
  } catch (err) {
    console.error('Database test error:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState
    });
    res.status(500).json({ 
      error: 'Database test failed', 
      details: err.message,
      code: err.code
    });
  }
});

module.exports = router; 