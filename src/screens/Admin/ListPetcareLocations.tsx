import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import firestore from '@react-native-firebase/firestore';

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  long: number;
  schedule?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export default function ListPetcareLocations({
  navigation,
}: {
  navigation: any;
}) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (locationId: string, locationName: string) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${locationName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(locationId);
              await firestore().collection('locations').doc(locationId).delete();

              if (Platform.OS === 'android') {
                ToastAndroid.show(
                  'Location deleted successfully!',
                  ToastAndroid.SHORT,
                );
              } else {
                Alert.alert('Success', 'Location deleted successfully!');
              }

              // Reload locations
              await loadLocations();
            } catch (error: any) {
              console.log('Error deleting location:', error);
              Alert.alert('Error', error.message || 'Failed to delete location');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const loadLocations = useCallback(async () => {
    let mounted = true;
    try {
      setLoading(true);

      const locationsSnapshot = await firestore()
        .collection('locations')
        .get();

      if (mounted) {
        const locationsData = locationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];

        // Filter and convert locations - handle both string and number lat/long
        const validLocations: Location[] = locationsData
          .map((loc: any) => {
            // Convert lat and long to numbers if they are strings
            let lat: number | null = null;
            let long: number | null = null;

            if (typeof loc.lat === 'string') {
              lat = parseFloat(loc.lat);
            } else if (typeof loc.lat === 'number') {
              lat = loc.lat;
            }

            if (typeof loc.long === 'string') {
              long = parseFloat(loc.long);
            } else if (typeof loc.long === 'number') {
              long = loc.long;
            }

            // Return location with converted lat/long
            return {
              ...loc,
              lat: lat,
              long: long,
            };
          })
          .filter((loc: any) => {
            const hasLat = loc.lat !== null && !isNaN(loc.lat);
            const hasLong = loc.long !== null && !isNaN(loc.long);
            return hasLat && hasLong;
          })
          .map((loc: any) => ({
            id: loc.id,
            lat: loc.lat as number,
            long: loc.long as number,
            name: loc.name || 'Unnamed Location',
            address: loc.address || '',
            schedule: loc.schedule || '',
            phone: loc.phone || '',
            email: loc.email || '',
            website: loc.website || '',
          })) as Location[];

        setLocations(validLocations);
      }
    } catch (error: any) {
      console.warn('Failed to load locations:', error);
    } finally {
      if (mounted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [loadLocations]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLocations();
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
          Petcare Locations ({locations.length})
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
            Loading locations...
          </Text>
        </View>
      ) : locations.length > 0 ? (
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
          {locations.map(location => (
            <View
              key={location.id}
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
                  marginBottom: normalize(15),
                }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: normalize(8),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(18),
                        fontWeight: '700',
                        color: COLORS.black,
                        flex: 1,
                      }}
                    >
                      {location.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: normalize(10),
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('EditPetcareLocation', {
                            locationId: location.id,
                          })
                        }
                        style={{
                          backgroundColor: COLORS.blue1,
                          paddingVertical: normalize(6),
                          paddingHorizontal: normalize(12),
                          borderRadius: normalize(6),
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: normalize(12),
                            fontWeight: '600',
                          }}
                        >
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(location.id, location.name)}
                        disabled={deletingId === location.id}
                        style={{
                          backgroundColor:
                            deletingId === location.id
                              ? COLORS.gray
                              : COLORS.danger,
                          paddingVertical: normalize(6),
                          paddingHorizontal: normalize(12),
                          borderRadius: normalize(6),
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: normalize(12),
                            fontWeight: '600',
                          }}
                        >
                          {deletingId === location.id ? '...' : 'Delete'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {location.address && (
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.gray,
                        marginBottom: normalize(5),
                      }}
                    >
                      📍 {location.address}
                    </Text>
                  )}
                  {location.schedule && (
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.gray,
                        marginBottom: normalize(5),
                      }}
                    >
                      🕐 {location.schedule}
                    </Text>
                  )}
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
                {location.phone && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: normalize(5),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.gray,
                        marginRight: normalize(10),
                      }}
                    >
                      📞
                    </Text>
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.black,
                      }}
                    >
                      {location.phone}
                    </Text>
                  </View>
                )}
                {location.email && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: normalize(5),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.gray,
                        marginRight: normalize(10),
                      }}
                    >
                      ✉️
                    </Text>
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.black,
                      }}
                    >
                      {location.email}
                    </Text>
                  </View>
                )}
                {location.website && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: normalize(5),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.gray,
                        marginRight: normalize(10),
                      }}
                    >
                      🌐
                    </Text>
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.blue1,
                      }}
                    >
                      {location.website}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: normalize(8),
                    paddingTop: normalize(8),
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
                    Coordinates: {location.lat.toFixed(6)}, {location.long.toFixed(6)}
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
            No locations found
          </Text>
        </View>
      )}

      {/* Add Button at Bottom */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddPetcareLocation')}
        style={{
          position: 'absolute',
          bottom: normalize(20),
          right: normalize(20),
          backgroundColor: COLORS.green3,
          width: normalize(60),
          height: normalize(60),
          borderRadius: normalize(30),
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <Text
          style={{
            color: COLORS.white,
            fontSize: normalize(30),
            fontWeight: 'bold',
          }}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}
