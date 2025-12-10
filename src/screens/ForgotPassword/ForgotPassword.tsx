import {
  View,
  Text,
  Alert,
  ToastAndroid,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { auth } from '../../config/firebase';

export default function ForgotPassword({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      await auth().sendPasswordResetEmail(email);
      
      setEmailSent(true);
      setCooldown(60);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Password reset email sent! Please check your inbox.', ToastAndroid.LONG);
      } else {
        Alert.alert(
          'Email Sent',
          'Password reset email has been sent to your email address. Please check your inbox and follow the instructions to reset your password.',
        );
      }
    } catch (error: any) {
      console.log('Password reset error:', error);
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (Platform.OS === 'android') {
        ToastAndroid.show(errorMessage, ToastAndroid.LONG);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
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
              marginTop: normalize(10),
              paddingHorizontal: normalize(20),
            }}
          >
            {emailSent
              ? 'We\'ve sent a password reset link to your email. Please check your inbox and follow the instructions.'
              : 'Enter your email address and we\'ll send you a link to reset your password.'}
          </Text>

          <View
            style={{
              width: '100%',
              paddingHorizontal: normalize(20),
              marginTop: normalize(30),
            }}
          >
            <Input
              label=""
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailSent(false);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{ backgroundColor: COLORS.secondary }}
              editable={!isLoading && cooldown === 0}
            />

            {emailSent && (
              <View
                style={{
                  backgroundColor: COLORS.info,
                  padding: normalize(15),
                  borderRadius: normalize(10),
                  marginTop: normalize(15),
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(14),
                    color: COLORS.black,
                    textAlign: 'center',
                  }}
                >
                  ✓ Email sent successfully! Check your inbox.
                </Text>
              </View>
            )}

            <Button
              variant="success"
              style={{
                width: '100%',
                height: normalize(50),
                marginTop: normalize(20),
                borderWidth: 1,
                borderColor: COLORS.black,
                elevation: 2,
                opacity: isLoading || cooldown > 0 ? 0.6 : 1,
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
                    : emailSent
                    ? 'RESEND EMAIL'
                    : 'SEND RESET LINK'}
                </Text>
              )}
            </Button>

            <Text
              style={{
                fontSize: normalize(14),
                color: COLORS.gray,
                textAlign: 'center',
                marginTop: normalize(20),
                paddingHorizontal: normalize(20),
              }}
            >
              Remember your password?{' '}
              <Text
                style={{
                  color: COLORS.blue1,
                  fontWeight: '600',
                }}
                onPress={() => navigation.navigate('Login')}
              >
                Back to Login
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
