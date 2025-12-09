import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../../config/color';
import BackButton from '../../../components/BackButton';

export default function BoardingPlan({ navigation }: { navigation: any }) {
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
          Pet Boarding
        </Text>
      </View>

      <ScrollView
        style={{ marginTop: normalize(30) }}
        showsVerticalScrollIndicator={false}
      >
        <View
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
            Boarding Services
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
            }}
          >
            Find safe and comfortable boarding options for your pet.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

