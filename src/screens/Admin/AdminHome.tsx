import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import { auth } from '../../config/firebase';
import firestore from '@react-native-firebase/firestore';

export default function AdminHome({ navigation }: { navigation: any }) {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPets: 0,
    totalGroomingBookings: 0,
    totalBoardingBookings: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    let mounted = true;
    try {
      setLoading(true);

      // Load all users count
      const usersSnapshot = await firestore()
        .collection('users')
        .get();

      // Load all pets count
      const petsSnapshot = await firestore()
        .collection('pets')
        .get();

      // Load grooming bookings
      const groomingSnapshot = await firestore()
        .collection('groomingBookings')
        .get();

      // Load boarding bookings
      const boardingSnapshot = await firestore()
        .collection('boardingBookings')
        .get();

      if (mounted) {
        const totalUsers = usersSnapshot.size;
        const totalPets = petsSnapshot.size;
        const totalGrooming = groomingSnapshot.size;
        const totalBoarding = boardingSnapshot.size;

        // Count pending bookings
        const pendingGrooming = groomingSnapshot.docs.filter(
          doc => doc.data().status === 'pending',
        ).length;
        const pendingBoarding = boardingSnapshot.docs.filter(
          doc => doc.data().status === 'pending',
        ).length;

        setStats({
          totalUsers,
          totalPets,
          totalGroomingBookings: totalGrooming,
          totalBoardingBookings: totalBoarding,
          pendingBookings: pendingGrooming + pendingBoarding,
        });
      }
    } catch (error: any) {
      console.warn('Failed to load admin stats:', error);
    } finally {
      if (mounted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
  };

  const currentUser = auth().currentUser;
  const isAdmin = currentUser?.email === 'admin@petcare.com';

  if (!isAdmin) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.primary,
          padding: normalize(20),
        }}
      >
        <Text
          style={{
            fontSize: normalize(18),
            color: COLORS.danger,
            textAlign: 'center',
          }}
        >
          Access Denied
        </Text>
        <Text
          style={{
            fontSize: normalize(14),
            color: COLORS.gray,
            textAlign: 'center',
            marginTop: normalize(10),
          }}
        >
          You don't have permission to access this page
        </Text>
      </View>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      color: COLORS.blue1,
      icon: require('../../assets/icons/woman-icon.png'),
    },
    {
      title: 'Total Pets',
      value: stats.totalPets,
      color: COLORS.green3,
      icon: require('../../assets/icons/dog-icon.png'),
    },
    {
      title: 'Grooming Bookings',
      value: stats.totalGroomingBookings,
      color: COLORS.warning,
      icon: require('../../assets/images/stetoscop.png'),
    },
    {
      title: 'Boarding Bookings',
      value: stats.totalBoardingBookings,
      color: COLORS.tosca,
      icon: require('../../assets/images/daycare.png'),
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      color: COLORS.danger,
      icon: require('../../assets/icons/bell.png'),
    },
  ];

  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
        padding: normalize(20),
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: normalize(30),
        }}
      >
        <View>
          <Text
            style={{
              fontSize: normalize(28),
              fontWeight: '700',
              color: COLORS.black,
            }}
          >
            Admin Dashboard
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
              marginTop: normalize(5),
            }}
          >
            Welcome, {currentUser?.email}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            auth().signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome1' }],
            });
          }}
          style={{
            backgroundColor: COLORS.danger,
            paddingVertical: normalize(8),
            paddingHorizontal: normalize(15),
            borderRadius: normalize(8),
          }}
        >
          <Text
            style={{
              color: COLORS.white,
              fontSize: normalize(12),
              fontWeight: '600',
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={COLORS.blue1} />
          <Text
            style={{
              marginTop: normalize(20),
              fontSize: normalize(16),
              color: COLORS.gray,
            }}
          >
            Loading statistics...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.blue1]}
            />
          }
          contentContainerStyle={{ paddingBottom: normalize(100) }}
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: normalize(15),
            }}
          >
            {statCards.map((stat, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: normalize(15),
                  padding: normalize(20),
                  width: '48%',
                  borderWidth: 1,
                  borderColor: COLORS.secondary,
                  shadowColor: COLORS.black,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: normalize(10),
                  }}
                >
                  <View
                    style={{
                      backgroundColor: stat.color + '20',
                      padding: normalize(10),
                      borderRadius: normalize(10),
                    }}
                  >
                    <Image
                      source={stat.icon}
                      style={{
                        width: normalize(24),
                        height: normalize(24),
                        tintColor: stat.color,
                      }}
                    />
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: normalize(32),
                    fontWeight: '700',
                    color: stat.color,
                    marginBottom: normalize(5),
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontSize: normalize(14),
                    color: COLORS.gray,
                    fontWeight: '500',
                  }}
                >
                  {stat.title}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View
            style={{
              marginTop: normalize(30),
              backgroundColor: COLORS.white,
              borderRadius: normalize(15),
              padding: normalize(20),
              borderWidth: 1,
              borderColor: COLORS.secondary,
            }}
          >
            <Text
              style={{
                fontSize: normalize(20),
                fontWeight: '600',
                color: COLORS.black,
                marginBottom: normalize(15),
              }}
            >
              Quick Actions
            </Text>
            <View style={{ gap: normalize(10) }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ListUsers')}
                style={{
                  backgroundColor: COLORS.info,
                  padding: normalize(15),
                  borderRadius: normalize(10),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '600',
                    color: COLORS.black,
                  }}
                >
                  View All Users
                </Text>
                <Text style={{ fontSize: normalize(20) }}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('ListPets')}
                style={{
                  backgroundColor: COLORS.lightGreen,
                  padding: normalize(15),
                  borderRadius: normalize(10),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '600',
                    color: COLORS.black,
                  }}
                >
                  View All Pets
                </Text>
                <Text style={{ fontSize: normalize(20) }}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('ListGroomingBookings')}
                style={{
                  backgroundColor: COLORS.warning + '40',
                  padding: normalize(15),
                  borderRadius: normalize(10),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '600',
                    color: COLORS.black,
                  }}
                >
                  View Grooming Bookings
                </Text>
                <Text style={{ fontSize: normalize(20) }}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('ListBoardingBookings')}
                style={{
                  backgroundColor: COLORS.tosca + '40',
                  padding: normalize(15),
                  borderRadius: normalize(10),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '600',
                    color: COLORS.black,
                  }}
                >
                  View Boarding Bookings
                </Text>
                <Text style={{ fontSize: normalize(20) }}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('ListPendingBookings')}
                style={{
                  backgroundColor: COLORS.danger + '40',
                  padding: normalize(15),
                  borderRadius: normalize(10),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '600',
                    color: COLORS.black,
                  }}
                >
                  View Pending Bookings
                </Text>
                <Text style={{ fontSize: normalize(20) }}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Activity')}
                style={{
                  backgroundColor: COLORS.blue1 + '40',
                  padding: normalize(15),
                  borderRadius: normalize(10),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '600',
                    color: COLORS.black,
                  }}
                >
                  View All Transactions
                </Text>
                <Text style={{ fontSize: normalize(20) }}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('ListPetcareLocations')}
                style={{
                  backgroundColor: COLORS.textGreen + '40',
                  padding: normalize(15),
                  borderRadius: normalize(10),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(16),
                    fontWeight: '600',
                    color: COLORS.black,
                  }}
                >
                  View Petcare Locations
                </Text>
                <Text style={{ fontSize: normalize(20) }}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
