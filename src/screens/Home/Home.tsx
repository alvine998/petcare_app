import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  BackHandler,
  Platform,
  ToastAndroid,
  TextInput,
  Alert,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../config/color';
import normalize from 'react-native-normalize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../components/Button';
import { auth } from '../../config/firebase';
import firestore from '@react-native-firebase/firestore';

export default function Home({ navigation }: { navigation: any }) {
  const [refreshing, setRefreshing] = useState(false);
  const [yourPets, setYourPets] = useState<any[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Activity',
      icon: require('../../assets/images/daycare.png'),
      navigation: 'Activity',
    },
    {
      id: 2,
      name: 'Health',
      icon: require('../../assets/images/stetoscop.png'),
      navigation: 'ListInformation',
    },
    {
      id: 3,
      name: 'Networking',
      icon: require('../../assets/images/dog-white.png'),
      navigation: 'Networking',
    },
    {
      id: 4,
      name: 'Location',
      icon: require('../../assets/images/pin-map-white.png'),
      navigation: 'Find',
    },
  ]);
  const [user, setUser] = useState();
  const [firstName, setFirstName] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [lastBackPressed, setLastBackPressed] = useState<number | null>(null);

  // Hanya aktif saat berada di Home screen
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Di iOS tidak ada hardware back, jadi biarkan default
        if (Platform.OS !== 'android') {
          return false;
        }

        const now = Date.now();

        if (lastBackPressed && now - lastBackPressed < 2000) {
          // Tekan dua kali dalam 2 detik -> keluar aplikasi
          BackHandler.exitApp();
          return true;
        }

        setLastBackPressed(now);
        ToastAndroid.show('Press again to exit', ToastAndroid.SHORT);

        // Mencegah navigasi back default
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => {
        subscription.remove();
      };
    }, [lastBackPressed]),
  );
  const loadPets = useCallback(async () => {
    let mounted = true;
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        if (mounted) {
          setYourPets([]);
        }
        return;
      }

      setLoadingPets(true);

      // Query tanpa orderBy untuk menghindari kebutuhan index
      // Sorting dilakukan di client side
      const petsSnapshot = await firestore()
        .collection('pets')
        .where('userId', '==', currentUser.uid)
        .get();

      if (mounted) {
        const petsData = petsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort secara manual berdasarkan createdAt (terbaru dulu)
        petsData.sort((a: any, b: any) => {
          let aTime = 0;
          let bTime = 0;

          // Handle Firestore Timestamp
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

        setYourPets(petsData);
      }
    } catch (error: any) {
      console.warn('Failed to load pets:', error);
      if (mounted) {
        ToastAndroid.show(
          'Failed to load pets: ' + (error.message || 'Unknown error'),
          ToastAndroid.SHORT,
        );
      }
    } finally {
      if (mounted) {
        setLoadingPets(false);
      }
    }
  }, []);

  const loadUserData = useCallback(async () => {
    let mounted = true;
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored && mounted) {
        const userData = JSON.parse(stored);
        setUser(userData);

        // Load firstName dari Firestore
        const currentUser = auth().currentUser;
        if (currentUser) {
          try {
            const userDoc = await firestore()
              .collection('users')
              .doc(currentUser.uid)
              .get();

            if (userDoc.exists() && mounted) {
              const firestoreData = userDoc.data();
              setFirstName(firestoreData?.firstName || '');
            } else if (mounted) {
              // Jika tidak ada di Firestore, coba split dari displayName
              const displayName = userData.displayName || '';
              const nameParts = displayName.split(' ');
              setFirstName(nameParts[0] || '');
            }
          } catch (firestoreError) {
            console.warn(
              'Failed to load firstName from Firestore:',
              firestoreError,
            );
            // Fallback ke displayName jika Firestore error
            if (mounted) {
              const displayName = userData.displayName || '';
              const nameParts = displayName.split(' ');
              setFirstName(nameParts[0] || '');
            }
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load user', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadPets();
    }, [loadUserData, loadPets]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadUserData(), loadPets()]);
    } catch (error) {
      console.warn('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter pets berdasarkan search query
  const filteredPets = searchQuery
    ? yourPets.filter(pet =>
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : yourPets;
  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
        padding: normalize(20),
      }}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View
          style={{
            padding: normalize(20),
            borderRadius: normalize(10),
            backgroundColor: COLORS.info,
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          {user ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: normalize(20),
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate('EditProfile')}
                style={{
                  backgroundColor: COLORS.warning,
                  padding: normalize(10),
                  borderRadius: normalize(10),
                }}
              >
                <Image
                  source={require('../../assets/icons/woman-icon.png')}
                  style={{ width: normalize(40), height: normalize(40) }}
                />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: normalize(5),
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(20),
                    fontWeight: '500',
                    color: COLORS.black,
                  }}
                >
                  Hi, {firstName || 'Name'}
                </Text>
                <Text
                  style={{
                    fontSize: normalize(14),
                    fontWeight: '500',
                    color: COLORS.gray,
                  }}
                >
                  Jakarta, IDN
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <Button
                onPress={() => navigation.navigate('Login')}
                variant="other"
                style={{
                  padding: normalize(10),
                  borderRadius: normalize(10),
                  backgroundColor: COLORS.blue3,
                  borderColor: COLORS.blue3,
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: normalize(16),
                    fontWeight: 'bold',
                  }}
                >
                  Login
                </Text>
              </Button>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: normalize(20),
            }}
          >
            <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
              <Image
                source={require('../../assets/icons/search.png')}
                style={{ width: normalize(30), height: normalize(30) }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notification')}
            >
              <Image
                source={require('../../assets/icons/bell.png')}
                style={{ width: normalize(30), height: normalize(35) }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Input */}
        {showSearch && (
          <View
            style={{
              marginTop: normalize(20),
              paddingHorizontal: normalize(20),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.secondary,
                borderRadius: normalize(10),
                borderWidth: 1,
                borderColor: COLORS.gray,
                paddingRight: normalize(10),
              }}
            >
              <TextInput
                placeholder="Search pet by name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  flex: 1,
                  paddingVertical: normalize(15),
                  paddingHorizontal: normalize(15),
                  fontSize: normalize(16),
                  color: COLORS.black,
                }}
                placeholderTextColor={COLORS.gray}
                autoFocus={true}
              />
              <TouchableOpacity
                onPress={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                style={{
                  padding: normalize(5),
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(20),
                    color: COLORS.gray,
                    fontWeight: 'bold',
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Your Pets */}
        <View
          style={{ marginTop: normalize(20), paddingHorizontal: normalize(20) }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: normalize(20),
            }}
          >
            <Text
              style={{
                fontSize: normalize(20),
                fontWeight: '500',
                color: COLORS.black,
              }}
            >
              Your Pets
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllPets')}
              style={{
                padding: normalize(10),
                borderColor: COLORS.lightGray,
                borderWidth: 1,
                borderRadius: normalize(30),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  fontWeight: '500',
                  color: COLORS.black,
                }}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              marginTop: normalize(20),
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: normalize(20),
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('CreatePet')}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: normalize(10),
              }}
            >
              <View
                style={{
                  backgroundColor: COLORS.lightYellow,
                  padding: normalize(10),
                  borderRadius: normalize(10),
                  borderWidth: 1,
                  borderColor: COLORS.warning,
                  borderStyle: 'dashed',
                  width: normalize(60),
                  height: normalize(60),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={require('../../assets/icons/plus-yellow.png')}
                  style={{ width: normalize(15), height: normalize(15) }}
                />
              </View>
              <Text
                style={{
                  fontSize: normalize(14),
                  fontWeight: '500',
                  color: COLORS.black,
                }}
              >
                Add Pet
              </Text>
            </TouchableOpacity>
            {filteredPets.map((pet: any) => (
              <TouchableOpacity
                key={pet.id}
                onPress={() =>
                  navigation.navigate('EditPet', { petId: pet.id })
                }
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  gap: normalize(10),
                }}
              >
                <View
                  style={{
                    backgroundColor: COLORS.lightGreen,
                    padding: normalize(10),
                    borderRadius: normalize(10),
                    width: normalize(60),
                    height: normalize(60),
                    alignItems: 'center',
                    justifyContent: 'center',
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
                      style={{ width: normalize(20), height: normalize(20) }}
                    />
                  ) : (
                    <Image
                      source={require('../../assets/icons/dog-icon.png')}
                      style={{ width: normalize(20), height: normalize(20) }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: normalize(14),
                    fontWeight: '500',
                    color: COLORS.black,
                  }}
                >
                  {pet.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Services */}
        <View
          style={{
            marginTop: normalize(20),
            backgroundColor: COLORS.lightBlue,
            borderRadius: normalize(10),
            padding: normalize(20),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: normalize(20),
            }}
          >
            <Text
              style={{
                fontSize: normalize(20),
                fontWeight: '500',
                color: COLORS.black,
              }}
            >
              Services
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllPets')}
              style={{
                padding: normalize(10),
                borderColor: COLORS.lightGray,
                borderWidth: 1,
                borderRadius: normalize(30),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  fontWeight: '500',
                  color: COLORS.black,
                }}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: normalize(20),
              marginTop: normalize(20),
            }}
          >
            {services.map(service => (
              <TouchableOpacity
                key={service.id}
                onPress={() => {
                  if (service.navigation === 'Activity' || service.navigation === 'Networking') {
                    // Show coming soon toast
                    if (Platform.OS === 'android') {
                      ToastAndroid.show('Coming Soon', ToastAndroid.SHORT);
                    } else {
                      Alert.alert('Coming Soon', 'This feature will be available soon');
                    }
                  } else if (service.navigation === 'Find') {
                    // Navigate to MainTabs with Find screen
                    navigation.navigate('MainTabs', { screen: 'Find' });
                  } else {
                    navigation.navigate(service.navigation);
                  }
                }}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: COLORS.orange,
                  width: normalize(140),
                  height: normalize(120),
                  borderRadius: normalize(10),
                }}
              >
                <Image
                  source={service.icon}
                  style={{ width: normalize(50), height: normalize(50) }}
                />
                <Text
                  style={{
                    fontSize: normalize(20),
                    fontWeight: '500',
                    color: COLORS.white,
                    textAlign: 'center',
                    marginTop: normalize(10),
                  }}
                >
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Plans */}
      </ScrollView>
    </View>
  );
}
