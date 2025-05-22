const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all posts for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Get userId from query param or header (for now, fallback to 2 for testing)
    const userId = req.query.userId || req.headers['x-user-id'] || 2;

    // Get platform_account_id for this user (YouTube)
    const [accounts] = await db.promise().query(
      `SELECT id FROM platform_accounts WHERE user_id = ?`,
      [userId]
    );
    if (!accounts.length) return res.json([]);

    const platformAccountId = accounts[0].id;

    // Get posts for this platform account
    const [posts] = await db.promise().query(
      `SELECT p.id, p.external_post_id, p.content, p.date_posted, 
              e.views, e.likes, e.comments, e.engagement_score
         FROM posts p
         LEFT JOIN engagements e ON p.id = e.post_id
         WHERE p.platform_account_id = ?`,
      [platformAccountId]
    );
    res.json(posts);
  } catch (err) {
    console.error('Posts fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
});

module.exports = router;
