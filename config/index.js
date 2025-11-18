import dotenv from 'dotenv';
dotenv.config();

export default {
  // Discord Configuration
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID,
  },

  // Database Configuration
  database: {
    mongoUri: process.env.MONGODB_URI,
    // postgresUri: process.env.DATABASE_URL,
  },

  // Platform API Keys
  platforms: {
    youtube: {
      apiKey: process.env.YOUTUBE_API_KEY,
    },
    twitch: {
      clientId: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
    },
    tiktok: {
      apiKey: process.env.TIKTOK_API_KEY,
    },
    kick: {
      apiKey: process.env.KICK_API_KEY,
    },
    instagram: {
      apiKey: process.env.INSTAGRAM_API_KEY,
    },
    facebook: {
      apiKey: process.env.FACEBOOK_API_KEY,
    },
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // Discord Role IDs
  roles: {
    socialMediaManager: process.env.SOCIAL_MEDIA_MANAGER_ROLE_ID,
    socialTeam: process.env.SOCIAL_TEAM_ROLE_ID,
    streamerManagement: process.env.STREAMER_MANAGEMENT_ROLE_ID,
  },

  // Discord Channel IDs
  channels: {
    ticketCategory: process.env.TICKET_CATEGORY_ID,
    alerts: process.env.ALERTS_CHANNEL_ID,
    reports: process.env.REPORTS_CHANNEL_ID,
  },

  // System Configuration
  system: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
  },

  // Dashboard Configuration
  dashboard: {
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
};
