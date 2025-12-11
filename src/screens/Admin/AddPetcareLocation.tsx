import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ToastAndroid,
} from 'react-native';
import React, { useState } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../../config/firebase';

export default function AddPetcareLocation({
  navigation,
}: {
  navigation: any;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [schedule, setSchedule] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);

  const currentUser = auth().currentUser;
  const isAdmin = currentUser?.email === 'admin@petcare.com';

  if (!isAdmin) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.primary,
          padding: normalize(20),
        }}
      >
        <Text
          style={{
            fontSize: normalize(18),
            color: COLORS.danger,
            textAlign: 'center',
          }}
        >
          Access Denied
        </Text>
        <Text
          style={{
            fontSize: normalize(14),
            color: COLORS.gray,
            textAlign: 'center',
            marginTop: normalize(10),
          }}
        >
          You don't have permission to access this page
        </Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    // Validation
    if (!name || !address || !lat || !long) {
      Alert.alert('Error', 'Please fill all required fields (Name, Address, Latitude, Longitude)');
      return;
    }

    const latNum = parseFloat(lat);
    const longNum = parseFloat(long);

    if (isNaN(latNum) || isNaN(longNum)) {
      Alert.alert('Error', 'Latitude and Longitude must be valid numbers');
      return;
    }

    if (latNum < -90 || latNum > 90) {
      Alert.alert('Error', 'Latitude must be between -90 and 90');
      return;
    }

    if (longNum < -180 || longNum > 180) {
      Alert.alert('Error', 'Longitude must be between -180 and 180');
      return;
    }

    setLoading(true);
    try {
      const locationData: any = {
        name: name.trim(),
        address: address.trim(),
        lat: latNum,
        long: longNum,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Add optional fields if provided
      if (schedule.trim()) {
        locationData.schedule = schedule.trim();
      }
      if (phone.trim()) {
        locationData.phone = phone.trim();
      }
      if (email.trim()) {
        locationData.email = email.trim();
      }
      if (website.trim()) {
        locationData.website = website.trim();
      }

      await firestore().collection('locations').add(locationData);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Location added successfully!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Location added successfully!');
      }

      // Navigate back
      navigation.goBack();
    } catch (error: any) {
      console.log('Error adding location:', error);
      Alert.alert('Error', error.message || 'Failed to add location');
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: normalize(30),
        }}
      >
        <BackButton onPress={() => navigation.goBack()} />
        <Text
          style={{
            fontSize: normalize(24),
            fontWeight: '600',
            color: COLORS.black,
            marginLeft: normalize(15),
          }}
        >
          Add Petcare Location
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: normalize(50) }}
      >
        <View style={{ gap: normalize(20) }}>
          <Input
            label="Location Name *"
            placeholder="Enter location name"
            value={name}
            onChangeText={setName}
            style={{ backgroundColor: COLORS.secondary }}
          />

          <Input
            label="Address *"
            placeholder="Enter full address"
            value={address}
            onChangeText={setAddress}
            style={{ backgroundColor: COLORS.secondary }}
            multiline
            numberOfLines={3}
          />

          <View
            style={{
              flexDirection: 'row',
              gap: normalize(10),
            }}
          >
            <View style={{ flex: 1 }}>
              <Input
                label="Latitude *"
                placeholder="e.g., -6.2088"
                value={lat}
                onChangeText={setLat}
                keyboardType="numeric"
                style={{ backgroundColor: COLORS.secondary }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Longitude *"
                placeholder="e.g., 106.8456"
                value={long}
                onChangeText={setLong}
                keyboardType="numeric"
                style={{ backgroundColor: COLORS.secondary }}
              />
            </View>
          </View>

          <Input
            label="Schedule"
            placeholder="e.g., Mon-Fri: 9AM-6PM"
            value={schedule}
            onChangeText={setSchedule}
            style={{ backgroundColor: COLORS.secondary }}
          />

          <Input
            label="Phone"
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{ backgroundColor: COLORS.secondary }}
          />

          <Input
            label="Email"
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ backgroundColor: COLORS.secondary }}
          />

          <Input
            label="Website"
            placeholder="Enter website URL"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
            autoCapitalize="none"
            style={{ backgroundColor: COLORS.secondary }}
          />

          <Button
            variant="success"
            style={{
              width: '100%',
              height: normalize(50),
              marginTop: normalize(20),
            }}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: normalize(16),
                  fontWeight: 'bold',
                }}
              >
                ADD LOCATION
              </Text>
            )}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
