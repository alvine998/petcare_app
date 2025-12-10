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

export default function InputFormGrooming({ navigation, route }: { navigation: any; route: any }) {
  const { petId, planId } = route?.params || {};
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [serviceType, setServiceType] = useState('home'); // 'shop' or 'home'
  const [address, setAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPetTypeModal, setShowPetTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (petId) {
      loadPetData();
    }
  }, [petId]);

  const loadPetData = async () => {
    try {
      const petDoc = await firestore().collection('pets').doc(petId).get();
      if (petDoc.exists()) {
        const petData = petDoc.data();
        setPetName(petData?.name || '');
        setPetType(petData?.species === 'cat' ? 'Kucing' : 'Anjing');
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
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && date) {
        setSelectedDate(date);
      }
    } else {
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleSubmit = async () => {
    if (!petName || !petType || !address) {
      Alert.alert('Error', 'Please fill all required fields');
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

      // Save grooming booking to Firestore
      const bookingData = {
        userId: currentUser.uid,
        petId: petId,
        planId: planId,
        petName: petName,
        petType: petType,
        serviceType: serviceType,
        address: address,
        selectedDate: firestore.Timestamp.fromDate(selectedDate),
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('groomingBookings').add(bookingData);

      // Navigate to payment screen with booking data including Date object for display
      navigation.navigate('GroomingPayment', {
        petId: petId,
        planId: planId,
        bookingData: {
          ...bookingData,
          selectedDate: selectedDate, // Include Date object for display
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
            fontSize: normalize(24),
            fontWeight: '600',
            color: COLORS.black,
            marginLeft: normalize(15),
          }}
        >
          {planId === 1 ? 'Standart' : 'Special'} Packet Form
        </Text>
      </View>

      {/* Form */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: normalize(100) }}
      >
        <View
          style={{
            backgroundColor: COLORS.lightBlue,
            borderRadius: normalize(15),
            padding: normalize(20),
          }}
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
              placeholder="Input text"
              value={petName}
              onChangeText={setPetName}
              style={{ backgroundColor: COLORS.white }}
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
                paddingVertical: normalize(15),
                paddingHorizontal: normalize(15),
                borderRadius: normalize(4),
                borderWidth: 1,
                borderColor: COLORS.secondary,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: petType ? COLORS.black : COLORS.gray,
                }}
              >
                {petType || 'Dropdown Text'}
              </Text>
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                }}
              >
                ▲
              </Text>
            </TouchableOpacity>
          </View>

          {/* Service Options */}
          <View style={{ marginBottom: normalize(20) }}>
            <Text
              style={{
                fontSize: normalize(16),
                fontWeight: '500',
                color: COLORS.black,
                marginBottom: normalize(10),
              }}
            >
              Service Options
            </Text>
            
            {/* Radio Button: Datang ke Petshop */}
            <TouchableOpacity
              onPress={() => setServiceType('shop')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: normalize(10),
              }}
            >
              <View
                style={{
                  width: normalize(20),
                  height: normalize(20),
                  borderRadius: normalize(10),
                  borderWidth: 2,
                  borderColor: serviceType === 'shop' ? COLORS.blue1 : COLORS.gray,
                  backgroundColor: serviceType === 'shop' ? COLORS.blue1 : COLORS.white,
                  marginRight: normalize(10),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {serviceType === 'shop' && (
                  <View
                    style={{
                      width: normalize(10),
                      height: normalize(10),
                      borderRadius: normalize(5),
                      backgroundColor: COLORS.white,
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                }}
              >
                Datang ke Petshop
              </Text>
            </TouchableOpacity>

            {/* Radio Button: Grooming di Rumah */}
            <TouchableOpacity
              onPress={() => setServiceType('home')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: normalize(10),
              }}
            >
              <View
                style={{
                  width: normalize(20),
                  height: normalize(20),
                  borderRadius: normalize(10),
                  borderWidth: 2,
                  borderColor: serviceType === 'home' ? COLORS.blue1 : COLORS.gray,
                  backgroundColor: serviceType === 'home' ? COLORS.blue1 : COLORS.white,
                  marginRight: normalize(10),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {serviceType === 'home' && (
                  <View
                    style={{
                      width: normalize(10),
                      height: normalize(10),
                      borderRadius: normalize(5),
                      backgroundColor: COLORS.white,
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                }}
              >
                Grooming di Rumah
              </Text>
            </TouchableOpacity>
          </View>

          {/* Address */}
          <View style={{ marginBottom: normalize(20) }}>
            <Text
              style={{
                fontSize: normalize(16),
                fontWeight: '500',
                color: COLORS.black,
                marginBottom: normalize(8),
              }}
            >
              Alamat
            </Text>
            <Input
              placeholder="Input address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: COLORS.white,
                minHeight: normalize(100),
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Set Date */}
          <View style={{ marginBottom: normalize(30) }}>
            <Text
              style={{
                fontSize: normalize(16),
                fontWeight: '500',
                color: COLORS.black,
                marginBottom: normalize(8),
              }}
            >
              Atur Tanggal
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                backgroundColor: COLORS.white,
                paddingVertical: normalize(15),
                paddingHorizontal: normalize(15),
                borderRadius: normalize(4),
                borderWidth: 1,
                borderColor: COLORS.secondary,
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                }}
              >
                {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Button */}
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
              {loading ? 'Processing...' : 'PAYMENT'}
            </Text>
          </Button>
        </View>
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
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                fontSize: normalize(20),
                fontWeight: '600',
                color: COLORS.black,
                marginBottom: normalize(20),
                textAlign: 'center',
              }}
            >
              Select Pet Type
            </Text>
            <TouchableOpacity
              onPress={() => {
                setPetType('Kucing');
                setShowPetTypeModal(false);
              }}
              style={{
                padding: normalize(15),
                backgroundColor: petType === 'Kucing' ? COLORS.info : COLORS.veryLightGray,
                borderRadius: normalize(10),
                marginBottom: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                  textAlign: 'center',
                }}
              >
                Kucing
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setPetType('Anjing');
                setShowPetTypeModal(false);
              }}
              style={{
                padding: normalize(15),
                backgroundColor: petType === 'Anjing' ? COLORS.info : COLORS.veryLightGray,
                borderRadius: normalize(10),
                marginBottom: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                  textAlign: 'center',
                }}
              >
                Anjing
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPetTypeModal(false)}
              style={{
                padding: normalize(15),
                backgroundColor: COLORS.secondary,
                borderRadius: normalize(10),
                marginTop: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <>
          {Platform.OS === 'ios' && (
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: normalize(10),
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={{ padding: normalize(10) }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(16),
                        color: COLORS.blue1,
                        fontWeight: '600',
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: normalize(18),
                      fontWeight: '600',
                      color: COLORS.black,
                    }}
                    >
                    Select Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={{ padding: normalize(10) }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(16),
                        color: COLORS.blue1,
                        fontWeight: '600',
                      }}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  style={{ height: normalize(200) }}
                />
              </View>
            </View>
          )}
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </>
      )}
      <BottomTabsBar />
    </View>
  );
}

