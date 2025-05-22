const express = require('express');
const db = require('../db');
const router = express.Router();

// Create a new trend
router.post('/', async (req, res) => {
  const { platform, hashtag, occurrences } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO trends (platform, hashtag, occurrences) VALUES (?, ?, ?)',
      [platform, hashtag, occurrences]
    );
    res.json({ trendId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all trends (optionally filter by platform)
router.get('/', async (req, res) => {
  const { platform } = req.query;
  try {
    let query = 'SELECT * FROM trends';
    let params = [];
    if (platform) {
      query += ' WHERE platform = ?';
      params.push(platform);
    }
    const [rows] = await db.promise().query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 