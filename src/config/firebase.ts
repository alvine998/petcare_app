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
  
  // Always configure GoogleSignin, even if webClientId is placeholder
  // This prevents "apiClient is null" error
  try {
    if (webClientId && !webClientId.includes('391388815238-k7tl38g3ed9gtcbad8m7dj9r6jtqn0c9.apps.googleusercontent.com')) {
      GoogleSignin.configure({
        webClientId: webClientId,
      });
      console.log('Google Sign-In configured successfully');
    } else {
      // Configure with a placeholder to prevent null error, but it won't work for actual sign-in
      GoogleSignin.configure({
        webClientId: '391388815238-k7tl38g3ed9gtcbad8m7dj9r6jtqn0c9.apps.googleusercontent.com',
      });
      console.warn('⚠️ Google Sign-In is using placeholder webClientId. Please set your actual Web Client ID in src/config/firebase.ts');
      console.warn('   Google Sign-In will not work until you configure the correct webClientId');
    }
  } catch (error) {
    console.error('Error configuring Google Sign-In:', error);
  }
};

export { auth, storage, GoogleSignin };


