const mongoose = require('mongoose');

const appUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    default: 'user'
  },
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    deviceId: String
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' }
  },
  metadata: {
    appVersion: String,
    lastSyncAt: Date,
    totalDataSynced: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for refresh tokens
appUserSchema.index({ 'refreshTokens.token': 1 });
appUserSchema.index({ 'refreshTokens.expiresAt': 1 }, { expireAfterSeconds: 0 });

// Clean expired refresh tokens before save
appUserSchema.pre('save', function(next) {
  if (this.refreshTokens && this.refreshTokens.length > 0) {
    this.refreshTokens = this.refreshTokens.filter(rt => 
      new Date(rt.expiresAt) > new Date()
    );
  }
  next();
});

// Instance methods
appUserSchema.methods.addRefreshToken = function(token, deviceId, expiresIn = 7 * 24 * 60 * 60 * 1000) {
  const expiresAt = new Date(Date.now() + expiresIn);
  this.refreshTokens.push({ token, deviceId, expiresAt });
  
  // Keep only last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
};

appUserSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
};

appUserSchema.methods.removeAllRefreshTokens = function() {
  this.refreshTokens = [];
};

appUserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
};

module.exports = mongoose.model('AppUser', appUserSchema);
