import React, { useEffect } from 'react';
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
import { configureFirebase } from './src/config/firebase';
import ForgotPassword from './src/screens/ForgotPassword/ForgotPassword';
import Splash from './src/screens/Splash/Splash';
import EditProfile from './src/screens/Profile/EditProfile';
import Notification from './src/screens/Notification/Notification';
import AllPets from './src/screens/Pet/AllPets';
import EditPet from './src/screens/Pet/EditPet';
import BottomTabs from './src/navigation/BottomTabs';
import ListInformation from './src/screens/Pet/ListInformation';
import PetVaccination from './src/screens/Pet/Vaccination/PetVaccination';
import GroomingPlan from './src/screens/Pet/Grooming/GroomingPlan';
import BoardingPlan from './src/screens/Pet/PetBoarding/BoardingPlan';

enableScreens(true);

export type RootStackParamList = {
  Welcome1: undefined;
  Welcome2: undefined;
  Login: undefined;
  Register: undefined;
  EnableLocation: undefined;
  EnableNotification: undefined;
  CreatePet: undefined;
  MainTabs: undefined;
  ForgotPassword: undefined;
  Splash: undefined;
  EditProfile: undefined;
  Notification: undefined;
  AllPets: undefined;
  EditPet: { petId: string };
  ListInformation: undefined;
  PetVaccination: undefined;
  GroomingPlan: undefined;
  BoardingPlan: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    configureFirebase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={Splash} />
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
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="AllPets" component={AllPets} />
        <Stack.Screen name="EditPet" component={EditPet} />
        <Stack.Screen name="ListInformation" component={ListInformation} />
        <Stack.Screen name="PetVaccination" component={PetVaccination} />
        <Stack.Screen name="GroomingPlan" component={GroomingPlan} />
        <Stack.Screen name="BoardingPlan" component={BoardingPlan} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
