import {
  View,
  Text,
  Alert,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { sendPasswordResetEmail } from '@react-native-firebase/auth';
import { auth } from '../../config/firebase';

export default function ForgotPassword({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter email');
      return;
    }
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth(), email);
      ToastAndroid.show('Password reset email sent', ToastAndroid.SHORT);
      setIsLoading(false);
      setCooldown(60);
    } catch (e: any) {
      // errors are already alerted in auth util
      ToastAndroid.show(e.message ?? 'Something went wrong', ToastAndroid.LONG);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);
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
          Forgot Password?
        </Text>
        <Text
          style={{
            fontSize: normalize(16),
            fontWeight: '400',
            color: COLORS.black,
            textAlign: 'center',
          }}
        >
          Enter your email to reset your password
        </Text>
        <View
          style={{
            width: '100%',
            paddingHorizontal: normalize(20),
          }}
        >
          <Input
            label=""
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ backgroundColor: COLORS.secondary }}
          />
          <Button
            variant="success"
            style={{
              width: '100%',
              height: normalize(50),
              marginTop: normalize(20),
              borderWidth: 1,
              borderColor: COLORS.black,
              elevation: 2,
            }}
            onPress={handleForgotPassword}
            disabled={isLoading || cooldown > 0}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: normalize(16),
                  fontWeight: 'bold',
                }}
              >
                {cooldown > 0
                  ? `RESEND IN ${cooldown}s`
                  : 'SEND RESET LINK'}
              </Text>
            )}
          </Button>
        </View>
      </View>
    </View>
  );
}
