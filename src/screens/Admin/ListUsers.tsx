import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import BottomTabsBar from '../../components/BottomTabsBar';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../../config/firebase';

export default function ListUsers({ navigation }: { navigation: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => {
    let mounted = true;
    try {
      setLoading(true);

      const usersSnapshot = await firestore()
        .collection('users')
        .get();

      if (mounted) {
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by createdAt (newest first)
        usersData.sort((a: any, b: any) => {
          let aTime = 0;
          let bTime = 0;

          if (a.createdAt) {
            if (typeof a.createdAt.toMillis === 'function') {
              aTime = a.createdAt.toMillis();
            } else if (a.createdAt._seconds) {
              aTime =
                a.createdAt._seconds * 1000 +
                (a.createdAt._nanoseconds || 0) / 1000000;
            }
          }

          if (b.createdAt) {
            if (typeof b.createdAt.toMillis === 'function') {
              bTime = b.createdAt.toMillis();
            } else if (b.createdAt._seconds) {
              bTime =
                b.createdAt._seconds * 1000 +
                (b.createdAt._nanoseconds || 0) / 1000000;
            }
          }

          return bTime - aTime;
        });

        setUsers(usersData);
      }
    } catch (error: any) {
      console.warn('Failed to load users:', error);
    } finally {
      if (mounted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
  };

  const formatDate = (date: any): string => {
    if (!date) return 'N/A';

    let dateObj: Date;

    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date._seconds) {
      dateObj = new Date(
        date._seconds * 1000 + (date._nanoseconds || 0) / 1000000,
      );
    } else {
      return 'N/A';
    }

    return dateObj.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: normalize(20),
        }}
      >
        <BackButton onPress={() => navigation.goBack()} />
        <Text
          style={{
            fontSize: normalize(24),
            fontWeight: '600',
            color: COLORS.black,
            marginLeft: normalize(15),
          }}
        >
          All Users ({users.length})
        </Text>
      </View>

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
            Loading users...
          </Text>
        </View>
      ) : users.length > 0 ? (
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
          {users.map(user => (
            <View
              key={user.id}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: normalize(15),
                padding: normalize(20),
                marginBottom: normalize(15),
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
                  alignItems: 'flex-start',
                  marginBottom: normalize(10),
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: normalize(18),
                      fontWeight: '700',
                      color: COLORS.black,
                      marginBottom: normalize(5),
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text
                    style={{
                      fontSize: normalize(14),
                      color: COLORS.gray,
                      marginBottom: normalize(5),
                    }}
                  >
                    {user.email}
                  </Text>
                  <Text
                    style={{
                      fontSize: normalize(12),
                      color: COLORS.gray,
                    }}
                  >
                    ID: {user.id}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  marginTop: normalize(10),
                  paddingTop: normalize(10),
                  borderTopWidth: 1,
                  borderTopColor: COLORS.secondary,
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(12),
                    color: COLORS.gray,
                  }}
                >
                  Created: {formatDate(user.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: normalize(18),
              color: COLORS.gray,
              textAlign: 'center',
            }}
          >
            No users found
          </Text>
        </View>
      )}
    </View>
  );
}
