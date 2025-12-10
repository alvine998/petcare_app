import { Alert, ToastAndroid, Platform } from 'react-native';
import { auth, GoogleSignin } from '../config/firebase';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to save user session to AsyncStorage
const saveUserSession = async (user: any) => {
  try {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
    };
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.log('Error saving user session:', error);
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  profile?: { firstName?: string; lastName?: string },
) => {
  try {
    // Always create new user account
    // Firebase will automatically throw error if email already exists (auth/email-already-in-use)
    // This ensures we always create a new user, never reuse existing accounts
    const result = await auth().createUserWithEmailAndPassword(email, password);
    const user = result.user;
    
    console.log('New user created:', user.uid, user.email);

    // Save additional profile data to Firestore
    if (user && profile) {
      try {
        // Use Timestamp.now() directly instead of serverTimestamp() to avoid issues
        await firestore().collection('users').doc(user.uid).set(
          {
            email: user.email,
            firstName: profile.firstName ?? '',
            lastName: profile.lastName ?? '',
            createdAt: firestore.Timestamp.now(),
            updatedAt: firestore.Timestamp.now(),
          },
          { merge: true },
        );
        console.log('User data saved to Firestore successfully');
      } catch (firestoreError: any) {
        // Log error but don't block registration
        console.error('Firestore error saving user data:', firestoreError);
        // Registration still succeeds even if Firestore save fails
        // Data will be saved later when fcmToken is saved
      }
    }

    // Save user session to AsyncStorage after register
    await saveUserSession(user);

    return user;
  } catch (error: any) {
    console.log('signUpWithEmail error', error);
    Alert.alert('Register failed', error.message ?? 'Something went wrong');
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await auth().signInWithEmailAndPassword(email, password);
    const user = result.user;
    // Save user session to AsyncStorage
    await saveUserSession(user);
    return user;
  } catch (error: any) {
    console.log('signInWithEmail error', error);
    // Alert.alert('Login failed', error.message ?? 'Something went wrong');
    ToastAndroid.show(error.message ?? 'Something went wrong', ToastAndroid.LONG);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
    // Remove user session from AsyncStorage
    await AsyncStorage.removeItem('user');
  } catch (error: any) {
    console.log('signOut error', error);
    // Alert.alert('Logout failed', error.message ?? 'Something went wrong');
    ToastAndroid.show(error.message ?? 'Something went wrong', ToastAndroid.LONG);
  }
};

export const signInWithGoogle = async () => {
  try {
    // Check if Google Play Services is available (Android only)
    if (Platform.OS === 'android') {
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      } catch (playServicesError: any) {
        throw new Error('Google Play Services is required for Google Sign-In. Please install or update Google Play Services.');
      }
    }
    
    // Sign in with Google
    let signInResult;
    try {
      signInResult = await GoogleSignin.signIn();
    } catch (signInError: any) {
      console.error('GoogleSignin.signIn() error:', signInError);
      
      // Check for specific error codes
      if (signInError.code === '10' || signInError.message?.includes('DEVELOPER_ERROR') || signInError.message?.includes('Developer_error')) {
        throw new Error(
          'Developer Error: Please check:\n' +
          '1. SHA-1 key from your real device is added to Firebase Console\n' +
          '2. Package name matches in Firebase Console\n' +
          '3. OAuth consent screen is configured in Google Cloud Console\n' +
          '4. Web Client ID is correct in firebase.ts\n\n' +
          'To get SHA-1 from real device:\n' +
          'keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android'
        );
      }
      
      // Check for configuration errors
      if (signInError.message && (signInError.message.includes('configure') || signInError.message.includes('apiClient is null'))) {
        throw new Error('Google Sign-In is not configured. Please set webClientId in src/config/firebase.ts');
      }
      
      throw signInError;
    }
    
    if (!signInResult || !signInResult.idToken) {
      throw new Error('Failed to get ID token from Google Sign-In. Please check your configuration.');
    }
    
    const { idToken } = signInResult;
    
    // Create credential and sign in
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const result = await auth().signInWithCredential(googleCredential);
    const user = result.user;
    
    // Save user data to Firestore if needed
    if (user) {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
          // Create user document if it doesn't exist
          const displayName = user.displayName || '';
          const nameParts = displayName.split(' ');
          // Use Timestamp.now() directly instead of serverTimestamp() to avoid issues
          await firestore().collection('users').doc(user.uid).set(
            {
              email: user.email,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              createdAt: firestore.Timestamp.now(),
              updatedAt: firestore.Timestamp.now(),
            },
            { merge: true },
          );
          console.log('User data saved to Firestore successfully');
        } else {
          // Update existing document with latest email if changed
          const existingData = userDoc.data();
          if (existingData?.email !== user.email) {
            await firestore().collection('users').doc(user.uid).set(
              {
                email: user.email,
                updatedAt: firestore.Timestamp.now(),
              },
              { merge: true },
            );
          }
        }
      } catch (firestoreError: any) {
        // If Firestore fails, log but don't block sign-in
        console.error('Firestore error saving user data:', firestoreError);
        // Sign-in still succeeds even if Firestore save fails
        // Data will be saved later when fcmToken is saved
      }
    }
    
    // Save user session to AsyncStorage
    await saveUserSession(user);
    return user;
  } catch (error: any) {
    console.error('signInWithGoogle error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    let errorMessage = 'Google Sign-In failed. Please check your configuration.';
    
    // Handle specific error codes
    if (error.code === '10' || error.message?.includes('DEVELOPER_ERROR') || error.message?.includes('Developer_error')) {
      errorMessage = 
        'Developer Error: SHA-1 key dari device real belum terdaftar di Firebase Console.\n\n' +
        'Cara mendapatkan SHA-1:\n' +
        '1. cd android && ./gradlew signingReport\n' +
        '2. Copy SHA-1 dari output\n' +
        '3. Tambahkan di Firebase Console > Project Settings > Your apps > Android app > Add fingerprint\n\n' +
        'Lihat GOOGLE_SIGNIN_SETUP.md untuk detail lengkap.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    if (Platform.OS === 'android') {
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    } else {
      Alert.alert('Google Sign-In failed', errorMessage);
    }
    throw error;
  }
};


