import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import Articles from './Articles';
import Testimonies from './Testimonies';

const Tab = createMaterialTopTabNavigator();

export default function Chat() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.blue1,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarIndicatorStyle: {
          backgroundColor: COLORS.blue1,
          height: normalize(3),
        },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.secondary,
        },
        tabBarLabelStyle: {
          fontSize: normalize(14),
          fontWeight: '600',
          textTransform: 'none',
        },
      }}
    >
      <Tab.Screen
        name="Articles"
        component={Articles}
        options={{
          title: 'Articles',
        }}
      />
      <Tab.Screen
        name="Testimonies"
        component={Testimonies}
        options={{
          title: 'Testimonies',
        }}
      />
    </Tab.Navigator>
  );
}

