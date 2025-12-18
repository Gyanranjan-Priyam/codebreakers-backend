const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: true
  },
  fcmToken: {
    type: String,
    sparse: true
  },
  deviceInfo: {
    model: String,
    manufacturer: String,
    osVersion: String,
    appVersion: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  subscribedTopics: [{
    type: String
  }],
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Composite index for userId + deviceId
deviceSchema.index({ userId: 1, deviceId: 1 });

// Index for FCM token lookup
deviceSchema.index({ fcmToken: 1 }, { sparse: true });

// Update last active timestamp
deviceSchema.methods.updateLastActive = function() {
  this.lastActiveAt = new Date();
};

// Subscribe to topic
deviceSchema.methods.subscribeToTopic = function(topic) {
  if (!this.subscribedTopics.includes(topic)) {
    this.subscribedTopics.push(topic);
  }
};

// Unsubscribe from topic
deviceSchema.methods.unsubscribeFromTopic = function(topic) {
  this.subscribedTopics = this.subscribedTopics.filter(t => t !== topic);
};

module.exports = mongoose.model('Device', deviceSchema);
