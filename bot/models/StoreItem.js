import mongoose from 'mongoose';

const storeItemSchema = new mongoose.Schema({
  // Item Information
  itemId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  nameAr: String, // Arabic translation
  description: {
    type: String,
    required: true,
  },
  descriptionAr: String, // Arabic translation

  // Category
  category: {
    type: String,
    enum: [
      'rank_upgrade',
      'video_promotion',
      'editing_service',
      'design_service',
      'gift_card',
      'physical_reward',
      'streaming_tool',
      'coaching_session',
      'custom',
    ],
    required: true,
  },

  // Pricing
  creditCost: {
    type: Number,
    required: true,
    min: 0,
  },

  // Availability
  available: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    default: -1, // -1 means unlimited
  },

  // Requirements
  requirements: {
    minRating: Number,
    minVideos: Number,
    minStreamingHours: Number,
    requiredAchievements: [String],
  },

  // Image/Icon
  imageUrl: String,
  iconEmoji: String,

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
storeItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
storeItemSchema.index({ category: 1 });
storeItemSchema.index({ available: 1 });
storeItemSchema.index({ creditCost: 1 });

export default mongoose.model('StoreItem', storeItemSchema);
