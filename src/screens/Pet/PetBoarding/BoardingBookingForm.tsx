import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../../config/color';
import BackButton from '../../../components/BackButton';
import BottomTabsBar from '../../../components/BottomTabsBar';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../../../config/firebase';

export default function BoardingBookingForm({ navigation, route }: { navigation: any; route: any }) {
  const { petId, roomId, roomType, petType, price } = route?.params || {};
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date>(new Date(Date.now() + 86400000)); // Tomorrow
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [showPetTypeModal, setShowPetTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (petId) {
      loadPetData();
    }
    // Set pet type from route params
    if (petType) {
      setPetSpecies(petType === 'Cat' ? 'Cat' : 'Dog');
    }
  }, [petId, petType]);

  const loadPetData = async () => {
    try {
      const petDoc = await firestore().collection('pets').doc(petId).get();
      if (petDoc.exists()) {
        const petData = petDoc.data();
        setPetName(petData?.name || '');
        setPetSpecies(petData?.species === 'cat' ? 'Cat' : 'Dog');
      }
    } catch (error: any) {
      console.log('Error loading pet data:', error);
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const monthNames = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleCheckInDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowCheckInPicker(false);
      if (event.type === 'set' && date) {
        setCheckInDate(date);
        // Auto-set checkout date to at least 1 day after check-in
        const minCheckOut = new Date(date);
        minCheckOut.setDate(minCheckOut.getDate() + 1);
        if (checkOutDate <= date) {
          setCheckOutDate(minCheckOut);
        }
      }
    } else {
      if (date) {
        setCheckInDate(date);
        const minCheckOut = new Date(date);
        minCheckOut.setDate(minCheckOut.getDate() + 1);
        if (checkOutDate <= date) {
          setCheckOutDate(minCheckOut);
        }
      }
    }
  };

  const handleCheckOutDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowCheckOutPicker(false);
      if (event.type === 'set' && date) {
        if (date > checkInDate) {
          setCheckOutDate(date);
        } else {
          Alert.alert('Error', 'Check-out date must be after check-in date');
        }
      }
    } else {
      if (date) {
        if (date > checkInDate) {
          setCheckOutDate(date);
        } else {
          Alert.alert('Error', 'Check-out date must be after check-in date');
        }
      }
    }
  };

  const handlePetTypeSelect = (type: string) => {
    setPetSpecies(type);
    setShowPetTypeModal(false);
  };

  const calculateTotalDays = () => {
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const calculateTotalPrice = () => {
    const days = calculateTotalDays();
    return price * days;
  };

  const handleSubmit = async () => {
    if (!petName || !petSpecies) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (checkOutDate <= checkInDate) {
      Alert.alert('Error', 'Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must login first');
        setLoading(false);
        return;
      }

      const totalDays = calculateTotalDays();
      const totalPrice = calculateTotalPrice();

      // Save boarding booking to Firestore
      const bookingData = {
        userId: currentUser.uid,
        petId: petId,
        roomId: roomId,
        roomType: roomType,
        petType: petSpecies,
        petName: petName,
        checkInDate: firestore.Timestamp.fromDate(checkInDate),
        checkOutDate: firestore.Timestamp.fromDate(checkOutDate),
        totalDays: totalDays,
        pricePerDay: price,
        totalPrice: totalPrice,
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('boardingBookings').add(bookingData);

      // Navigate to payment screen
      navigation.navigate('BoardingPayment', {
        petId: petId,
        roomId: roomId,
        bookingData: {
          ...bookingData,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
        },
      });
    } catch (error: any) {
      console.log('Error submitting form:', error);
      Alert.alert('Error', error.message || 'Failed to submit form');
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
            fontSize: normalize(20),
            fontWeight: '600',
            color: COLORS.black,
            marginLeft: normalize(15),
          }}
        >
          {roomType} {petType} Booking Form
        </Text>
      </View>

      {/* Form */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: normalize(100) }}
      >
        {/* Pet Name */}
        <View style={{ marginBottom: normalize(20) }}>
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: normalize(8),
            }}
          >
            Pet Name
          </Text>
          <Input
            value={petName}
            onChangeText={setPetName}
            placeholder="Enter pet name"
            editable={false}
            style={{
              backgroundColor: COLORS.secondary,
            }}
          />
        </View>

        {/* Pet Type */}
        <View style={{ marginBottom: normalize(20) }}>
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: normalize(8),
            }}
          >
            Pet Type
          </Text>
          <TouchableOpacity
            onPress={() => setShowPetTypeModal(true)}
            style={{
              backgroundColor: COLORS.white,
              borderRadius: normalize(10),
              padding: normalize(15),
              borderWidth: 1,
              borderColor: COLORS.gray,
            }}
          >
            <Text
              style={{
                fontSize: normalize(16),
                color: petSpecies ? COLORS.black : COLORS.gray,
              }}
            >
              {petSpecies || 'Select Pet Type'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Check-in Date */}
        <View style={{ marginBottom: normalize(20) }}>
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: normalize(8),
            }}
          >
            Check-in Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowCheckInPicker(true)}
            style={{
              backgroundColor: COLORS.white,
              borderRadius: normalize(10),
              padding: normalize(15),
              borderWidth: 1,
              borderColor: COLORS.gray,
            }}
          >
            <Text
              style={{
                fontSize: normalize(16),
                color: COLORS.black,
              }}
            >
              {formatDate(checkInDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Check-out Date */}
        <View style={{ marginBottom: normalize(20) }}>
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: normalize(8),
            }}
          >
            Check-out Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowCheckOutPicker(true)}
            style={{
              backgroundColor: COLORS.white,
              borderRadius: normalize(10),
              padding: normalize(15),
              borderWidth: 1,
              borderColor: COLORS.gray,
            }}
          >
            <Text
              style={{
                fontSize: normalize(16),
                color: COLORS.black,
              }}
            >
              {formatDate(checkOutDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Days & Price Summary */}
        <View
          style={{
            backgroundColor: COLORS.info,
            borderRadius: normalize(10),
            padding: normalize(15),
            marginBottom: normalize(20),
          }}
        >
          <Text
            style={{
              fontSize: normalize(14),
              fontWeight: '600',
              color: COLORS.black,
              marginBottom: normalize(5),
            }}
          >
            Booking Summary
          </Text>
          <Text
            style={{
              fontSize: normalize(12),
              color: COLORS.gray,
            }}
          >
            Total Days: {calculateTotalDays()} day(s)
          </Text>
          <Text
            style={{
              fontSize: normalize(12),
              color: COLORS.gray,
            }}
          >
            Price per Day: Rp {price.toLocaleString('id-ID')},-
          </Text>
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '700',
              color: COLORS.black,
              marginTop: normalize(5),
            }}
          >
            Total: Rp {calculateTotalPrice().toLocaleString('id-ID')},-
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          variant="success"
          style={{
            width: '100%',
            height: normalize(50),
            marginTop: normalize(10),
          }}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: normalize(16),
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </Text>
        </Button>
      </ScrollView>

      {/* Pet Type Modal */}
      <Modal
        visible={showPetTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPetTypeModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: normalize(20),
              borderTopRightRadius: normalize(20),
              padding: normalize(20),
            }}
          >
            <Text
              style={{
                fontSize: normalize(18),
                fontWeight: '600',
                color: COLORS.black,
                marginBottom: normalize(20),
              }}
            >
              Select Pet Type
            </Text>
            {['Cat', 'Dog'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => handlePetTypeSelect(type)}
                style={{
                  padding: normalize(15),
                  backgroundColor: petSpecies === type ? COLORS.blue1 : COLORS.secondary,
                  borderRadius: normalize(10),
                  marginBottom: normalize(10),
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '500',
                    color: petSpecies === type ? COLORS.white : COLORS.black,
                  }}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowPetTypeModal(false)}
              style={{
                padding: normalize(15),
                backgroundColor: COLORS.secondary,
                borderRadius: normalize(10),
                marginTop: normalize(10),
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  fontWeight: '600',
                  color: COLORS.black,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {Platform.OS === 'ios' && (
        <>
          {showCheckInPicker && (
            <DateTimePicker
              value={checkInDate}
              mode="date"
              display="default"
              onChange={handleCheckInDateChange}
              minimumDate={new Date()}
            />
          )}
          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOutDate}
              mode="date"
              display="default"
              onChange={handleCheckOutDateChange}
              minimumDate={new Date(checkInDate.getTime() + 86400000)}
            />
          )}
        </>
      )}
      {Platform.OS === 'android' && (
        <>
          {showCheckInPicker && (
            <DateTimePicker
              value={checkInDate}
              mode="date"
              display="default"
              onChange={handleCheckInDateChange}
              minimumDate={new Date()}
            />
          )}
          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOutDate}
              mode="date"
              display="default"
              onChange={handleCheckOutDateChange}
              minimumDate={new Date(checkInDate.getTime() + 86400000)}
            />
          )}
        </>
      )}
      <BottomTabsBar />
    </View>
  );
}

