import {
  View,
  Text,
  ScrollView,
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

export default function ListGroomingBookings({
  navigation,
}: {
  navigation: any;
}) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return COLORS.green3;
      case 'pending':
        return COLORS.warning;
      case 'cancelled':
        return COLORS.danger;
      default:
        return COLORS.gray;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'PAID';
      case 'pending':
        return 'PENDING';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const loadBookings = useCallback(async () => {
    let mounted = true;
    try {
      setLoading(true);

      const bookingsSnapshot = await firestore()
        .collection('groomingBookings')
        .get();

      if (mounted) {
        const bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by createdAt (newest first)
        bookingsData.sort((a: any, b: any) => {
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

        setBookings(bookingsData);
      }
    } catch (error: any) {
      console.warn('Failed to load grooming bookings:', error);
    } finally {
      if (mounted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
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
          Grooming Bookings ({bookings.length})
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
            Loading bookings...
          </Text>
        </View>
      ) : bookings.length > 0 ? (
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
          {bookings.map(booking => (
            <View
              key={booking.id}
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
                  alignItems: 'center',
                  marginBottom: normalize(15),
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
                    {booking.petName} ({booking.petType})
                  </Text>
                  <Text
                    style={{
                      fontSize: normalize(14),
                      color: COLORS.gray,
                    }}
                  >
                    {booking.serviceType}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: getStatusColor(booking.status),
                    paddingVertical: normalize(8),
                    paddingHorizontal: normalize(15),
                    borderRadius: normalize(8),
                  }}
                >
                  <Text
                    style={{
                      fontSize: normalize(12),
                      fontWeight: '600',
                      color: COLORS.white,
                    }}
                  >
                    {getStatusText(booking.status)}
                  </Text>
                </View>
              </View>

              <View style={{ gap: normalize(8) }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: normalize(14), color: COLORS.gray }}>
                    Service Date:
                  </Text>
                  <Text
                    style={{
                      fontSize: normalize(14),
                      fontWeight: '500',
                      color: COLORS.black,
                    }}
                  >
                    {formatDate(booking.selectedDate)}
                  </Text>
                </View>
                {booking.address && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{ fontSize: normalize(14), color: COLORS.gray }}
                    >
                      Address:
                    </Text>
                    <Text
                      style={{
                        fontSize: normalize(14),
                        fontWeight: '500',
                        color: COLORS.black,
                        flex: 1,
                        textAlign: 'right',
                        marginLeft: normalize(10),
                      }}
                    >
                      {booking.address}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: normalize(10),
                    paddingTop: normalize(10),
                    borderTopWidth: 1,
                    borderTopColor: COLORS.secondary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: normalize(16),
                      fontWeight: '600',
                      color: COLORS.black,
                    }}
                  >
                    Total:
                  </Text>
                  <Text
                    style={{
                      fontSize: normalize(16),
                      fontWeight: '700',
                      color: COLORS.blue1,
                    }}
                  >
                    {formatCurrency(booking.totalCost || 0)}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: normalize(5),
                    paddingTop: normalize(5),
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
                    User ID: {booking.userId}
                  </Text>
                  <Text
                    style={{
                      fontSize: normalize(12),
                      color: COLORS.gray,
                      marginTop: normalize(3),
                    }}
                  >
                    Created: {formatDate(booking.createdAt)}
                  </Text>
                </View>
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
            No grooming bookings found
          </Text>
        </View>
      )}
    </View>
  );
}
