import {useEffect, useState} from 'react';
import NotificationService from '../services/notificationService';

function useFcmToken() {
  const [fcmToken, setFcmToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribeOnMessage;
    let unsubscribeOnNotificationOpened;

    const setupFcm = async () => {
      try {
        // Get initial notification if app was opened from quit state
        await NotificationService.getInitialNotification();

        // Get FCM token
        const token = await NotificationService.getFcmToken();
        console.log(token,"line 20")
        setFcmToken(token);

        // Set up foreground message handler
        unsubscribeOnMessage = NotificationService.onForegroundNotification(
          message => {
            // Handle foreground notifications
            console.log('Foreground notification received:', message);
          },
        );

        // Set up notification opened handler (app in background)
        unsubscribeOnNotificationOpened =
          NotificationService.onNotificationOpened(message => {
            // Handle notification opened
            console.log('Notification opened:', message);
          });
      } catch (err) {
        console.error('FCM setup error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    setupFcm();

    return () => {
      // Clean up subscriptions
      if (unsubscribeOnMessage) unsubscribeOnMessage();
      if (unsubscribeOnNotificationOpened) unsubscribeOnNotificationOpened();
    };
  }, []);

  return {fcmToken, loading, error};
}

export default useFcmToken;
