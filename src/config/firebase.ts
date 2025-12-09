import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Call this once in app startup (e.g. in App.tsx)
export const configureFirebase = () => {
  // Web Client ID bisa ditemukan di:
  // 1. Firebase Console > Project Settings > General > Your apps > Web app > App ID
  // 2. Atau Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs > Web client
  // 3. Format: xxxxx-xxxxx.apps.googleusercontent.com
  // 
  // Jika belum punya Web app, buat dulu di Firebase Console:
  // - Klik "Add app" > Pilih "Web" platform
  // - Copy "App ID" yang muncul
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE.apps.googleusercontent.com',
  });
};

export { auth, storage, GoogleSignin };


