const express = require('express');
const db = require('../db');
const router = express.Router();

// Log a tool usage event
router.post('/', async (req, res) => {
  const { userId, toolName, paramsUsed, result } = req.body;
  try {
    const [resultDb] = await db.promise().query(
      'INSERT INTO toolusage (userId, toolName, paramsUsed, result) VALUES (?, ?, ?, ?)',
      [userId, toolName, paramsUsed, result]
    );
    res.json({ toolId: resultDb.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tool usage logs for a user
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    let query = 'SELECT * FROM toolusage';
    let params = [];
    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    const [rows] = await db.promise().query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 