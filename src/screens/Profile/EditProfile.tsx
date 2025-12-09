import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ToastAndroid,
  Alert,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../config/firebase';
import firestore from '@react-native-firebase/firestore';

export default function EditProfile({ navigation }: { navigation: any }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load dari AsyncStorage
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setEmail(userData.email || '');
        setPhotoURL(userData.photoURL || '');

        // Load additional data dari Firestore jika ada
        const currentUser = auth().currentUser;
        if (currentUser) {
          const userDoc = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .get();

          if (userDoc.exists) {
            const firestoreData = userDoc.data();
            setFirstName(firestoreData?.firstName || '');
            setLastName(firestoreData?.lastName || '');
          } else {
            // Jika tidak ada di Firestore, coba split dari displayName
            const displayName = userData.displayName || '';
            const nameParts = displayName.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
          }
        }
      }
    } catch (error) {
      console.log('Error loading user data:', error);
      ToastAndroid.show('Failed to load profile data', ToastAndroid.SHORT);
    }
  };

  const handleSave = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User not found');
        setLoading(false);
        return;
      }

      // Update di Firestore
      await firestore().collection('users').doc(currentUser.uid).set(
        {
          email: email,
          firstName: firstName,
          lastName: lastName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      // Update display name di Firebase Auth
      await currentUser.updateProfile({
        displayName: `${firstName} ${lastName}`.trim(),
      });

      // Update di AsyncStorage
      const userData = {
        uid: currentUser.uid,
        email: email,
        displayName: `${firstName} ${lastName}`.trim(),
        photoURL: photoURL || currentUser.photoURL || '',
      };
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      ToastAndroid.show('Profile updated successfully', ToastAndroid.SHORT);
      navigation.goBack();
    } catch (error: any) {
      console.log('Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = () => {
    // TODO: Implement image picker
    Alert.alert('Info', 'Photo upload feature will be available soon');
  };

  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
        padding: normalize(20),
      }}
    >
      <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginTop: normalize(30) }}>
          <Text
            style={{
              fontSize: normalize(30),
              fontWeight: '400',
              color: COLORS.black,
              textAlign: 'center',
            }}
          >
            Edit Profile
          </Text>

          {/* Photo Section */}
          <View style={{ marginTop: normalize(30), alignItems: 'center' }}>
            <TouchableOpacity
              onPress={handleChangePhoto}
              style={{
                width: normalize(120),
                height: normalize(120),
                borderRadius: normalize(60),
                backgroundColor: COLORS.warning,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: COLORS.white,
                elevation: 5,
              }}
            >
              {photoURL ? (
                <Image
                  source={{ uri: photoURL }}
                  style={{
                    width: normalize(120),
                    height: normalize(120),
                    borderRadius: normalize(60),
                  }}
                />
              ) : (
                <Image
                  source={require('../../assets/icons/woman-icon.png')}
                  style={{
                    width: normalize(60),
                    height: normalize(60),
                  }}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleChangePhoto}
              style={{ marginTop: normalize(10) }}
            >
              <Text
                style={{
                  color: COLORS.blue1,
                  fontSize: normalize(14),
                  fontWeight: '500',
                }}
              >
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View
            style={{
              width: '100%',
              paddingHorizontal: normalize(20),
              marginTop: normalize(30),
            }}
          >
            <Input
              label=""
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={{ backgroundColor: COLORS.secondary }}
            />
            <Input
              label=""
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={{ backgroundColor: COLORS.secondary }}
            />
            <Input
              label=""
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ backgroundColor: COLORS.secondary }}
            />

            <Button
              variant="success"
              style={{
                width: '100%',
                height: normalize(50),
                marginTop: normalize(30),
                borderWidth: 1,
                borderColor: COLORS.black,
                elevation: 2,
              }}
              onPress={handleSave}
              disabled={loading}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: normalize(16),
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Saving...' : 'SAVE CHANGES'}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

