// controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');
const axios = require('axios');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function oauthLogin(req, res) {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token missing' });

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // Insert user if not exists
    const [userRows] = await db.promise().query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    let userId;
    if (userRows.length === 0) {
      const [insertRes] = await db.promise().query(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, '', 'analyst')`,
        [name, email]
      );
      userId = insertRes.insertId;
    } else {
      userId = userRows[0].id;
    }

    // Assume YouTube is platform_id = 1
    const [platformRow] = await db.promise().query(
      `SELECT id FROM platforms WHERE name = 'YouTube'`
    );
    const platformId = platformRow[0].id;

    // Insert platform account
    await db.promise().query(
      `INSERT IGNORE INTO platform_accounts (user_id, platform_id, external_username, access_token, refresh_token, expires_at)
       VALUES (?, ?, ?, '', '', NOW())`,
      [userId, platformId, email]
    );

    // Now call service to fetch YouTube videos and store in DB
    const { getChannelAndSaveVideos } = require('../services/youtubeService');
    await getChannelAndSaveVideos('UC1oPSSNFYVuKGj14J0mYHLQ', 1); // (channelId, platformAccountId)

    res.json({ message: 'YouTube data synced successfully!' });
  } catch (err) {
    console.error('OAuth Login Error:', err);
    res.status(500).json({ error: 'OAuth verification failed' });
  }
}

module.exports = { oauthLogin };
