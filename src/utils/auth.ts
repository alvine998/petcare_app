import { Alert, ToastAndroid } from 'react-native';
import { auth, GoogleSignin } from '../config/firebase';
import firestore from '@react-native-firebase/firestore';

export const signUpWithEmail = async (
  email: string,
  password: string,
  profile?: { firstName?: string; lastName?: string },
) => {
  try {
    const result = await auth().createUserWithEmailAndPassword(email, password);
    const user = result.user;

    // Optional: save additional profile data to Firestore
    if (user && profile) {
      await firestore().collection('users').doc(user.uid).set(
        {
          email: user.email,
          firstName: profile.firstName ?? '',
          lastName: profile.lastName ?? '',
          createdAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

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
    return result.user;
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
  } catch (error: any) {
    console.log('signOut error', error);
    // Alert.alert('Logout failed', error.message ?? 'Something went wrong');
    ToastAndroid.show(error.message ?? 'Something went wrong', ToastAndroid.LONG);
  }
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const result = await auth().signInWithCredential(googleCredential);
    return result.user;
  } catch (error: any) {
    console.log('signInWithGoogle error', error);
    // Alert.alert('Google Sign-In failed', error.message ?? 'Something went wrong');
    ToastAndroid.show(error.message ?? 'Something went wrong', ToastAndroid.LONG);
    throw error;
  }
};


