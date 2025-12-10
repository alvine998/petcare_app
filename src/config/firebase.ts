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
  //
  // PENTING: Ganti 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE.apps.googleusercontent.com' dengan Web Client ID Anda
  // Jika tidak diisi dengan benar, Google Sign-In akan gagal dengan error "Developer Error" atau "apiClient is null"
  const webClientId = '391388815238-k7tl38g3ed9gtcbad8m7dj9r6jtqn0c9.apps.googleusercontent.com';
  
  // Always configure GoogleSignin
  // This prevents "apiClient is null" error
  try {
    GoogleSignin.configure({
      webClientId: webClientId,
    });
    console.log('Google Sign-In configured with webClientId:', webClientId);
  } catch (error) {
    console.error('Error configuring Google Sign-In:', error);
  }
};

export { auth, storage, GoogleSignin };


