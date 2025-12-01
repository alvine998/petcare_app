import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Call this once in app startup (e.g. in App.tsx)
export const configureFirebase = () => {
  // TODO: replace with your own reversed client id from GoogleServices-Info.plist / google-services.json
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE.apps.googleusercontent.com',
  });
};

export { auth, GoogleSignin };


