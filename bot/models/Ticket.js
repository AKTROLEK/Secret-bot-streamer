import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  // Ticket Information
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  
  // User Information
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },

  // Ticket Type
  type: {
    type: String,
    enum: [
      'application',
      'issue',
      'credit_adjustment',
      'promotion_request',
      'technical_support',
      'general',
    ],
    required: true,
  },

  // Ticket Status
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed'],
    default: 'open',
  },

  // Subject and Description
  subject: {
    type: String,
    required: true,
  },
  description: String,

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },

  // Staff Assignment
  assignedTo: {
    userId: String,
    username: String,
    assignedAt: Date,
  },

  // Messages (for tracking ticket conversation)
  messages: [{
    userId: String,
    username: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isStaff: Boolean,
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  closedAt: Date,
  resolvedAt: Date,
});

// Update timestamp on save
ticketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
ticketSchema.index({ status: 1 });
ticketSchema.index({ userId: 1 });
ticketSchema.index({ type: 1 });
ticketSchema.index({ createdAt: -1 });

export default mongoose.model('Ticket', ticketSchema);
