import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';

export default function Info({ navigation }: { navigation: any }) {
  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
        padding: normalize(20),
      }}
    >
      <View style={{ marginTop: normalize(30), alignItems: 'center' }}>
        <Text
          style={{
            fontSize: normalize(30),
            fontWeight: '400',
            color: COLORS.black,
            textAlign: 'center',
          }}
        >
          Info
        </Text>
      </View>

      <ScrollView
        style={{ marginTop: normalize(30) }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('ListInformation')}
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
            Pet Health Information
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
            }}
          >
            View vaccinations, grooming, and boarding information
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

