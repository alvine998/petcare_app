import { Image, View } from 'react-native';
import React, { useEffect } from 'react';
import { COLORS } from '../../config/color';
import normalize from 'react-native-normalize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../config/firebase';

export default function Splash({ navigation }: { navigation: any }) {
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      try {
        // If user is logged in, ensure session is saved in AsyncStorage
        if (user) {
          const storedUser = await AsyncStorage.getItem('user');
          if (!storedUser) {
            // If not in AsyncStorage, save now
            const userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
            };
            await AsyncStorage.setItem('user', JSON.stringify(userData));
          }
        }

        const hasOnboarded = await AsyncStorage.getItem(
          'hasOnboardedPermissions',
        );

        const targetScreen = user
          ? hasOnboarded === 'true'
            ? 'MainTabs'
            : 'EnableLocation'
          : 'Welcome1';

        setTimeout(() => {
          navigation.replace(targetScreen);
        }, 1000);
      } catch (e) {
        // If there's an error, fallback to Welcome1
    setTimeout(() => {
          navigation.replace('Welcome1');
    }, 1000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
      }}
    >
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: normalize(250), height: normalize(270) }}
      />
    </View>
  );
}
