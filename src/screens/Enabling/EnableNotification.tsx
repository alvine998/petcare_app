import { View, Text, Image } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Button } from '../../components/Button';

export default function EnableNotification({
  navigation,
}: {
  navigation: any;
}) {
  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
        padding: normalize(20),
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: normalize(20),
        }}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.secondary,
            borderRadius: normalize(100),
            padding: normalize(30),
          }}
        >
          <Image
            source={require('../../assets/icons/bell.png')}
            style={{ width: normalize(100), height: normalize(110) }}
          />
        </View>
        <Text
          style={{
            fontSize: normalize(30),
            fontWeight: 'bold',
            color: COLORS.black,
            marginTop: normalize(20),
          }}
        >
          Enable Notification
        </Text>
        <Text
          style={{
            fontSize: normalize(25),
            fontWeight: '300',
            color: COLORS.gray,
            marginTop: normalize(10),
            textAlign: 'center',
          }}
        >
          Enable notifications for reminders and messages
        </Text>
        <Button
          variant="success"
          style={{
            width: '100%',
            height: normalize(50),
            marginTop: normalize(40),
          }}
          onPress={() => navigation.navigate('Home')}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: normalize(16),
              fontWeight: 'bold',
            }}
          >
            ALLOW NOTIFICATION
          </Text>
        </Button>
        <Button
          variant="secondary"
          style={{
            width: '100%',
            height: normalize(50),
            marginTop: normalize(20),
          }}
          onPress={() => navigation.navigate('Home')}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: normalize(16),
              fontWeight: 'bold',
            }}
          >
            SKIP FOR NOW
          </Text>
        </Button>
      </View>
    </View>
  );
}
