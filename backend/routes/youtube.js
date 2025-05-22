const express = require('express');
const router = express.Router();
const { getChannelAndSaveVideos } = require('../services/youtubeService');
require('dotenv').config();

const PLATFORM_ACCOUNT_ID = 1; // Set your actual ID from platform_accounts table

// Test YouTube API configuration
router.get('/test-config', (req, res) => {
  try {
    const config = {
      apiKey: process.env.YOUTUBE_API_KEY ? 'Set' : 'Not Set',
      scopes: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl'
      ]
    };
    
    console.log('YouTube API Configuration:', config);
    
    res.json({
      message: 'YouTube API Configuration',
      config
    });
  } catch (err) {
    console.error('YouTube config test error:', err);
    res.status(500).json({
      error: 'Failed to get YouTube configuration',
      details: err.message
    });
  }
});

// Save channel data
router.get('/save/:channelId', async (req, res) => {
  try {
    console.log('Saving channel data for:', req.params.channelId);
    const result = await getChannelAndSaveVideos(req.params.channelId, PLATFORM_ACCOUNT_ID);
    console.log('Channel data saved successfully:', result);
    res.json(result);
  } catch (err) {
    console.error('Save error:', {
      message: err.message,
      channelId: req.params.channelId,
      stack: err.stack
    });
    res.status(500).json({ 
      error: 'Failed to save channel data',
      details: err.message
    });
  }
});

// Get YouTube channel subscriber count for the authenticated user
router.get('/subscribers', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }
  try {
    const channelRes = await require('axios').get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'statistics',
        mine: true,
        key: process.env.YOUTUBE_API_KEY
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!channelRes.data.items || channelRes.data.items.length === 0) {
      return res.status(404).json({ error: 'No YouTube channel found' });
    }
    const stats = channelRes.data.items[0].statistics;
    res.json({ subscriberCount: stats.subscriberCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
