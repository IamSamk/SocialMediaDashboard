const axios = require('axios');
const { promise } = require('../db');
require('dotenv').config();

const API_KEY = process.env.YOUTUBE_API_KEY;

async function getChannelAndSaveVideosByToken(token, platformAccountId) {
  try {
    // Get user's channel info using the token
    const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet,statistics,contentDetails',
        mine: true,
        key: API_KEY
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!channelRes.data.items || channelRes.data.items.length === 0) {
      throw new Error('No YouTube channel found for this account');
    }

    const channel = channelRes.data.items[0];
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    // Fetch all videos using pagination
    let allVideos = [];
    let nextPageToken = null;
    do {
      const videosRes = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          part: 'snippet,contentDetails',
          playlistId: uploadsPlaylistId,
          maxResults: 50, // max allowed by API
          pageToken: nextPageToken,
          key: API_KEY
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      allVideos = allVideos.concat(videosRes.data.items);
      nextPageToken = videosRes.data.nextPageToken;
    } while (nextPageToken);

    // Process each video
    for (const video of allVideos) {
      const videoId = video.contentDetails.videoId;
      const title = video.snippet.title;
      const publishedAt = new Date(video.snippet.publishedAt).toISOString().slice(0, 19).replace('T', ' ');

      // Insert or update post
      const [postResult] = await promise().query(
        `INSERT INTO posts (platform_account_id, external_post_id, content, media_url, date_posted)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE content=VALUES(content), date_posted=VALUES(date_posted)`,
        [platformAccountId, videoId, title, null, publishedAt]
      );

      const postId = postResult.insertId || (
        await promise().query(
          `SELECT id FROM posts WHERE external_post_id = ? AND platform_account_id = ?`,
          [videoId, platformAccountId]
        )
      )[0][0]?.id;

      // Get video stats
      const statsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'statistics',
          id: videoId,
          key: API_KEY
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const stats = statsRes.data.items[0]?.statistics || {};

      // Calculate engagement score
      const viewCount = parseInt(stats.viewCount || 0);
      const likeCount = parseInt(stats.likeCount || 0);
      const commentCount = parseInt(stats.commentCount || 0);
      const engagementScore = viewCount > 0 ? ((likeCount + commentCount) / viewCount).toFixed(2) : 0;

      // Insert or update engagement metrics
      await promise().query(
        `INSERT INTO engagements (post_id, views, likes, comments, shares, engagement_score)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         views=VALUES(views), 
         likes=VALUES(likes), 
         comments=VALUES(comments),
         engagement_score=VALUES(engagement_score)`,
        [postId, viewCount, likeCount, commentCount, 0, engagementScore]
      );
    }

    return { message: 'YouTube data synced successfully!' };
  } catch (error) {
    console.error('YouTube API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(`Failed to sync YouTube data: ${error.message}`);
  }
}

async function getChannelAndSaveVideos(channelId, platformAccountId) {
  try {
    // 1️⃣ Fetch channel + playlist info
    const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: channelId,
        key: API_KEY
      }
    });

    if (!channelRes.data.items || channelRes.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = channelRes.data.items[0];
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    // 2️⃣ Fetch recent videos
    const videosRes = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: 5,
        key: API_KEY
      }
    });

    // 3️⃣ Process each video
    for (const video of videosRes.data.items) {
      const videoId = video.contentDetails.videoId;
      const title = video.snippet.title;
      const publishedAt = new Date(video.snippet.publishedAt).toISOString().slice(0, 19).replace('T', ' ');

      // Insert or update post
      const [postResult] = await promise().query(
        `INSERT INTO posts (platform_account_id, external_post_id, content, media_url, date_posted)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE content=VALUES(content), date_posted=VALUES(date_posted)`,
        [platformAccountId, videoId, title, null, publishedAt]
      );

      const postId = postResult.insertId || (
        await promise().query(
          `SELECT id FROM posts WHERE external_post_id = ? AND platform_account_id = ?`,
          [videoId, platformAccountId]
        )
      )[0][0]?.id;

      // Get video stats
      const statsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'statistics',
          id: videoId,
          key: API_KEY
        }
      });

      const stats = statsRes.data.items[0]?.statistics || {};

      // Calculate engagement score
      const viewCount = parseInt(stats.viewCount || 0);
      const likeCount = parseInt(stats.likeCount || 0);
      const commentCount = parseInt(stats.commentCount || 0);
      const engagementScore = viewCount > 0 ? ((likeCount + commentCount) / viewCount).toFixed(2) : 0;

      // Insert or update engagement metrics
      await promise().query(
        `INSERT INTO engagements (post_id, views, likes, comments, shares, engagement_score)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         views=VALUES(views), 
         likes=VALUES(likes), 
         comments=VALUES(comments),
         engagement_score=VALUES(engagement_score)`,
        [postId, viewCount, likeCount, commentCount, 0, engagementScore]
      );
    }

    return { message: 'Videos saved to DB!' };
  } catch (error) {
    console.error('YouTube API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(`Failed to fetch YouTube data: ${error.message}`);
  }
}

module.exports = { getChannelAndSaveVideos, getChannelAndSaveVideosByToken };
