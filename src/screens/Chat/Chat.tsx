import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';

export default function Chat() {
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
          Chat
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
            Messages
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
            }}
          >
            No messages yet. Start a conversation with other pet owners.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

