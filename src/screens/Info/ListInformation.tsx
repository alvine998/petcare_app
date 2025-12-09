import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';

export default function ListInformation({ navigation }: { navigation: any }) {
  const [selectedPet, setSelectedPet] = useState('Bowow');

  const healthServices = [
    {
      id: 1,
      title: 'VACCINATIONS',
      color: '#5EDBC2', // Light teal/mint green
      icon: require('../../assets/images/stetoscop.png'),
      badge: 2,
      description: 'Keep your pet up to date with vaccinations',
    },
    {
      id: 2,
      title: 'GROOMING',
      color: '#808080', // Medium grey
      icon: require('../../assets/images/daycare.png'),
      badge: null,
      description: 'Professional grooming services for your pet',
    },
    {
      id: 3,
      title: 'PET BOARDING',
      color: '#5EB0DB', // Medium blue
      icon: require('../../assets/images/daycare.png'),
      badge: null,
      description: 'Safe and comfortable boarding for your pet',
    },
  ];

  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
        padding: normalize(20),
      }}
    >
      <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      {/* Pet Selector Dropdown */}
      <TouchableOpacity
        style={{
          backgroundColor: COLORS.warning,
          paddingVertical: normalize(12),
          paddingHorizontal: normalize(15),
          borderRadius: normalize(10),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: normalize(20),
        }}
      >
        <Text
          style={{
            fontSize: normalize(16),
            fontWeight: '600',
            color: COLORS.black,
          }}
        >
          {selectedPet}
        </Text>
        <Image
          source={require('../../assets/icons/arrow-left.png')}
          style={{
            width: normalize(16),
            height: normalize(16),
            transform: [{ rotate: '-90deg' }],
            tintColor: COLORS.black,
          }}
        />
      </TouchableOpacity>

      {/* Title */}
      <Text
        style={{
          fontSize: normalize(24),
          fontWeight: '600',
          color: COLORS.black,
          textAlign: 'center',
          marginTop: normalize(20),
          marginBottom: normalize(30),
        }}
      >
        Pet Health Information
      </Text>

      {/* Health Services List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {healthServices.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={{
              backgroundColor: service.color,
              borderRadius: normalize(15),
              padding: normalize(20),
              marginBottom: normalize(20),
              flexDirection: 'row',
              alignItems: 'center',
              position: 'relative',
              minHeight: normalize(80),
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: normalize(60),
                height: normalize(60),
                backgroundColor: COLORS.white,
                borderRadius: normalize(30),
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: normalize(15),
              }}
            >
              <Image
                source={service.icon}
                style={{
                  width: normalize(35),
                  height: normalize(35),
                  resizeMode: 'contain',
                }}
              />
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: normalize(18),
                fontWeight: '700',
                color: COLORS.white,
                flex: 1,
                textTransform: 'uppercase',
              }}
            >
              {service.title}
            </Text>

            {/* Badge */}
            {service.badge && (
              <View
                style={{
                  position: 'absolute',
                  top: normalize(10),
                  right: normalize(10),
                  backgroundColor: COLORS.danger,
                  borderRadius: normalize(12),
                  minWidth: normalize(24),
                  height: normalize(24),
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: normalize(8),
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: normalize(12),
                    fontWeight: '700',
                  }}
                >
                  {service.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

