import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BottomTabsBar from '../../components/BottomTabsBar';

interface AppointmentSuccessProps {
  navigation: any;
  route: any;
}

export default function AppointmentSuccess({
  navigation,
  route,
}: AppointmentSuccessProps) {
  const { location, appointmentDate, appointmentTime } = route?.params || {};

  const formatAppointmentDate = (date: Date): string => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Add ordinal suffix
    const getOrdinalSuffix = (day: number): string => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };

  const formatAppointmentTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    if (minutes === 0) {
      return `${displayHours}${ampm}`;
    }
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const handleDone = () => {
    // Navigate to Home (MainTabs)
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleResend = () => {
    Alert.alert('Email Resent', 'Confirmation email has been resent to your email address.');
  };

  // Handle Firestore Timestamp or Date object
  let appointmentDateTime: Date;
  let appointmentTimeDate: Date;

  if (appointmentDate) {
    if (appointmentDate.seconds) {
      // Firestore Timestamp
      appointmentDateTime = new Date(appointmentDate.seconds * 1000);
    } else {
      appointmentDateTime = new Date(appointmentDate);
    }
  } else {
    appointmentDateTime = new Date();
  }

  if (appointmentTime) {
    if (appointmentTime.seconds) {
      // Firestore Timestamp
      appointmentTimeDate = new Date(appointmentTime.seconds * 1000);
    } else {
      appointmentTimeDate = new Date(appointmentTime);
    }
  } else {
    appointmentTimeDate = new Date();
  }

  // Combine date and time
  const combinedDateTime = new Date(appointmentDateTime);
  combinedDateTime.setHours(appointmentTimeDate.getHours());
  combinedDateTime.setMinutes(appointmentTimeDate.getMinutes());
  combinedDateTime.setSeconds(0);
  combinedDateTime.setMilliseconds(0);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.primary,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: normalize(20),
        }}
      >
        {/* Fireworks Illustration */}
        <View
          style={{
            width: normalize(250),
            height: normalize(250),
            marginBottom: normalize(30),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            source={require('../../assets/images/fireworks.png')}
            style={{
              width: normalize(250),
              height: normalize(250),
            }}
          />
        </View>

        {/* Success Card */}
        <View
          style={{
            backgroundColor: COLORS.blue1,
            borderRadius: normalize(15),
            padding: normalize(30),
            marginBottom: normalize(30),
            minWidth: normalize(300),
            maxWidth: '90%',
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: normalize(20),
              fontWeight: '700',
              color: COLORS.white,
              textAlign: 'center',
              marginBottom: normalize(20),
              textTransform: 'uppercase',
            }}
          >
            YOUR APPOINTMENT HAS BEEN MADE!
          </Text>

          {/* Appointment Details */}
          <View style={{ marginBottom: normalize(20) }}>
            <Text
              style={{
                fontSize: normalize(16),
                fontWeight: '600',
                color: COLORS.white,
                textAlign: 'center',
                marginBottom: normalize(8),
              }}
            >
              {location?.name || 'Vet Location'}
            </Text>
            <Text
              style={{
                fontSize: normalize(14),
                color: COLORS.white,
                textAlign: 'center',
              }}
            >
              {formatAppointmentDate(combinedDateTime)} @{' '}
              {formatAppointmentTime(combinedDateTime)}
            </Text>
          </View>

          {/* Email Confirmation */}
          <View style={{ marginBottom: normalize(15) }}>
            <Text
              style={{
                fontSize: normalize(12),
                color: COLORS.white,
                textAlign: 'center',
                marginBottom: normalize(10),
                textTransform: 'uppercase',
              }}
            >
              AN EMAIL CONFIRMATION HAS BEEN SENT
            </Text>

            {/* Resend Button */}
            <TouchableOpacity
              onPress={handleResend}
              style={{
                backgroundColor: COLORS.veryLightBlue,
                borderRadius: normalize(20),
                paddingVertical: normalize(8),
                paddingHorizontal: normalize(20),
                alignSelf: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: normalize(12),
                  fontWeight: '600',
                  color: COLORS.white,
                }}
              >
                RESEND
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Done Button */}
        <TouchableOpacity
          onPress={handleDone}
          style={{
            backgroundColor: COLORS.green1,
            borderRadius: normalize(10),
            paddingVertical: normalize(15),
            paddingHorizontal: normalize(60),
            borderWidth: 1,
            borderColor: COLORS.veryDarkGreen,
          }}
        >
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '700',
              color: COLORS.white,
              textTransform: 'uppercase',
            }}
          >
            DONE
          </Text>
        </TouchableOpacity>
      </View>

      <BottomTabsBar />
    </View>
  );
}

