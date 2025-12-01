import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from 'react-native';
import React, { useState } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { signInWithEmail, signInWithGoogle } from '../../utils/auth';

export default function Login({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    try {
      await signInWithEmail(email, password);
      ToastAndroid.show('Login successful', ToastAndroid.SHORT);
      navigation.navigate('Home');
    } catch (e) {
      // errors are already alerted in auth util
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      ToastAndroid.show('Login with Google successful', ToastAndroid.SHORT);
      navigation.navigate('Home');
    } catch (e) {
      // errors are already alerted in auth util
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
          Welcome Back!
        </Text>
        <View
          style={{
            width: '100%',
            paddingHorizontal: normalize(20),
            marginTop: normalize(50),
          }}
        >
          <Input
            label=""
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ backgroundColor: COLORS.secondary }}
          />
          <Input
            label=""
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            style={{ backgroundColor: COLORS.secondary }}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: normalize(20),
            }}
          >
            <Text style={{ color: COLORS.black, fontSize: normalize(14) }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
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
            onPress={handleLogin}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: normalize(16),
                fontWeight: 'bold',
              }}
            >
              LOG IN
            </Text>
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
            onPress={handleGoogleLogin}
          >
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
          </Button>
        </View>
      </View>
    </View>
  );
}
