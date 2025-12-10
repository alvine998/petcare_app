import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../../config/color';
import BackButton from '../../../components/BackButton';
import BottomTabsBar from '../../../components/BottomTabsBar';

export default function GroomingPlan({ navigation, route }: { navigation: any; route: any }) {
  const petId = route?.params?.petId;

  const groomingPlans = [
    {
      id: 1,
      name: 'STANDART',
      color: COLORS.tosca, // Light teal/turquoise
      services: 'BATHING, BRUSHING, NAIL TRIMMING, CLEANING THE EARS.',
    },
    {
      id: 2,
      name: 'SPECIAL',
      color: COLORS.orange, // Vibrant orange
      services: 'ALL STANDARD SERVICES + FUR TRIMMING.',
    },
  ];

  const handleBuyNow = (planId: number) => {
    // Navigate to form screen
    navigation.navigate('InputFormGrooming', {
      petId: petId,
      planId: planId,
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
          Grooming
        </Text>
      </View>

      {/* Choose Plan Heading */}
      <Text
        style={{
          fontSize: normalize(18),
          fontWeight: '600',
          color: COLORS.darkGray,
          textTransform: 'uppercase',
          marginBottom: normalize(20),
        }}
      >
        CHOOSE PLAN
      </Text>

      {/* Grooming Plans List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: normalize(100) }}
      >
        {groomingPlans.map((plan) => (
          <View
            key={plan.id}
            style={{
              backgroundColor: plan.color,
              borderRadius: normalize(15),
              padding: normalize(20),
              marginBottom: normalize(20),
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            {/* Plan Name */}
            <Text
              style={{
                fontSize: normalize(24),
                fontWeight: '700',
                color: COLORS.white,
                textTransform: 'uppercase',
                marginBottom: normalize(15),
              }}
            >
              {plan.name}
            </Text>

            {/* Services */}
            <Text
              style={{
                fontSize: normalize(14),
                fontWeight: '400',
                color: COLORS.white,
                marginBottom: normalize(20),
                lineHeight: normalize(20),
              }}
            >
              {plan.services}
            </Text>

            {/* Buy Now Button */}
            <View
              style={{
                alignItems: 'flex-end',
              }}
            >
              <TouchableOpacity
                onPress={() => handleBuyNow(plan.id)}
                style={{
                  backgroundColor: COLORS.lightYellow,
                  paddingVertical: normalize(10),
                  paddingHorizontal: normalize(20),
                  borderRadius: normalize(8),
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(14),
                    fontWeight: '700',
                    color: COLORS.blue1,
                    textTransform: 'uppercase',
                  }}
                >
                  BUY NOW!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <BottomTabsBar />
    </View>
  );
}

