import { View, Text, Image } from 'react-native';
import React from 'react';
import { COLORS } from '../../config/color';
import normalize from 'react-native-normalize';
import { Button } from '../../components/Button';

export default function Welcome1({ navigation }: { navigation: any }) {
  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
        padding: normalize(20),
      }}
    >
      {/* Dog Image at bottom right */}
      <Image
        source={require('../../assets/images/dog.png')}
        style={{
          width: normalize(300),
          height: normalize(400),
          position: 'absolute',
          bottom: 0,
          right: 0,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <View style={{ marginTop: normalize(100) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontSize: normalize(40),
              color: COLORS.textGreen,
              fontWeight: '100',
            }}
          >
            Welcome to
          </Text>
          <Image
            source={require('../../assets/images/foot_dog.png')}
            style={{
              width: normalize(40),
              height: normalize(40),
              marginRight: normalize(50),
            }}
          />
        </View>
        <Text
          style={{
            fontSize: normalize(35),
            color: COLORS.textGreen,
            fontWeight: 'bold',
          }}
        >
          Petcare & Grooming
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginTop: normalize(50),
          }}
        >
          <Image
            source={require('../../assets/images/left_foot_dog.png')}
            style={{
              width: normalize(60),
              height: normalize(60),
              marginRight: normalize(100),
            }}
          />
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: normalize(70),
          right: normalize(20),
          left: normalize(20),
          zIndex: 2,
        }}
      >
        <Button
          variant="success"
          style={{
            height: normalize(50),
            width: '100%',
            borderRadius: normalize(25),
          }}
          onPress={() => navigation.navigate('Welcome2')}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: normalize(16),
              fontWeight: 'bold',
            }}
          >
            Get Started
          </Text>
        </Button>
      </View>
    </View>
  );
}
