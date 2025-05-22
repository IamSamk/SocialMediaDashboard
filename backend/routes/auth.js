const express = require('express');
const axios = require('axios');
const { pool } = require('../db');
const youtubeService = require('../services/youtubeService');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    res.json({ 
      message: 'Database connection successful!',
      result: result[0]
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: err.message
    });
  }
});

// Verify Google token and create/update user
router.post('/verify-token', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    const [userRows] = await pool.query(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId]
    );

    let userId;
    if (userRows.length === 0) {
      // Create new user
      const [newUser] = await pool.query(
        'INSERT INTO users (google_id, email, name, profile_picture) VALUES (?, ?, ?, ?)',
        [googleId, email, name, picture]
      );
      userId = newUser.insertId;
    } else {
      userId = userRows[0].id || userRows[0].user_id;
      // Update existing user's info
      await pool.query(
        'UPDATE users SET email = ?, name = ?, profile_picture = ? WHERE google_id = ?',
        [email, name, picture, googleId]
      );
    }

    res.json({
      success: true,
      userId,
      email,
      name,
      picture
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Google token verification endpoint (working method)
router.post('/oauth-login', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    console.error('Missing token in request body:', req.body);
    return res.status(400).json({ error: 'Missing token' });
  }

  try {
    console.log('Starting OAuth login process...');
    
    // Use the access token to get user info
    console.log('Fetching user info from Google...');
    const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { email, name, sub, picture } = userInfoRes.data;
    console.log('User info received:', { email, name, sub: sub ? 'present' : 'missing' });
    
    if (!email || !name) {
      throw new Error('Invalid Google response: missing email or name');
    }

    // 👤 Check or Insert user
    console.log('Checking/creating user in database...');
    let [user] = await pool.promise().query(`SELECT * FROM users WHERE email = ?`, [email]);
    let userId;
    if (user.length === 0) {
      console.log('Creating new user...');
      const [insert] = await pool.promise().query(
        `INSERT INTO users (name, email, password_hash, role, profile_picture, google_id) VALUES (?, ?, '', 'analyst', ?, ?)` ,
        [name, email, picture || null, sub]
      );
      userId = insert.insertId;
      console.log('New user created with ID:', userId);
    } else {
      userId = user[0].id;
      console.log('Existing user found with ID:', userId);
      // Update user profile if needed
      await pool.promise().query(
        `UPDATE users SET name = ?, profile_picture = ?, google_id = ? WHERE id = ?`,
        [name, picture, sub, userId]
      );
    }

    // 🔗 Check or Insert platform (YouTube)
    console.log('Checking YouTube platform...');
    const [ytPlatform] = await pool.promise().query(`SELECT * FROM platforms WHERE name = 'YouTube'`);
    const platformId = ytPlatform[0]?.id;
    if (!platformId) {
      console.error('YouTube platform not found in database');
      return res.status(500).json({ error: 'YouTube platform not found' });
    }
    console.log('YouTube platform found with ID:', platformId);

    // 🎯 Create platform_account if not exists
    console.log('Checking platform account...');
    const [accCheck] = await pool.promise().query(
      `SELECT * FROM platform_accounts WHERE user_id = ? AND platform_id = ?`,
      [userId, platformId]
    );
    let platformAccountId;
    if (accCheck.length === 0) {
      console.log('Creating new platform account...');
      const [accInsert] = await pool.promise().query(
        `INSERT INTO platform_accounts (user_id, platform_id, external_username, access_token, refresh_token, expires_at)
         VALUES (?, ?, ?, ?, '', NOW() + INTERVAL 1 HOUR)`,
        [userId, platformId, email, token]
      );
      platformAccountId = accInsert.insertId;
      console.log('New platform account created with ID:', platformAccountId);
    } else {
      platformAccountId = accCheck[0].id;
      console.log('Existing platform account found with ID:', platformAccountId);
      // Update token if needed
      if (token !== accCheck[0].access_token) {
        await pool.promise().query(
          `UPDATE platform_accounts SET access_token = ?, expires_at = NOW() + INTERVAL 1 HOUR WHERE id = ?`,
          [token, platformAccountId]
        );
      }
    }

    // 📥 Fetch & Save Data
    let youtubeSyncError = null;
    try {
      console.log('Attempting to fetch YouTube data...');
      if (typeof youtubeService.getChannelAndSaveVideosByToken === 'function') {
        await youtubeService.getChannelAndSaveVideosByToken(token, platformAccountId);
        console.log('YouTube data fetched successfully');
      } else {
        console.log('YouTube service function not available, skipping data fetch');
      }
    } catch (ytError) {
      youtubeSyncError = ytError.message || ytError.toString();
      console.error('YouTube data fetch failed:', ytError);
      // Don't fail the login if YouTube data fetch fails
    }

    console.log('Login process completed successfully');
    res.json({ 
      message: 'Login successful!', 
      user_id: userId,
      platform_account_id: platformAccountId,
      user: {
        name,
        email,
        picture
      },
      youtubeSyncError
    });
  } catch (err) {
    console.error('OAuth login error:', {
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });
    res.status(500).json({ 
      error: 'OAuth login failed',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;
