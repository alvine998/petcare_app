import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../config/firebase';

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
    try {
      // Get current user to ensure we have user data
      const currentUser = auth().currentUser;
      
      if (currentUser && currentUser.uid === userId) {
        // Check if user document exists
        const userDoc = await firestore().collection('users').doc(userId).get();
        
        // Prepare user data
        const userData: any = {
          fcmToken: token,
        };
        
        // If user document doesn't exist or is missing data, add/update user info
        if (!userDoc.exists || !userDoc.data()?.email) {
          const displayName = currentUser.displayName || '';
          const nameParts = displayName.split(' ');
          
          userData.email = currentUser.email || '';
          userData.firstName = userDoc.data()?.firstName || nameParts[0] || '';
          userData.lastName = userDoc.data()?.lastName || nameParts.slice(1).join(' ') || '';
          
          // Only add createdAt if document doesn't exist
          if (!userDoc.exists) {
            userData.createdAt = firestore.Timestamp.now();
          }
          
          // Add updatedAt
          userData.updatedAt = firestore.Timestamp.now();
        } else {
          // Document exists, just update fcmToken and updatedAt
          userData.updatedAt = firestore.Timestamp.now();
        }
        
        // Save with merge to preserve existing data
        await firestore()
          .collection('users')
          .doc(userId)
          .set(userData, { merge: true });
      } else {
        // If userId doesn't match current user, just save fcmToken
        await firestore()
          .collection('users')
          .doc(userId)
          .set({ fcmToken: token }, { merge: true });
      }
    } catch (error) {
      console.log('Error saving FCM token:', error);
      // Don't throw, just log - notification token is not critical
    }
  }

  return token;
};


