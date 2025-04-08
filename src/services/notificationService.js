import messaging from '@react-native-firebase/messaging';

class NotificationService {
  // Get FCM token
  async getFcmToken() {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token', error);
      return null;
    }
  }

  // Check for initial notification when app is opened from quit state
  async getInitialNotification() {
    try {
      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage) {
        console.log('Notification caused app to open:', remoteMessage);
        return remoteMessage;
      }
      return null;
    } catch (error) {
      console.error('Failed to get initial notification', error);
      return null;
    }
  }

  // Subscribe to foreground notifications
  onForegroundNotification(callback) {
    return messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification:', remoteMessage);
      callback(remoteMessage);
    });
  }

  // Subscribe to notification opened events (app in background)
  onNotificationOpened(callback) {
    return messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened:', remoteMessage);
      callback(remoteMessage);
    });
  }

  // Delete FCM token (for logout scenarios)
  async deleteToken() {
    try {
      await messaging().deleteToken();
      console.log('FCM token deleted');
    } catch (error) {
      console.error('Failed to delete FCM token', error);
    }
  }
}

export default new NotificationService();
