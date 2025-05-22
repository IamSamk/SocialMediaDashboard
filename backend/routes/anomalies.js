const express = require('express');
const db = require('../db');
const router = express.Router();

// Log a detected anomaly
router.post('/', async (req, res) => {
  const { userId, description, severity } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO anomalies (userId, description, severity) VALUES (?, ?, ?)',
      [userId, description, severity]
    );
    res.json({ anomalyId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get anomalies for a user
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    let query = 'SELECT * FROM anomalies';
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