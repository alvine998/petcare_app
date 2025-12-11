import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import BottomTabsBar from '../../components/BottomTabsBar';
import firestore from '@react-native-firebase/firestore';

export default function ListPendingBookings({
  navigation,
}: {
  navigation: any;
}) {
  const [groomingBookings, setGroomingBookings] = useState<any[]>([]);
  const [boardingBookings, setBoardingBookings] = useState<any[]>([]);
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

  const loadBookings = useCallback(async () => {
    let mounted = true;
    try {
      setLoading(true);

      // Load pending grooming bookings
      const groomingSnapshot = await firestore()
        .collection('groomingBookings')
        .where('status', '==', 'pending')
        .get();

      // Load pending boarding bookings
      const boardingSnapshot = await firestore()
        .collection('boardingBookings')
        .where('status', '==', 'pending')
        .get();

      if (mounted) {
        const groomingData = groomingSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'grooming',
          ...doc.data(),
        }));

        const boardingData = boardingSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'boarding',
          ...doc.data(),
        }));

        // Sort by createdAt (newest first)
        const sortByDate = (a: any, b: any) => {
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
        };

        groomingData.sort(sortByDate);
        boardingData.sort(sortByDate);

        setGroomingBookings(groomingData);
        setBoardingBookings(boardingData);
      }
    } catch (error: any) {
      console.warn('Failed to load pending bookings:', error);
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

  const allPendingBookings = useMemo(() => {
    return [...groomingBookings, ...boardingBookings].sort((a: any, b: any) => {
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
  }, [groomingBookings, boardingBookings]);

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
          Pending Bookings ({allPendingBookings.length})
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
            Loading pending bookings...
          </Text>
        </View>
      ) : allPendingBookings.length > 0 ? (
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
          {allPendingBookings.map(booking => (
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
                    {booking.type === 'grooming'
                      ? booking.serviceType
                      : 'Pet Boarding'}
                  </Text>
                  <Text
                    style={{
                      fontSize: normalize(14),
                      color: COLORS.gray,
                    }}
                  >
                    {booking.petName} ({booking.petType})
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: COLORS.warning,
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
                    PENDING
                  </Text>
                </View>
              </View>

              {booking.type === 'grooming' ? (
                <View style={{ gap: normalize(8) }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{ fontSize: normalize(14), color: COLORS.gray }}
                    >
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
                </View>
              ) : (
                <View style={{ gap: normalize(8) }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{ fontSize: normalize(14), color: COLORS.gray }}
                    >
                      Room Type:
                    </Text>
                    <Text
                      style={{
                        fontSize: normalize(14),
                        fontWeight: '500',
                        color: COLORS.black,
                      }}
                    >
                      {booking.roomType}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{ fontSize: normalize(14), color: COLORS.gray }}
                    >
                      Check-in:
                    </Text>
                    <Text
                      style={{
                        fontSize: normalize(14),
                        fontWeight: '500',
                        color: COLORS.black,
                      }}
                    >
                      {formatDate(booking.checkInDate)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{ fontSize: normalize(14), color: COLORS.gray }}
                    >
                      Check-out:
                    </Text>
                    <Text
                      style={{
                        fontSize: normalize(14),
                        fontWeight: '500',
                        color: COLORS.black,
                      }}
                    >
                      {formatDate(booking.checkOutDate)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{ fontSize: normalize(14), color: COLORS.gray }}
                    >
                      Duration:
                    </Text>
                    <Text
                      style={{
                        fontSize: normalize(14),
                        fontWeight: '500',
                        color: COLORS.black,
                      }}
                    >
                      {booking.totalDays || 0} days
                    </Text>
                  </View>
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
                      {formatCurrency(
                        booking.totalPrice || booking.paymentAmount || 0,
                      )}
                    </Text>
                  </View>
                </View>
              )}

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
            No pending bookings found
          </Text>
        </View>
      )}
    </View>
  );
}
