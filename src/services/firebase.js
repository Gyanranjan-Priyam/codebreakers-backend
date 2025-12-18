const admin = require('firebase-admin');
const logger = require('../utils/logger');

let firebaseInitialized = false;

// Initialize Firebase Admin SDK
exports.init = () => {
  try {
    if (firebaseInitialized) {
      logger.info('Firebase already initialized');
      return;
    }

    // Check if credentials are provided
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountPath && !serviceAccountKey) {
      logger.warn('Firebase credentials not provided. Push notifications will be disabled.');
      return;
    }

    let credential;

    if (serviceAccountKey) {
      // Parse JSON from environment variable
      const serviceAccount = JSON.parse(serviceAccountKey);
      credential = admin.credential.cert(serviceAccount);
    } else {
      // Load from file path
      credential = admin.credential.cert(require(serviceAccountPath));
    }

    admin.initializeApp({
      credential: credential
    });

    firebaseInitialized = true;
    logger.info('Firebase initialized successfully');
  } catch (error) {
    logger.error('Firebase initialization error:', error);
    logger.warn('Push notifications will be disabled');
  }
};

// Send notification to a single device
exports.sendToDevice = async (fcmToken, notification, data = {}) => {
  if (!firebaseInitialized) {
    logger.warn('Firebase not initialized, skipping notification');
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl })
      },
      data: data,
      token: fcmToken,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    logger.info(`Notification sent successfully: ${response}`);
    return { success: true, messageId: response };
  } catch (error) {
    logger.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to multiple devices
exports.sendToDevices = async (fcmTokens, notification, data = {}) => {
  if (!firebaseInitialized) {
    logger.warn('Firebase not initialized, skipping notification');
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl })
      },
      data: data,
      tokens: fcmTokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    logger.info(`Sent ${response.successCount} notifications, ${response.failureCount} failed`);
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    logger.error('Error sending batch notifications:', error);
    return { success: false, error: error.message };
  }
};

// Send to topic
exports.sendToTopic = async (topic, notification, data = {}) => {
  if (!firebaseInitialized) {
    logger.warn('Firebase not initialized, skipping notification');
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { imageUrl: notification.imageUrl })
      },
      data: data,
      topic: topic,
      android: {
        priority: 'high'
      }
    };

    const response = await admin.messaging().send(message);
    logger.info(`Topic notification sent: ${response}`);
    return { success: true, messageId: response };
  } catch (error) {
    logger.error('Error sending topic notification:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe devices to topic
exports.subscribeToTopic = async (fcmTokens, topic) => {
  if (!firebaseInitialized) {
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const response = await admin.messaging().subscribeToTopic(fcmTokens, topic);
    logger.info(`Subscribed ${response.successCount} devices to topic ${topic}`);
    return { success: true, successCount: response.successCount };
  } catch (error) {
    logger.error('Error subscribing to topic:', error);
    return { success: false, error: error.message };
  }
};

// Unsubscribe devices from topic
exports.unsubscribeFromTopic = async (fcmTokens, topic) => {
  if (!firebaseInitialized) {
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const response = await admin.messaging().unsubscribeFromTopic(fcmTokens, topic);
    logger.info(`Unsubscribed ${response.successCount} devices from topic ${topic}`);
    return { success: true, successCount: response.successCount };
  } catch (error) {
    logger.error('Error unsubscribing from topic:', error);
    return { success: false, error: error.message };
  }
};

exports.isInitialized = () => firebaseInitialized;
