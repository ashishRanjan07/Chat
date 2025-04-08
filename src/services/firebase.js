import {AppRegistry} from 'react-native';
import {name as appName} from '../../app.json';
import messaging from '@react-native-firebase/messaging';

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase config (optional if using google-services.json/GoogleService-Info.plist)
};

// Request user permission for notifications (iOS specific)
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

// Register background handler (must be outside component/hook)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }
  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);

export {messaging};
