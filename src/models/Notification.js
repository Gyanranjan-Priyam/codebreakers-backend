const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['announcement', 'quiz', 'task', 'event', 'system', 'message', 'achievement'],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  data: {
    type: Map,
    of: String
  },
  imageUrl: String,
  actionUrl: String,
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: Date,
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  fcmMessageId: String,
  error: String,
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
};

// Mark as sent
notificationSchema.methods.markAsSent = function(messageId = null) {
  this.isSent = true;
  this.sentAt = new Date();
  this.deliveryStatus = 'sent';
  if (messageId) {
    this.fcmMessageId = messageId;
  }
};

// Mark as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.deliveryStatus = 'delivered';
};

// Mark as failed
notificationSchema.methods.markAsFailed = function(error) {
  this.deliveryStatus = 'failed';
  this.error = error;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

// Set expiry (30 days by default)
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
