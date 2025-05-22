const express = require('express');
const db = require('../db');
const router = express.Router();

// Create a new goal
router.post('/', async (req, res) => {
  const { userId, goalType, targetValue, deadline } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO goals (userId, goalType, targetValue, deadline) VALUES (?, ?, ?, ?)',
      [userId, goalType, targetValue, deadline]
    );
    res.json({ goalId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all goals for a user
router.get('/', async (req, res) => {
  const { userId } = req.query;
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM goals WHERE userId = ?',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a goal
router.put('/:goalId', async (req, res) => {
  const { goalId } = req.params;
  const { goalType, targetValue, currentValue, deadline, status } = req.body;
  try {
    await db.promise().query(
      'UPDATE goals SET goalType=?, targetValue=?, currentValue=?, deadline=?, status=? WHERE goalId=?',
      [goalType, targetValue, currentValue, deadline, status, goalId]
    );
    res.json({ message: 'Goal updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a goal
router.delete('/:goalId', async (req, res) => {
  const { goalId } = req.params;
  try {
    await db.promise().query('DELETE FROM goals WHERE goalId=?', [goalId]);
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 