import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import normalize from 'react-native-normalize';
import { COLORS } from '../config/color';
import Home from '../screens/Home/Home';
import Find from '../screens/Find/Find';
import Info from '../screens/Info/Info';
import Chat from '../screens/Chat/Chat';

const Tab = createBottomTabNavigator();

export type BottomTabParamList = {
  Home: undefined;
  Find: undefined;
  Info: undefined;
  Chat: undefined;
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.blue1,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.secondary,
          height: normalize(60),
          paddingBottom: normalize(8),
          paddingTop: normalize(8),
        },
        tabBarLabelStyle: {
          fontSize: normalize(12),
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/icons/home-inactive.png')}
              style={{
                width: normalize(40),
                height: normalize(40),
                opacity: focused ? 1 : 0.6,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Find"
        component={Find}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/icons/find-active.png')
                  : require('../assets/icons/find-inactive.png')
              }
              style={{
                width: normalize(40),
                height: normalize(40),
                opacity: focused ? 1 : 0.6,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Info"
        component={Info}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/icons/info-active.png')
                  : require('../assets/icons/info-inactive.png')
              }
              style={{
                width: normalize(40),
                height: normalize(40),
                opacity: focused ? 1 : 0.6,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../assets/icons/chat-active.png')
                  : require('../assets/icons/chat-inactive.png')
              }
              style={{
                width: normalize(40),
                height: normalize(40),
                opacity: focused ? 1 : 0.6,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

