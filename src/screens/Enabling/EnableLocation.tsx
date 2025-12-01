import { View, Text, Image } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Button } from '../../components/Button';

export default function EnableLocation({ navigation }: { navigation: any }) {
  const handleAllow = () => {
    // Here you can request real location permission with react-native-permissions or similar.
    navigation.navigate('EnableNotification');
  };

  const handleSkip = () => {
    navigation.navigate('EnableNotification');
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
            padding: normalize(20),
          }}
        >
          <Image
            source={require('../../assets/icons/pin-map.png')}
            style={{ width: normalize(100), height: normalize(100) }}
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
          Enable Location
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
          Your location will be used to show nearby veterinarians and pet stores
        </Text>
        <Button
          variant="success"
          style={{
            width: '100%',
            height: normalize(50),
            marginTop: normalize(40),
          }}
          onPress={handleAllow}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: normalize(16),
              fontWeight: 'bold',
            }}
          >
            ALLOW LOCATION
          </Text>
        </Button>
        <Button
          variant="secondary"
          style={{
            width: '100%',
            height: normalize(50),
            marginTop: normalize(20),
          }}
          onPress={handleSkip}
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
