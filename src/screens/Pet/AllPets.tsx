import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ToastAndroid,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import BottomTabsBar from '../../components/BottomTabsBar';
import { auth, storage } from '../../config/firebase';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function AllPets({ navigation }: { navigation: any }) {
  const [refreshing, setRefreshing] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);

  const loadPets = useCallback(async () => {
    let mounted = true;
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        if (mounted) {
          setPets([]);
        }
        return;
      }

      setLoadingPets(true);

      // Query tanpa orderBy untuk menghindari kebutuhan index
      // Limit maksimal 5 pets per user
      const petsSnapshot = await firestore()
        .collection('pets')
        .where('userId', '==', currentUser.uid)
        .limit(5)
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

        setPets(petsData);
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

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPets();
    } catch (error) {
      console.warn('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeletePet = (
    petId: string,
    petName: string,
    photoURL?: string,
  ) => {
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${petName}? This action cannot be undone.`,
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
              const currentUser = auth().currentUser;
              if (!currentUser) {
                Alert.alert('Error', 'You must login first');
                return;
              }

              // Hapus pet dari Firestore
              await firestore().collection('pets').doc(petId).delete();

              // Hapus image dari Storage jika ada
              if (photoURL) {
                try {
                  const imageRef = storage().refFromURL(photoURL);
                  await imageRef.delete();
                } catch (storageError) {
                  console.log(
                    'Error deleting image from storage:',
                    storageError,
                  );
                  // Continue even if image deletion fails
                }
              }

              ToastAndroid.show(
                'Pet deleted successfully!',
                ToastAndroid.SHORT,
              );
              loadPets(); // Reload pets list
            } catch (error: any) {
              console.log('Error deleting pet:', error);
              Alert.alert('Error', error.message || 'Failed to delete pet');
            }
          },
        },
      ],
    );
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
      <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <View style={{ marginTop: normalize(20), alignItems: 'center' }}>
        <Text
          style={{
            fontSize: normalize(30),
            fontWeight: '400',
            color: COLORS.black,
            textAlign: 'center',
          }}
        >
          All Pets
        </Text>
      </View>

      <ScrollView
        style={{ marginTop: normalize(30) }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: normalize(100) }}
      >
        {/* Add Pet Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CreatePet')}
          style={{
            backgroundColor: COLORS.lightYellow,
            padding: normalize(20),
            borderRadius: normalize(10),
            borderWidth: 2,
            borderColor: COLORS.warning,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: normalize(20),
            flexDirection: 'row',
            gap: normalize(10),
          }}
        >
          <Image
            source={require('../../assets/icons/plus-yellow.png')}
            style={{ width: normalize(20), height: normalize(20) }}
          />
          <Text
            style={{
              fontSize: normalize(18),
              fontWeight: '500',
              color: COLORS.black,
            }}
          >
            Add New Pet
          </Text>
        </TouchableOpacity>

        {/* Loading Indicator */}
        {loadingPets && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: normalize(40),
            }}
          >
            <ActivityIndicator size="large" color={COLORS.blue1} />
            <Text
              style={{
                fontSize: normalize(16),
                color: COLORS.gray,
                marginTop: normalize(10),
              }}
            >
              Loading pets...
            </Text>
          </View>
        )}

        {/* Pets List */}
        {!loadingPets && (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: normalize(20),
              justifyContent: 'center',
            }}
          >
            {pets.map((pet: any) => (
              <View
                key={pet.id}
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: normalize(15),
                  padding: normalize(20),
                  width: normalize(150),
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 3.84,
                  elevation: 5,
                  position: 'relative',
                }}
              >
                <View
                  style={{
                    backgroundColor: COLORS.lightGreen,
                    padding: normalize(15),
                    borderRadius: normalize(15),
                    width: normalize(80),
                    height: normalize(80),
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: normalize(10),
                    overflow: 'hidden',
                  }}
                >
                  {pet.photoURL ? (
                    <Image
                      source={{ uri: pet.photoURL }}
                      style={{
                        width: normalize(80),
                        height: normalize(80),
                        borderRadius: normalize(15),
                      }}
                      resizeMode="cover"
                    />
                  ) : pet.species === 'cat' ? (
                    <Image
                      source={require('../../assets/icons/cat-icon.png')}
                      style={{ width: normalize(40), height: normalize(40) }}
                    />
                  ) : (
                    <Image
                      source={require('../../assets/icons/dog-icon.png')}
                      style={{ width: normalize(40), height: normalize(40) }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: normalize(18),
                    fontWeight: '600',
                    color: COLORS.black,
                    marginBottom: normalize(5),
                    textAlign: 'center',
                  }}
                >
                  {pet.name}
                </Text>
                <Text
                  style={{
                    fontSize: normalize(14),
                    color: COLORS.gray,
                    textAlign: 'center',
                  }}
                >
                  {pet.species === 'cat' ? 'Cat' : 'Dog'}
                </Text>
                <Text
                  style={{
                    fontSize: normalize(12),
                    color: COLORS.gray,
                    textAlign: 'center',
                    marginTop: normalize(5),
                  }}
                >
                  {pet.gender}
                </Text>

                {/* Edit and Delete Buttons */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: normalize(10),
                    marginTop: normalize(15),
                    width: '100%',
                    justifyContent: 'center',
                    paddingHorizontal: normalize(10),
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('EditPet', { petId: pet.id })
                    }
                    style={{
                      backgroundColor: COLORS.blue1,
                      padding: normalize(5),
                      borderRadius: normalize(8),
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: normalize(5),
                      width: normalize(30),
                      height: normalize(30),
                    }}
                  >
                    <Icon
                      name="pencil"
                      size={normalize(14)}
                      color={COLORS.white}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleDeletePet(pet.id, pet.name, pet.photoURL)
                    }
                    style={{
                      backgroundColor: COLORS.danger,
                      padding: normalize(5),
                      borderRadius: normalize(8),
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: normalize(5),
                      width: normalize(30),
                      height: normalize(30),
                    }}
                  >
                    <Icon
                      name="trash"
                      size={normalize(14)}
                      color={COLORS.white}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Limit Warning */}
        {!loadingPets && pets.length >= 5 && (
          <View
            style={{
              backgroundColor: COLORS.lightYellow,
              padding: normalize(15),
              borderRadius: normalize(10),
              marginTop: normalize(20),
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: normalize(14),
                color: COLORS.black,
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              ⚠️ Maximum 5 pets per user
            </Text>
            <Text
              style={{
                fontSize: normalize(12),
                color: COLORS.gray,
                textAlign: 'center',
                marginTop: normalize(5),
              }}
            >
              Delete existing pet to add new pet
            </Text>
          </View>
        )}

        {pets.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
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
              No pets registered yet
            </Text>
            <Text
              style={{
                fontSize: normalize(14),
                color: COLORS.gray,
                textAlign: 'center',
                marginTop: normalize(10),
              }}
            >
              Add your first pet
            </Text>
          </View>
        )}
      </ScrollView>
      <BottomTabsBar />
    </View>
  );
}
