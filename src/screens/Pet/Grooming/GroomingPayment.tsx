import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../../config/color';
import BackButton from '../../../components/BackButton';
import BottomTabsBar from '../../../components/BottomTabsBar';
import firestore from '@react-native-firebase/firestore';

export default function GroomingPayment({ navigation, route }: { navigation: any; route: any }) {
  const { petId, planId, bookingData } = route?.params || {};
  const [groomingPlan, setGroomingPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<string>('');

  useEffect(() => {
    loadGroomingPlan();
  }, [planId]);

  const loadGroomingPlan = async () => {
    try {
      setLoading(true);
      
      // Load grooming plan from Firestore collection "Groomings"
      const groomingDoc = await firestore()
        .collection('Groomings')
        .where('planId', '==', planId)
        .limit(1)
        .get();

      if (!groomingDoc.empty) {
        const planData = groomingDoc.docs[0].data();
        setGroomingPlan({
          id: groomingDoc.docs[0].id,
          ...planData,
        });
      } else {
        // Fallback to default pricing if not found in Firestore
        const defaultPlans: any = {
          1: { name: 'PAKET STANDART', price: 150000 },
          2: { name: 'PAKET SPECIAL', price: 200000 },
        };
        setGroomingPlan(defaultPlans[planId] || defaultPlans[1]);
      }
    } catch (error: any) {
      console.log('Error loading grooming plan:', error);
      // Fallback to default pricing
      const defaultPlans: any = {
        1: { name: 'PAKET STANDART', price: 150000 },
        2: { name: 'PAKET SPECIAL', price: 200000 },
      };
      setGroomingPlan(defaultPlans[planId] || defaultPlans[1]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: any): string => {
    if (!date) return '';
    
    let dateObj: Date;
    
    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date._seconds) {
      dateObj = new Date(date._seconds * 1000 + (date._nanoseconds || 0) / 1000000);
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }

    const day = dateObj.getDate();
    const monthNames = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
  };

  const formatCurrency = (amount: number): string => {
    return `RP. ${amount.toLocaleString('id-ID')},-`;
  };

  const handlePayment = (method: string) => {
    setSelectedPayment(method);
  };

  const handleProcessPayment = () => {
    if (!selectedPayment) {
      return;
    }
    
    // Navigate to success page
    navigation.navigate('GroomingSuccess', {
      petId: petId,
      planId: planId,
      bookingData: bookingData,
      paymentMethod: selectedPayment,
      totalCost: groomingPlan?.price || 0,
    });
  };

  if (loading) {
    return (
      <View
        style={{
          backgroundColor: COLORS.primary,
          height: '100%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
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
          Loading payment information...
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
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: normalize(20),
          paddingTop: normalize(40),
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
      >
        {/* Light Blue Section */}
        <View
          style={{
            backgroundColor: COLORS.lightBlue,
            padding: normalize(20),
            marginTop: normalize(20),
          }}
        >
          {/* Order Summary */}
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
            ORDER SUMMARY
          </Text>

          {/* White Card */}
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: normalize(15),
              padding: normalize(20),
              marginBottom: normalize(20),
            }}
          >
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

            {/* Pet Type */}
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
                  PET TYPE
                </Text>
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '600',
                    color: COLORS.black,
                    textTransform: 'uppercase',
                  }}
                >
                  {bookingData?.petType || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Type of Service */}
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
                  TYPE OF SERVICE
                </Text>
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '600',
                    color: COLORS.black,
                    textTransform: 'uppercase',
                  }}
                >
                  {groomingPlan?.name || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Date & Time */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: normalize(20),
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
                  DATE & TIME
                </Text>
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '600',
                    color: COLORS.black,
                  }}
                >
                  {bookingData?.selectedDate
                    ? formatDate(bookingData.selectedDate)
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: COLORS.secondary,
                marginBottom: normalize(20),
              }}
            />

            {/* Total Cost */}
            <View
              style={{
                backgroundColor: COLORS.lightGreen,
                borderRadius: normalize(10),
                padding: normalize(15),
                alignItems: 'center',
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
                {groomingPlan?.price
                  ? formatCurrency(groomingPlan.price)
                  : 'RP. 0,-'}
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
        </View>
      </ScrollView>
      <BottomTabsBar />
    </View>
  );
}

