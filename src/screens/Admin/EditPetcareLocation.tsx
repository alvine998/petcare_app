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
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../../config/firebase';

export default function EditPetcareLocation({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const locationId = route?.params?.locationId;
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [schedule, setSchedule] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const currentUser = auth().currentUser;
  const isAdmin = currentUser?.email === 'admin@petcare.com';

  const loadLocation = useCallback(async () => {
    if (!locationId) {
      Alert.alert('Error', 'Location ID is required');
      navigation.goBack();
      return;
    }

    try {
      setLoadingData(true);
      const locationDoc = await firestore()
        .collection('locations')
        .doc(locationId)
        .get();

      if (locationDoc.exists) {
        const data = locationDoc.data();
        setName(data?.name || '');
        setAddress(data?.address || '');
        setLat(data?.lat?.toString() || '');
        setLong(data?.long?.toString() || '');
        setSchedule(data?.schedule || '');
        setPhone(data?.phone || '');
        setEmail(data?.email || '');
        setWebsite(data?.website || '');
      } else {
        Alert.alert('Error', 'Location not found');
        navigation.goBack();
      }
    } catch (error: any) {
      console.log('Error loading location:', error);
      Alert.alert('Error', 'Failed to load location data');
      navigation.goBack();
    } finally {
      setLoadingData(false);
    }
  }, [locationId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadLocation();
    }, [loadLocation]),
  );

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

  const handleUpdate = async () => {
    // Validation
    if (!name || !address || !lat || !long) {
      Alert.alert(
        'Error',
        'Please fill all required fields (Name, Address, Latitude, Longitude)',
      );
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
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Add optional fields if provided
      if (schedule.trim()) {
        locationData.schedule = schedule.trim();
      } else {
        locationData.schedule = firestore.FieldValue.delete();
      }
      if (phone.trim()) {
        locationData.phone = phone.trim();
      } else {
        locationData.phone = firestore.FieldValue.delete();
      }
      if (email.trim()) {
        locationData.email = email.trim();
      } else {
        locationData.email = firestore.FieldValue.delete();
      }
      if (website.trim()) {
        locationData.website = website.trim();
      } else {
        locationData.website = firestore.FieldValue.delete();
      }

      await firestore()
        .collection('locations')
        .doc(locationId)
        .update(locationData);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Location updated successfully!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Location updated successfully!');
      }

      // Navigate back
      navigation.goBack();
    } catch (error: any) {
      console.log('Error updating location:', error);
      Alert.alert('Error', error.message || 'Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Location',
      'Are you sure you want to delete this location? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await firestore()
                .collection('locations')
                .doc(locationId)
                .delete();

              if (Platform.OS === 'android') {
                ToastAndroid.show(
                  'Location deleted successfully!',
                  ToastAndroid.SHORT,
                );
              } else {
                Alert.alert('Success', 'Location deleted successfully!');
              }

              navigation.goBack();
            } catch (error: any) {
              console.log('Error deleting location:', error);
              Alert.alert('Error', error.message || 'Failed to delete location');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loadingData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.primary,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.blue1} />
        <Text
          style={{
            marginTop: normalize(20),
            fontSize: normalize(16),
            color: COLORS.gray,
          }}
        >
          Loading location data...
        </Text>
      </View>
    );
  }

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
          justifyContent: 'space-between',
          marginBottom: normalize(30),
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
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
            Edit Location
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleDelete}
          style={{
            backgroundColor: COLORS.danger,
            paddingVertical: normalize(10),
            paddingHorizontal: normalize(15),
            borderRadius: normalize(8),
            marginLeft: normalize(10),
          }}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: normalize(14),
              fontWeight: '600',
            }}
          >
            Delete
          </Text>
        </TouchableOpacity>
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
            onPress={handleUpdate}
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
                UPDATE LOCATION
              </Text>
            )}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
