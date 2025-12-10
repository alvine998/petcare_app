import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  TextInput,
  ToastAndroid,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import BottomTabsBar from '../../components/BottomTabsBar';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../../config/firebase';

interface AppointmentRequestProps {
  navigation: any;
  route: any;
}

export default function AppointmentRequest({
  navigation,
  route,
}: AppointmentRequestProps) {
  const { location } = route?.params || {};
  const [userName, setUserName] = useState('');
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<Date>(new Date());
  const [appointmentTime, setAppointmentTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
    loadPets();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firstName = userData?.firstName || '';
          const lastName = userData?.lastName || '';
          setUserName(`${firstName} ${lastName}`.trim() || 'User');
        }
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadPets = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const petsSnapshot = await firestore()
        .collection('pets')
        .where('userId', '==', currentUser.uid)
        .get();

      const petsData = petsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPets(petsData);
      if (petsData.length > 0 && !selectedPet) {
        setSelectedPet(petsData[0]);
      }
    } catch (error) {
      console.log('Error loading pets:', error);
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && date) {
        setAppointmentDate(date);
      }
    } else {
      if (date) {
        setAppointmentDate(date);
      }
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'set' && date) {
        setAppointmentTime(date);
      }
    } else {
      if (date) {
        setAppointmentTime(date);
      }
    }
  };

  const handleSend = async () => {
    if (!selectedPet) {
      Alert.alert('Error', 'Please select a pet');
      return;
    }

    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter your name');
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

      // Combine date and time
      const appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(appointmentTime.getHours());
      appointmentDateTime.setMinutes(appointmentTime.getMinutes());
      appointmentDateTime.setSeconds(0);
      appointmentDateTime.setMilliseconds(0);

      // Save appointment request to Firestore
      const appointmentData = {
        userId: currentUser.uid,
        locationId: location?.id || '',
        locationName: location?.name || '',
        locationAddress: location?.address || '',
        userName: userName.trim(),
        petId: selectedPet.id,
        petName: selectedPet.name || '',
        petBreed: selectedPet.breed || '',
        appointmentDate: firestore.Timestamp.fromDate(appointmentDateTime),
        notes: notes.trim(),
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('appointments').add(appointmentData);

      // Navigate to success screen
      navigation.navigate('AppointmentSuccess', {
        location: location,
        appointmentDate: firestore.Timestamp.fromDate(appointmentDate),
        appointmentTime: firestore.Timestamp.fromDate(appointmentTime),
      });
    } catch (error: any) {
      console.log('Error sending appointment:', error);
      Alert.alert('Error', 'Failed to send appointment request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.lightBlue,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: normalize(20),
          paddingTop: normalize(50),
          paddingBottom: normalize(15),
          backgroundColor: COLORS.lightBlue,
        }}
      >
        <BackButton navigation={navigation} />
        <Text
          style={{
            fontSize: normalize(14),
            color: COLORS.gray,
            marginLeft: normalize(10),
          }}
        >
          Page Name {'>'} Page Name {'>'} Page Na
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: normalize(20),
          paddingBottom: normalize(100),
        }}
      >
        {/* Form Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: normalize(15),
            padding: normalize(20),
            marginTop: normalize(20),
            position: 'relative',
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: normalize(20),
              right: normalize(20),
              width: normalize(30),
              height: normalize(30),
              borderRadius: normalize(15),
              backgroundColor: COLORS.lightGray,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <Text
              style={{
                fontSize: normalize(18),
                color: COLORS.black,
                fontWeight: 'bold',
              }}
            >
              ×
            </Text>
          </TouchableOpacity>

          {/* Title */}
          <View style={{ marginBottom: normalize(25), marginRight: normalize(40) }}>
            <Text
              style={{
                fontSize: normalize(12),
                color: COLORS.gray,
                marginBottom: normalize(5),
              }}
            >
              APPOINTMENT REQUEST AT:
            </Text>
            <Text
              style={{
                fontSize: normalize(20),
                fontWeight: '700',
                color: COLORS.black,
              }}
            >
              {location?.name || 'Vet Location'}
            </Text>
          </View>

          {/* AVAILABILITY Section */}
          <View style={{ marginBottom: normalize(25) }}>
            <Text
              style={{
                fontSize: normalize(16),
                fontWeight: '700',
                color: COLORS.black,
                marginBottom: normalize(15),
              }}
            >
              AVAILABILITY
            </Text>

            {/* DATE */}
            <View style={{ marginBottom: normalize(15) }}>
              <Text
                style={{
                  fontSize: normalize(14),
                  fontWeight: '600',
                  color: COLORS.black,
                  marginBottom: normalize(8),
                }}
              >
                DATE:
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray,
                  borderRadius: normalize(8),
                  padding: normalize(12),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(14),
                    color: COLORS.black,
                  }}
                >
                  {formatDate(appointmentDate)}
                </Text>
                <Text style={{ fontSize: normalize(14), color: COLORS.gray }}>
                  ▼
                </Text>
              </TouchableOpacity>
            </View>

            {/* TIME */}
            <View>
              <Text
                style={{
                  fontSize: normalize(14),
                  fontWeight: '600',
                  color: COLORS.black,
                  marginBottom: normalize(8),
                }}
              >
                TIME:
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray,
                  borderRadius: normalize(8),
                  padding: normalize(12),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(14),
                    color: COLORS.black,
                  }}
                >
                  {formatTime(appointmentTime)}
                </Text>
                <Text style={{ fontSize: normalize(14), color: COLORS.gray }}>
                  ▼
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* INFORMATION Section */}
          <View style={{ marginBottom: normalize(25) }}>
            <Text
              style={{
                fontSize: normalize(16),
                fontWeight: '700',
                color: COLORS.black,
                marginBottom: normalize(15),
              }}
            >
              INFORMATION
            </Text>

            {/* NAME */}
            <View style={{ marginBottom: normalize(15) }}>
              <Text
                style={{
                  fontSize: normalize(14),
                  fontWeight: '600',
                  color: COLORS.black,
                  marginBottom: normalize(8),
                }}
              >
                NAME:
              </Text>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray,
                  borderRadius: normalize(8),
                  padding: normalize(12),
                  fontSize: normalize(14),
                  color: COLORS.black,
                }}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.gray}
              />
            </View>

            {/* ANIMAL NAME */}
            <View style={{ marginBottom: normalize(15) }}>
              <Text
                style={{
                  fontSize: normalize(14),
                  fontWeight: '600',
                  color: COLORS.black,
                  marginBottom: normalize(8),
                }}
              >
                ANIMAL NAME:
              </Text>
              <TouchableOpacity
                onPress={() => setShowPetModal(true)}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray,
                  borderRadius: normalize(8),
                  padding: normalize(12),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(14),
                    color: COLORS.black,
                  }}
                >
                  {selectedPet?.name || 'Select pet'}
                </Text>
                <Text style={{ fontSize: normalize(14), color: COLORS.gray }}>
                  ▼
                </Text>
              </TouchableOpacity>
            </View>

            {/* BREED */}
            <View>
              <Text
                style={{
                  fontSize: normalize(14),
                  fontWeight: '600',
                  color: COLORS.black,
                  marginBottom: normalize(8),
                }}
              >
                BREED:
              </Text>
              <TextInput
                value={selectedPet?.breed || ''}
                editable={false}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.gray,
                  borderRadius: normalize(8),
                  padding: normalize(12),
                  fontSize: normalize(14),
                  color: COLORS.black,
                  backgroundColor: COLORS.lightGray,
                }}
                placeholder="Breed"
                placeholderTextColor={COLORS.gray}
              />
            </View>
          </View>

          {/* APPOINTMENT NOTES */}
          <View style={{ marginBottom: normalize(25) }}>
            <Text
              style={{
                fontSize: normalize(16),
                fontWeight: '700',
                color: COLORS.black,
                marginBottom: normalize(15),
              }}
            >
              APPOINTMENT NOTES:
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={{
                borderWidth: 1,
                borderColor: COLORS.gray,
                borderRadius: normalize(8),
                padding: normalize(12),
                fontSize: normalize(14),
                color: COLORS.black,
                minHeight: normalize(100),
                textAlignVertical: 'top',
              }}
              placeholder="Enter appointment notes..."
              placeholderTextColor={COLORS.gray}
            />
          </View>

          {/* SEND Button */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={loading}
            style={{
              backgroundColor: COLORS.green1,
              borderRadius: normalize(10),
              padding: normalize(15),
              alignItems: 'center',
              alignSelf: 'flex-end',
              minWidth: normalize(100),
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: normalize(16),
                fontWeight: '700',
              }}
            >
              {loading ? 'Sending...' : 'SEND'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pet Selection Modal */}
      <Modal
        visible={showPetModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPetModal(false)}
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
              maxHeight: '50%',
            }}
          >
            <Text
              style={{
                fontSize: normalize(18),
                fontWeight: '700',
                color: COLORS.black,
                marginBottom: normalize(20),
              }}
            >
              Select Pet
            </Text>
            <ScrollView>
              {pets.map(pet => (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => {
                    setSelectedPet(pet);
                    setShowPetModal(false);
                  }}
                  style={{
                    padding: normalize(15),
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.lightGray,
                  }}
                >
                  <Text
                    style={{
                      fontSize: normalize(16),
                      color: COLORS.black,
                      fontWeight: '600',
                    }}
                  >
                    {pet.name}
                  </Text>
                  {pet.breed && (
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.gray,
                        marginTop: normalize(5),
                      }}
                    >
                      {pet.breed}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowPetModal(false)}
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

      {/* Date Picker */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: normalize(20),
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(18),
                    fontWeight: '700',
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
                value={appointmentDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={{ height: normalize(200) }}
              />
            </View>
          </View>
        </Modal>
      )}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={appointmentDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {Platform.OS === 'ios' && showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: normalize(20),
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(18),
                    fontWeight: '700',
                    color: COLORS.black,
                  }}
                >
                  Select Time
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
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
                value={appointmentTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={{ height: normalize(200) }}
              />
            </View>
          </View>
        </Modal>
      )}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={appointmentTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <BottomTabsBar />
    </View>
  );
}

