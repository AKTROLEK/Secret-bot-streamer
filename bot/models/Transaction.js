import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // Transaction ID
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },

  // User Information
  userId: {
    type: String,
    required: true,
    index: true,
  },
  username: String,

  // Transaction Type
  type: {
    type: String,
    enum: [
      'earn_video',
      'earn_stream',
      'earn_weekly_goal',
      'earn_engagement',
      'earn_achievement',
      'spend_purchase',
      'spend_promotion',
      'admin_add',
      'admin_deduct',
      'transfer_send',
      'transfer_receive',
      'savings_deposit',
      'savings_withdraw',
    ],
    required: true,
  },

  // Amount
  amount: {
    type: Number,
    required: true,
  },

  // Balance After Transaction
  balanceAfter: Number,

  // Description
  description: String,

  // Related Information
  relatedTo: {
    type: {
      type: String,
      enum: ['video', 'stream', 'purchase', 'transfer', 'achievement', 'admin', 'other'],
    },
    id: String,
    details: mongoose.Schema.Types.Mixed,
  },

  // For transfers
  transferTo: {
    userId: String,
    username: String,
  },
  transferFrom: {
    userId: String,
    username: String,
  },

  // Admin action tracking
  adminAction: {
    adminId: String,
    adminUsername: String,
    reason: String,
  },

  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Indexes for performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });

export default mongoose.model('Transaction', transactionSchema);
