import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';

export default function Testimonies() {
  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
        padding: normalize(20),
      }}
    >
      <ScrollView
        style={{ marginTop: normalize(20) }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            padding: normalize(20),
            backgroundColor: COLORS.white,
            borderRadius: normalize(10),
            marginBottom: normalize(15),
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '600',
              color: COLORS.black,
              marginBottom: normalize(8),
            }}
          >
            Sarah - Pemilik Max
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
              lineHeight: normalize(20),
              marginBottom: normalize(10),
            }}
          >
            "Layanan grooming di sini sangat memuaskan! Max terlihat lebih bersih dan sehat setelah perawatan."
          </Text>
          <Text
            style={{
              fontSize: normalize(12),
              color: COLORS.darkGray,
              fontStyle: 'italic',
            }}
          >
            ⭐⭐⭐⭐⭐
          </Text>
        </View>

        <View
          style={{
            padding: normalize(20),
            backgroundColor: COLORS.white,
            borderRadius: normalize(10),
            marginBottom: normalize(15),
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '600',
              color: COLORS.black,
              marginBottom: normalize(8),
            }}
          >
            Budi - Pemilik Luna
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
              lineHeight: normalize(20),
              marginBottom: normalize(10),
            }}
          >
            "Aplikasi ini sangat membantu dalam mengelola jadwal vaksinasi Luna. Tidak pernah lupa lagi!"
          </Text>
          <Text
            style={{
              fontSize: normalize(12),
              color: COLORS.darkGray,
              fontStyle: 'italic',
            }}
          >
            ⭐⭐⭐⭐⭐
          </Text>
        </View>

        <View
          style={{
            padding: normalize(20),
            backgroundColor: COLORS.white,
            borderRadius: normalize(10),
            marginBottom: normalize(15),
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '600',
              color: COLORS.black,
              marginBottom: normalize(8),
            }}
          >
            Rina - Pemilik Charlie
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
              lineHeight: normalize(20),
              marginBottom: normalize(10),
            }}
          >
            "Fitur appointment sangat mudah digunakan. Dokter hewan yang profesional dan ramah."
          </Text>
          <Text
            style={{
              fontSize: normalize(12),
              color: COLORS.darkGray,
              fontStyle: 'italic',
            }}
          >
            ⭐⭐⭐⭐
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
