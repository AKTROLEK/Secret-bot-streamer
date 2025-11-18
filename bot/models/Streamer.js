import mongoose from 'mongoose';

const streamerSchema = new mongoose.Schema({
  // Discord Information
  discordId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended'],
    default: 'pending',
  },
  
  // Platforms
  platforms: {
    youtube: {
      channelId: String,
      channelUrl: String,
      enabled: { type: Boolean, default: false },
    },
    twitch: {
      username: String,
      channelUrl: String,
      enabled: { type: Boolean, default: false },
    },
    tiktok: {
      username: String,
      profileUrl: String,
      enabled: { type: Boolean, default: false },
    },
    kick: {
      username: String,
      channelUrl: String,
      enabled: { type: Boolean, default: false },
    },
    instagram: {
      username: String,
      profileUrl: String,
      enabled: { type: Boolean, default: false },
    },
    facebook: {
      pageId: String,
      pageUrl: String,
      enabled: { type: Boolean, default: false },
    },
  },

  // Credit System
  credit: {
    balance: {
      type: Number,
      default: 0,
    },
    savings: {
      type: Number,
      default: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },

  // Performance Stats
  stats: {
    totalVideos: { type: Number, default: 0 },
    totalStreams: { type: Number, default: 0 },
    totalStreamingHours: { type: Number, default: 0 },
    weeklyVideos: { type: Number, default: 0 },
    weeklyStreamingHours: { type: Number, default: 0 },
    monthlyVideos: { type: Number, default: 0 },
    monthlyStreamingHours: { type: Number, default: 0 },
    lastVideoDate: Date,
    lastStreamDate: Date,
    lastActiveDate: Date,
  },

  // Performance Rating
  rating: {
    overall: { type: Number, default: 0, min: 0, max: 100 },
    consistency: { type: Number, default: 0, min: 0, max: 100 },
    engagement: { type: Number, default: 0, min: 0, max: 100 },
    quality: { type: Number, default: 0, min: 0, max: 100 },
  },

  // Schedule
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    startTime: String, // Format: "HH:MM"
    endTime: String,
    platform: String,
  }],

  // Platform-specific rules compliance
  rulesCompliance: {
    youtube: {
      requiredWeeklyVideos: { type: Number, default: 0 },
      requiredStreamingHours: { type: Number, default: 0 },
      currentWeeklyVideos: { type: Number, default: 0 },
      currentStreamingHours: { type: Number, default: 0 },
      lastCheckDate: Date,
    },
    twitch: {
      requiredWeeklyVideos: { type: Number, default: 0 },
      requiredStreamingHours: { type: Number, default: 0 },
      currentWeeklyVideos: { type: Number, default: 0 },
      currentStreamingHours: { type: Number, default: 0 },
      lastCheckDate: Date,
    },
    tiktok: {
      requiredWeeklyVideos: { type: Number, default: 0 },
      requiredStreamingHours: { type: Number, default: 0 },
      currentWeeklyVideos: { type: Number, default: 0 },
      currentStreamingHours: { type: Number, default: 0 },
      lastCheckDate: Date,
    },
    kick: {
      requiredWeeklyVideos: { type: Number, default: 0 },
      requiredStreamingHours: { type: Number, default: 0 },
      currentWeeklyVideos: { type: Number, default: 0 },
      currentStreamingHours: { type: Number, default: 0 },
      lastCheckDate: Date,
    },
    instagram: {
      requiredWeeklyVideos: { type: Number, default: 0 },
      requiredStreamingHours: { type: Number, default: 0 },
      currentWeeklyVideos: { type: Number, default: 0 },
      currentStreamingHours: { type: Number, default: 0 },
      lastCheckDate: Date,
    },
    facebook: {
      requiredWeeklyVideos: { type: Number, default: 0 },
      requiredStreamingHours: { type: Number, default: 0 },
      currentWeeklyVideos: { type: Number, default: 0 },
      currentStreamingHours: { type: Number, default: 0 },
      lastCheckDate: Date,
    },
  },

  // Achievements
  achievements: [{
    name: String,
    description: String,
    earnedDate: Date,
    reward: Number,
  }],

  // Language Preference
  language: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en',
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
streamerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
streamerSchema.index({ status: 1 });
streamerSchema.index({ 'credit.balance': -1 });
streamerSchema.index({ 'stats.lastActiveDate': 1 });

export default mongoose.model('Streamer', streamerSchema);
