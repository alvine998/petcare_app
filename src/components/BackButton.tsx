import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../config/color';

export default function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <View>
      <TouchableOpacity
        style={{
          padding: normalize(15),
          borderRadius: normalize(10),
          backgroundColor: COLORS.primary,
          borderWidth: 1,
          borderColor: COLORS.blue1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={onPress}
      >
        <Image
          source={require('../assets/icons/arrow-left.png')}
          style={{ width: normalize(25), height: normalize(20) }}
        />
      </TouchableOpacity>
    </View>
  );
}
