import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import BottomTabsBar from '../../components/BottomTabsBar';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../../config/firebase';

type FilterStatus = 'all' | 'pending' | 'paid' | 'cancelled';

export default function Activity({ navigation }: { navigation: any }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all');

  const formatDate = (date: any): string => {
    if (!date) return '';

    let dateObj: Date;

    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date._seconds) {
      dateObj = new Date(
        date._seconds * 1000 + (date._nanoseconds || 0) / 1000000,
      );
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
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

  const loadTransactions = useCallback(async () => {
    let mounted = true;
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        if (mounted) {
          setTransactions([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      // Load grooming bookings
      const groomingSnapshot = await firestore()
        .collection('groomingBookings')
        .where('userId', '==', currentUser.uid)
        .get();

      // Load boarding bookings
      const boardingSnapshot = await firestore()
        .collection('boardingBookings')
        .where('userId', '==', currentUser.uid)
        .get();

      if (mounted) {
        const groomingTransactions = groomingSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'grooming',
          serviceType: doc.data().serviceType || 'Grooming',
          petName: doc.data().petName || '',
          petType: doc.data().petType || '',
          address: doc.data().address || '',
          selectedDate: doc.data().selectedDate,
          status: doc.data().status || 'pending',
          paymentMethod: doc.data().paymentMethod || '',
          totalCost: doc.data().totalCost || 0,
          createdAt: doc.data().createdAt,
          updatedAt: doc.data().updatedAt,
        }));

        const boardingTransactions = boardingSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: 'boarding',
            serviceType: 'Pet Boarding',
            petName: data.petName || '',
            petType: data.petType || '',
            roomType: data.roomType || '',
            checkInDate: data.checkInDate,
            checkOutDate: data.checkOutDate,
            totalDays: data.totalDays || 0,
            status: data.status || 'pending',
            paymentMethod: data.paymentMethod || '',
            totalPrice: data.totalPrice || data.paymentAmount || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        // Combine and sort by createdAt (newest first)
        const allTransactions = [
          ...groomingTransactions,
          ...boardingTransactions,
        ];

        allTransactions.sort((a: any, b: any) => {
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

          return bTime - aTime; // Descending order (newest first)
        });

        setTransactions(allTransactions);
        setLoading(false);
        setRefreshing(false);
      }
    } catch (error: any) {
      console.warn('Failed to load transactions:', error);
      if (mounted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
  };

  // Filter transactions based on selected filter
  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'all') {
      return transactions;
    }
    return transactions.filter(
      transaction => transaction.status?.toLowerCase() === selectedFilter,
    );
  }, [transactions, selectedFilter]);

  const filterOptions: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Cancelled', value: 'cancelled' },
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
          Transaction Activity
        </Text>
      </View>

      {/* Filter Buttons - Horizontal Scrollable */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: normalize(20),
          gap: normalize(10),
          paddingBottom: 0,
        }}
        style={{
          marginBottom: 0,
        }}
      >
        {filterOptions.map(filter => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => setSelectedFilter(filter.value)}
            style={{
              paddingVertical: normalize(6),
              paddingHorizontal: normalize(16),
              borderRadius: normalize(8),
              backgroundColor:
                selectedFilter === filter.value
                  ? COLORS.blue1
                  : COLORS.white,
              borderWidth: 1,
              borderColor:
                selectedFilter === filter.value
                  ? COLORS.blue1
                  : COLORS.secondary,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: normalize(70),
              height: normalize(36),
            }}
          >
            <Text
              style={{
                fontSize: normalize(14),
                fontWeight: '600',
                color:
                  selectedFilter === filter.value
                    ? COLORS.white
                    : COLORS.black,
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transaction List */}
      {loading ? (
        <View
          style={{
            // flex: 1,
            // justifyContent: 'center',
            // alignItems: 'center',
            padding: normalize(40),
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
            Loading transactions...
          </Text>
        </View>
      ) : filteredTransactions.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          // style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: normalize(100) }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.blue1]}
            />
          }
        >
          {filteredTransactions.map(transaction => (
            <View
              key={transaction.id}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: normalize(15),
                padding: normalize(20),
                marginBottom: normalize(20),
                borderWidth: 1,
                borderColor: COLORS.secondary,
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {/* Service Type and Status */}
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
                    {transaction.serviceType}
                  </Text>
                  <Text
                    style={{
                      fontSize: normalize(14),
                      fontWeight: '500',
                      color: COLORS.gray,
                    }}
                  >
                    {transaction.petName} ({transaction.petType})
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: getStatusColor(transaction.status),
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
                    {getStatusText(transaction.status)}
                  </Text>
                </View>
              </View>

              {/* Transaction Details */}
              <View style={{ marginBottom: normalize(10) }}>
                {transaction.type === 'grooming' ? (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: normalize(8),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: normalize(14),
                          color: COLORS.gray,
                        }}
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
                        {formatDate(transaction.selectedDate)}
                      </Text>
                    </View>
                    {transaction.address && (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: normalize(8),
                        }}
                      >
                        <Text
                          style={{
                            fontSize: normalize(14),
                            color: COLORS.gray,
                          }}
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
                          {transaction.address}
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
                        {formatCurrency(transaction.totalCost)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: normalize(8),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: normalize(14),
                          color: COLORS.gray,
                        }}
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
                        {transaction.roomType}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: normalize(8),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: normalize(14),
                          color: COLORS.gray,
                        }}
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
                        {formatDate(transaction.checkInDate)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: normalize(8),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: normalize(14),
                          color: COLORS.gray,
                        }}
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
                        {formatDate(transaction.checkOutDate)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: normalize(8),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: normalize(14),
                          color: COLORS.gray,
                        }}
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
                        {transaction.totalDays} days
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
                        {formatCurrency(transaction.totalPrice)}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Payment Method and Date */}
              {transaction.paymentMethod && (
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
                      fontSize: normalize(12),
                      color: COLORS.gray,
                    }}
                  >
                    Payment Method: {transaction.paymentMethod}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: normalize(5),
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(12),
                    color: COLORS.gray,
                  }}
                >
                  Created: {formatDate(transaction.createdAt)}
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
            padding: normalize(40),
          }}
        >
          <Text
            style={{
              fontSize: normalize(18),
              color: COLORS.gray,
              textAlign: 'center',
            }}
          >
            {transactions.length === 0
              ? 'No transactions yet'
              : `No ${selectedFilter === 'all' ? '' : selectedFilter} transactions`}
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
              textAlign: 'center',
              marginTop: normalize(10),
            }}
          >
            {transactions.length === 0
              ? 'Your grooming and boarding transactions will appear here'
              : `Try selecting a different filter`}
          </Text>
        </View>
      )}
      <BottomTabsBar />
    </View>
  );
}
