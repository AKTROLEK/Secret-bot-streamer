import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  // Purchase Information
  purchaseId: {
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

  // Item Information
  itemId: {
    type: String,
    required: true,
  },
  itemName: String,
  itemCategory: String,

  // Cost
  creditCost: {
    type: Number,
    required: true,
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending',
  },

  // Delivery Information
  deliveryDetails: mongoose.Schema.Types.Mixed,
  deliveredAt: Date,

  // Transaction Reference
  transactionId: String,

  // Notes
  userNotes: String,
  adminNotes: String,

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
purchaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
purchaseSchema.index({ userId: 1, createdAt: -1 });
purchaseSchema.index({ status: 1 });

export default mongoose.model('Purchase', purchaseSchema);
