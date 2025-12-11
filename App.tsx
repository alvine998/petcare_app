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
import PastVaccinations from './src/screens/Pet/Vaccination/PastVaccinations';
import VaccinationDetail from './src/screens/Pet/Vaccination/VaccinationDetail';
import GroomingPlan from './src/screens/Pet/Grooming/GroomingPlan';
import InputFormGrooming from './src/screens/Pet/Grooming/InputFormGrooming';
import GroomingPayment from './src/screens/Pet/Grooming/GroomingPayment';
import GroomingSuccess from './src/screens/Pet/Grooming/GroomingSuccess';
import BoardingPlan from './src/screens/Pet/PetBoarding/BoardingPlan';
import BoardingBookingForm from './src/screens/Pet/PetBoarding/BoardingBookingForm';
import BoardingPayment from './src/screens/Pet/PetBoarding/BoardingPayment';
import BoardingSuccess from './src/screens/Pet/PetBoarding/BoardingSuccess';
import AppointmentRequest from './src/screens/Find/AppointmentRequest';
import AppointmentSuccess from './src/screens/Find/AppointmentSuccess';
import ArticleDetail from './src/screens/Chat/ArticleDetail';
import Activity from './src/screens/Activity/Activity';
import AdminHome from './src/screens/Admin/AdminHome';
import ListUsers from './src/screens/Admin/ListUsers';
import ListPets from './src/screens/Admin/ListPets';
import ListGroomingBookings from './src/screens/Admin/ListGroomingBookings';
import ListBoardingBookings from './src/screens/Admin/ListBoardingBookings';
import ListPendingBookings from './src/screens/Admin/ListPendingBookings';
import ListPetcareLocations from './src/screens/Admin/ListPetcareLocations';
import AddPetcareLocation from './src/screens/Admin/AddPetcareLocation';
import EditPetcareLocation from './src/screens/Admin/EditPetcareLocation';

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
  PetVaccination: { petId: string };
  PastVaccinations: { petId: string };
  VaccinationDetail: { petId: string; vaccinationId: string; vaccination?: any };
  GroomingPlan: { petId: string };
  InputFormGrooming: { petId: string; planId: number };
  GroomingPayment: { petId: string; planId: number; bookingData?: any };
  GroomingSuccess: { petId: string; planId: number; bookingData?: any; paymentMethod?: string; totalCost?: number };
  BoardingPlan: { petId: string };
  BoardingBookingForm: { petId: string; roomId: number; roomType: string; petType: string; price: number };
  BoardingPayment: { petId: string; roomId: number; bookingData?: any };
  BoardingSuccess: { petId: string; roomId: number; bookingData?: any; paymentMethod?: string; totalPrice?: number };
  AppointmentRequest: { location?: any };
  AppointmentSuccess: { location?: any; appointmentDate?: any; appointmentTime?: any };
  ArticleDetail: { article?: any };
  Activity: undefined;
  AdminHome: undefined;
  ListUsers: undefined;
  ListPets: undefined;
  ListGroomingBookings: undefined;
  ListBoardingBookings: undefined;
  ListPendingBookings: undefined;
  ListPetcareLocations: undefined;
  AddPetcareLocation: undefined;
  EditPetcareLocation: { locationId: string };
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
        <Stack.Screen name="PastVaccinations" component={PastVaccinations} />
        <Stack.Screen name="VaccinationDetail" component={VaccinationDetail} />
        <Stack.Screen name="GroomingPlan" component={GroomingPlan} />
        <Stack.Screen name="InputFormGrooming" component={InputFormGrooming} />
        <Stack.Screen name="GroomingPayment" component={GroomingPayment} />
        <Stack.Screen name="GroomingSuccess" component={GroomingSuccess} />
        <Stack.Screen name="BoardingPlan" component={BoardingPlan} />
        <Stack.Screen name="BoardingBookingForm" component={BoardingBookingForm} />
        <Stack.Screen name="BoardingPayment" component={BoardingPayment} />
        <Stack.Screen name="BoardingSuccess" component={BoardingSuccess} />
        <Stack.Screen name="AppointmentRequest" component={AppointmentRequest} />
        <Stack.Screen name="AppointmentSuccess" component={AppointmentSuccess} />
        <Stack.Screen name="ArticleDetail" component={ArticleDetail} />
        <Stack.Screen name="Activity" component={Activity} />
        <Stack.Screen name="AdminHome" component={AdminHome} />
        <Stack.Screen name="ListUsers" component={ListUsers} />
        <Stack.Screen name="ListPets" component={ListPets} />
        <Stack.Screen name="ListGroomingBookings" component={ListGroomingBookings} />
        <Stack.Screen name="ListBoardingBookings" component={ListBoardingBookings} />
        <Stack.Screen name="ListPendingBookings" component={ListPendingBookings} />
        <Stack.Screen name="ListPetcareLocations" component={ListPetcareLocations} />
        <Stack.Screen name="AddPetcareLocation" component={AddPetcareLocation} />
        <Stack.Screen name="EditPetcareLocation" component={EditPetcareLocation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
