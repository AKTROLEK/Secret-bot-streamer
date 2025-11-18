import axios from 'axios';
import config from '../../config/index.js';

/**
 * YouTube Platform Integration Service
 */
export async function fetchYouTubeChannelData(channelId) {
  if (!config.platforms.youtube.apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        key: config.platforms.youtube.apiKey,
        id: channelId,
        part: 'statistics,snippet,contentDetails',
      },
    });

    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      return {
        title: channel.snippet.title,
        subscriberCount: parseInt(channel.statistics.subscriberCount),
        viewCount: parseInt(channel.statistics.viewCount),
        videoCount: parseInt(channel.statistics.videoCount),
        thumbnail: channel.snippet.thumbnails.default.url,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching YouTube data:', error.message);
    throw error;
  }
}

export async function fetchYouTubeRecentVideos(channelId, maxResults = 10) {
  if (!config.platforms.youtube.apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: config.platforms.youtube.apiKey,
        channelId: channelId,
        part: 'snippet',
        order: 'date',
        maxResults: maxResults,
        type: 'video',
      },
    });

    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails.default.url,
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error.message);
    throw error;
  }
}

/**
 * Twitch Platform Integration Service
 */
export async function fetchTwitchUserData(username) {
  if (!config.platforms.twitch.clientId || !config.platforms.twitch.clientSecret) {
    throw new Error('Twitch credentials not configured');
  }

  try {
    // Get OAuth token
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: config.platforms.twitch.clientId,
        client_secret: config.platforms.twitch.clientSecret,
        grant_type: 'client_credentials',
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Get user data
    const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
      params: { login: username },
      headers: {
        'Client-ID': config.platforms.twitch.clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (userResponse.data.data && userResponse.data.data.length > 0) {
      const user = userResponse.data.data[0];
      return {
        id: user.id,
        displayName: user.display_name,
        description: user.description,
        profileImageUrl: user.profile_image_url,
        viewCount: user.view_count,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching Twitch data:', error.message);
    throw error;
  }
}

/**
 * Generic platform data fetcher
 * Placeholder for TikTok, Kick, Instagram, Facebook
 */
export async function fetchPlatformData(platform, identifier) {
  // These would need actual API implementations based on platform availability
  console.log(`Fetching data for ${platform}: ${identifier}`);
  
  // Placeholder implementation
  return {
    platform,
    identifier,
    message: 'API integration pending - add API keys to enable',
  };
}

export default {
  fetchYouTubeChannelData,
  fetchYouTubeRecentVideos,
  fetchTwitchUserData,
  fetchPlatformData,
};
