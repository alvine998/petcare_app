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
import BackButton from '../../components/BackButton';
import BottomTabsBar from '../../components/BottomTabsBar';
import firestore from '@react-native-firebase/firestore';

export default function ListPets({ navigation }: { navigation: any }) {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPets = useCallback(async () => {
    let mounted = true;
    try {
      setLoading(true);

      const petsSnapshot = await firestore()
        .collection('pets')
        .get();

      if (mounted) {
        const petsData = petsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by createdAt (newest first)
        petsData.sort((a: any, b: any) => {
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

        setPets(petsData);
      }
    } catch (error: any) {
      console.warn('Failed to load pets:', error);
    } finally {
      if (mounted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPets();
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
          All Pets ({pets.length})
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
            Loading pets...
          </Text>
        </View>
      ) : pets.length > 0 ? (
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
          {pets.map(pet => (
            <View
              key={pet.id}
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
                  alignItems: 'center',
                  marginBottom: normalize(15),
                }}
              >
                <View
                  style={{
                    width: normalize(60),
                    height: normalize(60),
                    borderRadius: normalize(10),
                    backgroundColor: COLORS.lightGreen,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: normalize(15),
                    overflow: 'hidden',
                  }}
                >
                  {pet.photoURL ? (
                    <Image
                      source={{ uri: pet.photoURL }}
                      style={{
                        width: normalize(60),
                        height: normalize(60),
                        borderRadius: normalize(10),
                      }}
                      resizeMode="cover"
                    />
                  ) : pet?.species === 'cat' ? (
                    <Image
                      source={require('../../assets/icons/cat-icon.png')}
                      style={{ width: normalize(30), height: normalize(30) }}
                    />
                  ) : (
                    <Image
                      source={require('../../assets/icons/dog-icon.png')}
                      style={{ width: normalize(30), height: normalize(30) }}
                    />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: normalize(18),
                      fontWeight: '700',
                      color: COLORS.black,
                      marginBottom: normalize(5),
                    }}
                  >
                    {pet.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: normalize(14),
                      color: COLORS.gray,
                    }}
                  >
                    {pet.species} • {pet.breed || 'Unknown breed'}
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
                  Created: {formatDate(pet.createdAt)}
                </Text>
                <Text
                  style={{
                    fontSize: normalize(12),
                    color: COLORS.gray,
                    marginTop: normalize(5),
                  }}
                >
                  Owner ID: {pet.userId}
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
            No pets found
          </Text>
        </View>
      )}
    </View>
  );
}
