import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../../config/color';
import BackButton from '../../../components/BackButton';
import BottomTabsBar from '../../../components/BottomTabsBar';

export default function PetVaccination({ navigation, route }: { navigation: any; route: any }) {
  const petId = route?.params?.petId;

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

      <View style={{ marginTop: normalize(30), alignItems: 'center' }}>
        <Text
          style={{
            fontSize: normalize(30),
            fontWeight: '400',
            color: COLORS.black,
            textAlign: 'center',
          }}
        >
          Vaccinations
        </Text>
      </View>

      <ScrollView
        style={{ marginTop: normalize(30) }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: normalize(100) }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('PastVaccinations', { petId: petId })}
          style={{
            padding: normalize(20),
            backgroundColor: COLORS.info,
            borderRadius: normalize(10),
            marginBottom: normalize(15),
          }}
        >
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: normalize(5),
            }}
          >
            Past Vaccinations
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
            }}
          >
            View your pet's vaccination history and records.
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomTabsBar />
    </View>
  );
}

