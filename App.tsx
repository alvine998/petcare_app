import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import Welcome1 from './src/screens/Welcome/Welcome1';
import Welcome2 from './src/screens/Welcome/Welcome2';
import Login from './src/screens/Login/Login';
import Register from './src/screens/Register/Register';
import CreatePet from './src/screens/Pet/CreatePet';
import EnableLocation from './src/screens/Enabling/EnableLocation';
import EnableNotification from './src/screens/Enabling/EnableNotification';
import Home from './src/screens/Home/Home';

enableScreens(true);

export type RootStackParamList = {
  Welcome1: undefined;
  Welcome2: undefined;
  Login: undefined;
  Register: undefined;
  EnableLocation: undefined;
  EnableNotification: undefined;
  CreatePet: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome1"
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome1" component={Welcome1} />
        <Stack.Screen name="Welcome2" component={Welcome2} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="EnableLocation" component={EnableLocation} />
        <Stack.Screen
          name="EnableNotification"
          component={EnableNotification}
        />
        <Stack.Screen name="CreatePet" component={CreatePet} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
