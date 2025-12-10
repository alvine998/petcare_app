import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../../config/color';
import BackButton from '../../../components/BackButton';
import BottomTabsBar from '../../../components/BottomTabsBar';
import firestore from '@react-native-firebase/firestore';

export default function BoardingPayment({ navigation, route }: { navigation: any; route: any }) {
  const { petId, roomId, bookingData } = route?.params || {};
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [roomDetails, setRoomDetails] = useState<any>(null);

  useEffect(() => {
    if (roomId) {
      loadRoomDetails();
    }
  }, [roomId]);

  const loadRoomDetails = async () => {
    try {
      // Load room details from Firestore if needed
      // For now, use bookingData
      if (bookingData) {
        setRoomDetails({
          roomType: bookingData.roomType,
          petType: bookingData.petType,
          pricePerDay: bookingData.pricePerDay,
          totalDays: bookingData.totalDays,
          totalPrice: bookingData.totalPrice,
        });
      }
    } catch (error: any) {
      console.log('Error loading room details:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `RP. ${amount.toLocaleString('id-ID')},-`;
  };

  const formatDate = (date: Date | any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : date.toDate();
    const day = d.getDate();
    const monthNames = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handlePayment = (method: string) => {
    setSelectedPayment(method);
  };

  const handleProcessPayment = () => {
    if (!selectedPayment) {
      return;
    }
    
    // Navigate to success page
    navigation.navigate('BoardingSuccess', {
      petId: petId,
      roomId: roomId,
      bookingData: bookingData,
      paymentMethod: selectedPayment,
      totalPrice: roomDetails?.totalPrice || bookingData?.totalPrice || 0,
    });
  };

  const totalPrice = roomDetails?.totalPrice || bookingData?.totalPrice || 0;
  const totalDays = bookingData?.totalDays || 1;
  const pricePerDay = roomDetails?.pricePerDay || bookingData?.pricePerDay || 0;

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
          Payment
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: normalize(100) }}
      >
        {/* Order Summary */}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderRadius: normalize(15),
            padding: normalize(20),
            marginBottom: normalize(20),
          }}
        >
          <Text
            style={{
              fontSize: normalize(18),
              fontWeight: '700',
              color: COLORS.black,
              textTransform: 'uppercase',
              marginBottom: normalize(20),
            }}
          >
            ORDER SUMMARY
          </Text>

          {/* Pet Name */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: normalize(15),
            }}
          >
            <Image
              source={require('../../../assets/images/foot_dog.png')}
              style={{
                width: normalize(24),
                height: normalize(24),
                marginRight: normalize(10),
                tintColor: COLORS.green1,
              }}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: normalize(12),
                  fontWeight: '500',
                  color: COLORS.gray,
                  textTransform: 'uppercase',
                }}
              >
                PET NAME
              </Text>
              <Text
                style={{
                  fontSize: normalize(16),
                  fontWeight: '600',
                  color: COLORS.black,
                }}
              >
                {bookingData?.petName || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Room Type */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: normalize(15),
            }}
          >
            <Image
              source={require('../../../assets/images/foot_dog.png')}
              style={{
                width: normalize(24),
                height: normalize(24),
                marginRight: normalize(10),
                tintColor: COLORS.green1,
              }}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: normalize(12),
                  fontWeight: '500',
                  color: COLORS.gray,
                  textTransform: 'uppercase',
                }}
              >
                ROOM TYPE
              </Text>
              <Text
                style={{
                  fontSize: normalize(16),
                  fontWeight: '600',
                  color: COLORS.black,
                  textTransform: 'uppercase',
                }}
              >
                {bookingData?.roomType || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Check-in Date */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: normalize(15),
            }}
          >
            <Image
              source={require('../../../assets/images/foot_dog.png')}
              style={{
                width: normalize(24),
                height: normalize(24),
                marginRight: normalize(10),
                tintColor: COLORS.green1,
              }}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: normalize(12),
                  fontWeight: '500',
                  color: COLORS.gray,
                  textTransform: 'uppercase',
                }}
              >
                CHECK-IN DATE
              </Text>
              <Text
                style={{
                  fontSize: normalize(16),
                  fontWeight: '600',
                  color: COLORS.black,
                }}
              >
                {formatDate(bookingData?.checkInDate)}
              </Text>
            </View>
          </View>

          {/* Check-out Date */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: normalize(15),
            }}
          >
            <Image
              source={require('../../../assets/images/foot_dog.png')}
              style={{
                width: normalize(24),
                height: normalize(24),
                marginRight: normalize(10),
                tintColor: COLORS.green1,
              }}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: normalize(12),
                  fontWeight: '500',
                  color: COLORS.gray,
                  textTransform: 'uppercase',
                }}
              >
                CHECK-OUT DATE
              </Text>
              <Text
                style={{
                  fontSize: normalize(16),
                  fontWeight: '600',
                  color: COLORS.black,
                }}
              >
                {formatDate(bookingData?.checkOutDate)}
              </Text>
            </View>
          </View>

          {/* Total Days */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: normalize(15),
            }}
          >
            <Image
              source={require('../../../assets/images/foot_dog.png')}
              style={{
                width: normalize(24),
                height: normalize(24),
                marginRight: normalize(10),
                tintColor: COLORS.green1,
              }}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: normalize(12),
                  fontWeight: '500',
                  color: COLORS.gray,
                  textTransform: 'uppercase',
                }}
              >
                TOTAL DAYS
              </Text>
              <Text
                style={{
                  fontSize: normalize(16),
                  fontWeight: '600',
                  color: COLORS.black,
                }}
              >
                {totalDays} day(s)
              </Text>
            </View>
          </View>

          {/* Total Cost */}
          <View
            style={{
              marginTop: normalize(20),
              paddingTop: normalize(20),
              borderTopWidth: 1,
              borderTopColor: COLORS.secondary,
            }}
          >
            <Text
              style={{
                fontSize: normalize(12),
                fontWeight: '500',
                color: COLORS.black,
                textTransform: 'uppercase',
                marginBottom: normalize(5),
              }}
            >
              TOTAL COST
            </Text>
            <Text
              style={{
                fontSize: normalize(24),
                fontWeight: '700',
                color: COLORS.black,
              }}
            >
              {formatCurrency(totalPrice)}
            </Text>
          </View>
        </View>

        {/* Choose Payment Method */}
        <Text
          style={{
            fontSize: normalize(18),
            fontWeight: '700',
            color: COLORS.black,
            textAlign: 'center',
            textTransform: 'uppercase',
            marginBottom: normalize(20),
          }}
        >
          CHOOSE PAYMENT METHOD
        </Text>

        {/* Payment Methods */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: normalize(15),
          }}
        >
          {/* QRIS */}
          <TouchableOpacity
            onPress={() => handlePayment('qris')}
            style={{
              flex: 1,
              backgroundColor: COLORS.white,
              borderRadius: normalize(15),
              padding: normalize(20),
              alignItems: 'center',
              borderWidth: selectedPayment === 'qris' ? 2 : 0,
              borderColor: COLORS.blue1,
            }}
          >
            <View
              style={{
                width: normalize(60),
                height: normalize(60),
                backgroundColor: COLORS.blue1,
                borderRadius: normalize(10),
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(24),
                  fontWeight: '700',
                  color: COLORS.white,
                }}
              >
                QR
              </Text>
            </View>
            <Text
              style={{
                fontSize: normalize(14),
                fontWeight: '600',
                color: COLORS.blue1,
              }}
            >
              QRIS
            </Text>
          </TouchableOpacity>

          {/* DANA */}
          <TouchableOpacity
            onPress={() => handlePayment('dana')}
            style={{
              flex: 1,
              backgroundColor: COLORS.white,
              borderRadius: normalize(15),
              padding: normalize(20),
              alignItems: 'center',
              borderWidth: selectedPayment === 'dana' ? 2 : 0,
              borderColor: COLORS.blue1,
            }}
          >
            <View
              style={{
                width: normalize(60),
                height: normalize(60),
                backgroundColor: COLORS.blue1,
                borderRadius: normalize(10),
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(24),
                  fontWeight: '700',
                  color: COLORS.white,
                }}
              >
                D
              </Text>
            </View>
            <Text
              style={{
                fontSize: normalize(14),
                fontWeight: '600',
                color: COLORS.blue1,
              }}
            >
              DANA
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Button */}
        {selectedPayment && (
          <TouchableOpacity
            onPress={handleProcessPayment}
            style={{
              backgroundColor: COLORS.green1,
              borderRadius: normalize(10),
              padding: normalize(15),
              alignItems: 'center',
              marginTop: normalize(30),
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
              PAYMENT
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <BottomTabsBar />
    </View>
  );
}

