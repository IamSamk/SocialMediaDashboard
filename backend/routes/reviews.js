const express = require('express');
const db = require('../db');
const router = express.Router();

// Create a new review
router.post('/', async (req, res) => {
  const { userId, rating, comment } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO reviews (userId, rating, comment) VALUES (?, ?, ?)',
      [userId, rating, comment]
    );
    res.json({ reviewId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all reviews (optionally filter by user)
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    let query = 'SELECT * FROM reviews';
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

// Delete a review
router.delete('/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  try {
    await db.promise().query('DELETE FROM reviews WHERE reviewId=?', [reviewId]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 