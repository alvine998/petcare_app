import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

export const requestNotificationPermissionAndSaveToken = async (
  userId?: string | null,
) => {
  // Request notification permissions (Android 13+ and iOS)
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    return null;
  }

  const token = await messaging().getToken();

  if (userId) {
    await firestore()
      .collection('users')
      .doc(userId)
      .set({ fcmToken: token }, { merge: true });
  }

  return token;
};


