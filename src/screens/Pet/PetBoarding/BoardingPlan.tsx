import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../../config/color';
import BackButton from '../../../components/BackButton';
import BottomTabsBar from '../../../components/BottomTabsBar';

export default function BoardingPlan({ navigation, route }: { navigation: any; route: any }) {
  const petId = route?.params?.petId;

  const boardingOptions = [
    {
      id: 1,
      type: 'Cat',
      roomType: 'STANDARD',
      price: 49000,
      color: COLORS.blue1, // Light blue
      emoji: '🐱',
      remaining: 2,
      total: 5,
      available: true,
    },
    {
      id: 2,
      type: 'Cat',
      roomType: 'DELUXE',
      price: 69900,
      color: COLORS.blue1, // Light blue
      emoji: '🐱',
      remaining: 0,
      total: 5,
      available: false,
    },
    {
      id: 3,
      type: 'Dog',
      roomType: 'STANDARD',
      price: 99000,
      color: COLORS.orange,
      emoji: '🐶',
      remaining: 1,
      total: 5,
      available: true,
    },
    {
      id: 4,
      type: 'Dog',
      roomType: 'DELUXE',
      price: 129000,
      color: COLORS.orange,
      emoji: '🐶',
      remaining: 1,
      total: 5,
      available: true,
    },
  ];

  const formatCurrency = (amount: number) => {
    return `RP${amount.toLocaleString('id-ID')} / DAY`;
  };

  const handleSelectRoom = (option: any) => {
    if (!option.available) {
      return; // Don't allow selection if no cages available
    }

    // Navigate to booking form
    navigation.navigate('BoardingBookingForm', {
      petId: petId,
      roomId: option.id,
      roomType: option.roomType,
      petType: option.type,
      price: option.price,
    });
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
          Pet Boarding
        </Text>
      </View>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: normalize(16),
          fontWeight: '600',
          color: COLORS.black,
          textTransform: 'uppercase',
          marginBottom: normalize(20),
        }}
      >
        CHOOSE YOUR PET FOR BOARDING
      </Text>

      {/* Boarding Options */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: normalize(100) }}
      >
        {boardingOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => handleSelectRoom(option)}
            disabled={!option.available}
            style={{
              backgroundColor: option.available ? option.color : COLORS.gray,
              borderRadius: normalize(15),
              padding: normalize(20),
              marginBottom: normalize(15),
              flexDirection: 'row',
              alignItems: 'center',
              opacity: option.available ? 1 : 0.6,
            }}
          >
            {/* Emoji Icon */}
            <Text
              style={{
                fontSize: normalize(40),
                marginRight: normalize(15),
              }}
            >
              {option.emoji}
            </Text>

            {/* Room Info */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: normalize(18),
                  fontWeight: '700',
                  color: COLORS.white,
                  textTransform: 'uppercase',
                  marginBottom: normalize(5),
                }}
              >
                {option.roomType}
              </Text>
              <Text
                style={{
                  fontSize: normalize(12),
                  color: COLORS.white,
                  opacity: 0.9,
                }}
              >
                REMAINING {option.remaining} OF {option.total} CAGES AVAILABLE
              </Text>
            </View>

            {/* Price Badge */}
            <View
              style={{
                backgroundColor: option.available ? COLORS.white : COLORS.gray,
                borderRadius: normalize(20),
                paddingVertical: normalize(8),
                paddingHorizontal: normalize(15),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(12),
                  fontWeight: '700',
                  color: option.available ? option.color : COLORS.white,
                }}
              >
                {formatCurrency(option.price)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <BottomTabsBar />
    </View>
  );
}
