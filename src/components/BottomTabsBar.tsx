import { View, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../config/color';

export default function BottomTabsBar() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const tabs = [
    {
      name: 'Home',
      icon: require('../assets/icons/home-inactive.png'),
      screen: 'MainTabs',
      tab: 'Home',
    },
    {
      name: 'Find',
      icon: require('../assets/icons/find-inactive.png'),
      activeIcon: require('../assets/icons/find-active.png'),
      screen: 'MainTabs',
      tab: 'Find',
    },
    {
      name: 'Info',
      icon: require('../assets/icons/info-inactive.png'),
      activeIcon: require('../assets/icons/info-active.png'),
      screen: 'MainTabs',
      tab: 'Info',
    },
    {
      name: 'Chat',
      icon: require('../assets/icons/chat-inactive.png'),
      activeIcon: require('../assets/icons/chat-active.png'),
      screen: 'MainTabs',
      tab: 'Chat',
    },
  ];

  // Get current route name to determine active tab
  const getCurrentRouteName = () => {
    try {
      const routeName = route.name;
      const state = navigation.getState();
      
      // If we're in MainTabs, get the active tab from navigation state
      if (routeName === 'MainTabs') {
        const mainTabsState = state.routes.find((r: any) => r.name === 'MainTabs');
        if (mainTabsState?.state) {
          const tabState = mainTabsState.state;
          const activeRoute = tabState.routes[tabState.index];
          return activeRoute?.name;
        }
      }
      
      // Check if we're in a nested screen within MainTabs
      const mainTabsRoute = state.routes.find((r: any) => r.name === 'MainTabs');
      if (mainTabsRoute?.state) {
        const tabState = mainTabsRoute.state;
        const activeTab = tabState.routes[tabState.index]?.name;
        // If current route is not MainTabs but we're in a stack screen, return the active tab
        if (activeTab) {
          return activeTab;
        }
      }
      
      // For other screens, check if they're related to Info tab
      if (routeName === 'ListInformation' || routeName === 'PetVaccination' || 
          routeName === 'PastVaccinations' || routeName === 'VaccinationDetail' ||
          routeName === 'GroomingPlan' || routeName === 'InputFormGrooming' ||
          routeName === 'GroomingPayment' || routeName === 'BoardingPlan') {
        return 'Info';
      }
      
      return routeName;
    } catch (error) {
      return route.name;
    }
  };

  const currentRouteName = getCurrentRouteName();

  const handleTabPress = (tab: any) => {
    try {
      // Get root navigator
      const rootNavigation = navigation.getParent() || navigation;
      
      // Navigate to MainTabs with specific tab
      rootNavigation.navigate('MainTabs', {
        screen: tab.tab,
      });
    } catch (error) {
      console.log('Navigation error:', error);
      // Fallback: simple navigate
      navigation.navigate('MainTabs');
    }
  };

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.secondary,
        height: normalize(60),
        paddingBottom: normalize(8),
        paddingTop: normalize(8),
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = currentRouteName === tab.name || currentRouteName === tab.tab;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleTabPress(tab)}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}
            activeOpacity={0.7}
          >
            <Image
              source={
                isActive && tab.activeIcon
                  ? tab.activeIcon
                  : tab.icon
              }
              style={{
                width: normalize(40),
                height: normalize(40),
                opacity: isActive ? 1 : 0.6,
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

