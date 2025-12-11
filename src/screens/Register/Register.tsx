import { View, Text, Alert, TouchableOpacity, Image, ToastAndroid, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { signUpWithEmail, signInWithGoogle } from '../../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Register({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      await signUpWithEmail(email, password, {
        firstName,
        lastName,
      });
      ToastAndroid.show('Register successful', ToastAndroid.SHORT);
      const hasOnboarded = await AsyncStorage.getItem('hasOnboardedPermissions');
      if (hasOnboarded === 'true') {
        navigation.navigate('MainTabs');
      } else {
        navigation.navigate('EnableLocation');
      }
    } catch (e) {
      // errors are already alerted in auth util
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      const hasOnboarded = await AsyncStorage.getItem('hasOnboardedPermissions');
      if (hasOnboarded === 'true') {
        navigation.navigate('MainTabs');
      } else {
        navigation.navigate('EnableLocation');
      }
    } catch (e) {
      // errors are already alerted in auth util
    } finally {
      setGoogleLoading(false);
    }
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
      <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <View style={{ alignItems: 'center', marginTop: normalize(50) }}>
        <Text
          style={{
            fontSize: normalize(30),
            fontWeight: '400',
            color: COLORS.black,
            textAlign: 'center',
          }}
        >
          Sign Up
        </Text>
        <View
          style={{
            width: '100%',
            paddingHorizontal: normalize(20),
            marginTop: normalize(20),
          }}
        >
          <Input
            label=""
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            style={{ backgroundColor: COLORS.secondary }}
          />
          <Input
            label=""
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            style={{ backgroundColor: COLORS.secondary }}
          />
          <Input
            label=""
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ backgroundColor: COLORS.secondary }}
          />
          <Input
            label=""
            placeholder="Password (8+ Characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            style={{ backgroundColor: COLORS.secondary }}
          />
          <Button
            variant="success"
            style={{
              width: '100%',
              height: normalize(50),
              marginTop: normalize(20),
            }}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: normalize(16),
                  fontWeight: 'bold',
                }}
              >
                CREATE ACCOUNT
              </Text>
            )}
          </Button>
          <Text
            style={{
              textAlign: 'center',
              fontSize: normalize(14),
              color: COLORS.black,
              marginTop: normalize(20),
            }}
          >
            OR
          </Text>
          {/* LOGIN WITH GOOGLE */}
          <Button
            variant="primary"
            style={{
              width: '100%',
              height: normalize(50),
              marginTop: normalize(20),
              borderWidth: 1,
              borderColor: COLORS.gray,
              elevation: 2,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: normalize(10),
            }}
            onPress={handleGoogleRegister}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={COLORS.black} />
            ) : (
              <>
                <Image
                  source={require('../../assets/icons/google.png')}
                  style={{ width: normalize(20), height: normalize(20) }}
                />
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: normalize(16),
                    fontWeight: 'bold',
                  }}
                >
                  LOGIN WITH GOOGLE
                </Text>
              </>
            )}
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
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
    </View>
  );
}
