import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { COLORS } from '../../config/color';
import normalize from 'react-native-normalize';
import { Button } from '../../components/Button';

export default function Welcome2({ navigation }: { navigation: any }) {
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
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          paddingHorizontal: normalize(20),
        }}
      >
        <Text
          style={{
            fontSize: normalize(30),
            fontWeight: '400',
            color: COLORS.black,
            textAlign: 'center',
          }}
        >
          Welcome to PetCare & Grooming
        </Text>
        <Text
          style={{
            fontSize: normalize(16),
            fontWeight: '400',
            color: COLORS.black,
            textAlign: 'center',
          }}
        >
          Where all your pet's needs are right here!
        </Text>

        <View>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: normalize(250), height: normalize(270) }}
          />
        </View>

        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: normalize(20),
            marginTop: normalize(50),
          }}
        >
          <Button
            variant="success"
            style={{
              width: normalize(200),
              height: normalize(50),
            }}
            onPress={() => navigation.navigate('Register')}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: normalize(16),
                fontWeight: 'bold',
              }}
            >
              Create Account
            </Text>
          </Button>
          <Button
            variant="other"
            style={{
              width: normalize(200),
              height: normalize(50),
              backgroundColor: COLORS.white,
              borderColor: COLORS.blue1,
            }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text
              style={{
                color: COLORS.blue1,
                fontSize: normalize(16),
                fontWeight: 'bold',
              }}
            >
              Login
            </Text>
          </Button>
        </View>

        <Text
          style={{
            fontSize: normalize(16),
            color: COLORS.black,
            textAlign: 'center',
            fontWeight: '300',
            marginTop: normalize(20),
          }}
        >
          Trouble singing in?
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: normalize(5),
            marginTop: normalize(30),
          }}
        >
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '300',
              color: COLORS.black,
            }}
          >
            Continue as a guest
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
