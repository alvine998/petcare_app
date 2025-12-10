import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useEffect } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../../config/color';
import firestore from '@react-native-firebase/firestore';

export default function BoardingSuccess({ navigation, route }: { navigation: any; route: any }) {
  const { petId, roomId, bookingData, paymentMethod, totalPrice } = route?.params || {};

  useEffect(() => {
    // Update booking status with payment information (status payment: pending)
    if (bookingData) {
      updateBookingStatus();
    }
  }, []);

  const updateBookingStatus = async () => {
    try {
      // Find the booking document and update with payment info
      // Note: We use orderBy on createdAt, but if index is needed, we can query without it
      let bookingsSnapshot;
      try {
        bookingsSnapshot = await firestore()
          .collection('boardingBookings')
          .where('petId', '==', petId)
          .where('roomId', '==', roomId)
          .where('status', '==', 'pending')
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
      } catch (error: any) {
        // If orderBy fails, try without it
        bookingsSnapshot = await firestore()
          .collection('boardingBookings')
          .where('petId', '==', petId)
          .where('roomId', '==', roomId)
          .where('status', '==', 'pending')
          .limit(1)
          .get();
      }

      if (!bookingsSnapshot.empty) {
        const bookingDoc = bookingsSnapshot.docs[0];
        await bookingDoc.ref.update({
          paymentMethod: paymentMethod || 'unknown',
          paymentStatus: 'pending',
          paymentAmount: totalPrice || bookingData?.totalPrice || 0,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // If booking not found, create a new payment record
        await firestore().collection('boardingBookings').add({
          ...bookingData,
          paymentMethod: paymentMethod || 'unknown',
          paymentStatus: 'pending',
          paymentAmount: totalPrice || bookingData?.totalPrice || 0,
          status: 'pending',
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error: any) {
      console.log('Error updating booking status:', error);
    }
  };

  const handleDone = () => {
    // Navigate to Home (MainTabs)
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
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
          marginBottom: normalize(40),
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Image 
          source={require('../../../assets/images/fireworks.png')} 
          style={{ 
            width: normalize(250), 
            height: normalize(250) 
          }} 
        />
      </View>

      {/* Success Message */}
      <View
        style={{
          backgroundColor: COLORS.green3,
          borderRadius: normalize(15),
          padding: normalize(25),
          marginBottom: normalize(30),
          minWidth: normalize(280),
        }}
      >
        <Text
          style={{
            fontSize: normalize(18),
            fontWeight: '600',
            color: COLORS.white,
            textAlign: 'center',
            lineHeight: normalize(26),
          }}
        >
          Congratulations, your transaction was successful.
        </Text>
      </View>

      {/* Done Button */}
      <TouchableOpacity
        onPress={handleDone}
        style={{
          backgroundColor: COLORS.green3,
          borderRadius: normalize(10),
          paddingVertical: normalize(15),
          paddingHorizontal: normalize(40),
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
  );
}

