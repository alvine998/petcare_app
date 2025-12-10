import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { auth } from '../../config/firebase';
import firestore from '@react-native-firebase/firestore';

export default function ListInformation({ navigation }: { navigation: any }) {
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [showPetModal, setShowPetModal] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);

  const healthServices = [
    {
      id: 1,
      title: 'VACCINATIONS',
      color: '#5EDBC2', // Light teal/mint green
      icon: require('../../assets/images/vaccination.png'),
      badge: 2,
      description: 'Keep your pet up to date with vaccinations',
    },
    {
      id: 2,
      title: 'GROOMING',
      color: '#808080', // Medium grey
      icon: require('../../assets/images/medicine.png'),
      badge: null,
      description: 'Professional grooming services for your pet',
    },
    {
      id: 3,
      title: 'PET BOARDING',
      color: '#5EB0DB', // Medium blue
      icon: require('../../assets/images/petcare.png'),
      badge: null,
      description: 'Safe and comfortable boarding for your pet',
    },
  ];

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

        // Set selected pet to first pet if available
        if (petsData.length > 0 && !selectedPet) {
          setSelectedPet(petsData[0]);
          setSelectedPetId(petsData[0].id);
        }
      }
    } catch (error: any) {
      console.warn('Failed to load pets:', error);
    } finally {
      if (mounted) {
        setLoadingPets(false);
      }
    }
  }, [selectedPet]);

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets]),
  );

  const handlePetSelect = (pet: any) => {
    setSelectedPet(pet);
    setSelectedPetId(pet.id);
    setShowPetModal(false);
  };

  const handleServicePress = (serviceId: number) => {
    if (!selectedPetId) {
      return;
    }

    switch (serviceId) {
      case 1: // VACCINATIONS
        navigation.navigate('PastVaccinations', { petId: selectedPetId });
        break;
      case 2: // GROOMING
        navigation.navigate('GroomingPlan', { petId: selectedPetId });
        break;
      case 3: // PET BOARDING
        navigation.navigate('BoardingPlan', { petId: selectedPetId });
        break;
      default:
        break;
    }
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
      {/* Header with Back Button and Pet Selector */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: normalize(20),
        }}
      >
        <BackButton onPress={() => navigation.goBack()} />
        
        {/* Pet Selector Dropdown */}
        <TouchableOpacity
          onPress={() => {
            setShowPetModal(true);
          }}
          style={{
            backgroundColor: COLORS.warning,
            paddingVertical: normalize(10),
            paddingHorizontal: normalize(15),
            borderRadius: normalize(10),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: pets.length === 0 || loadingPets ? 0.6 : 1,
            minWidth: normalize(120),
          }}
        >
          <Text
            style={{
              fontSize: normalize(14),
              fontWeight: '600',
              color: COLORS.black,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {loadingPets
              ? 'Loading...'
              : selectedPet
              ? selectedPet.name
              : pets.length > 0
              ? 'Select Pet'
              : 'No Pets'}
          </Text>
          <Image
            source={require('../../assets/icons/arrow-left.png')}
            style={{
              width: normalize(14),
              height: normalize(14),
              transform: [{ rotate: '-90deg' }],
              tintColor: COLORS.black,
              marginLeft: normalize(8),
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Pet Selection Modal */}
      <Modal
        visible={showPetModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPetModal(false)}
        statusBarTranslucent={true}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowPetModal(false)}
            style={{ flex: 1 }}
          />
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: normalize(20),
              borderTopRightRadius: normalize(20),
              padding: normalize(20),
              maxHeight: '70%',
            }}
          >
            <Text
              style={{
                fontSize: normalize(20),
                fontWeight: '600',
                color: COLORS.black,
                marginBottom: normalize(20),
                textAlign: 'center',
              }}
            >
              Select Pet
            </Text>

            {loadingPets ? (
              <ActivityIndicator size="large" color={COLORS.blue1} />
            ) : pets.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {pets.map((pet: any) => (
                  <TouchableOpacity
                    key={pet.id}
                    onPress={() => handlePetSelect(pet)}
                    style={{
                      padding: normalize(15),
                      backgroundColor:
                        selectedPetId === pet.id
                          ? COLORS.info
                          : COLORS.veryLightGray,
                      borderRadius: normalize(10),
                      marginBottom: normalize(10),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: normalize(50),
                        height: normalize(50),
                        backgroundColor: COLORS.lightGreen,
                        borderRadius: normalize(25),
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
                            width: normalize(50),
                            height: normalize(50),
                            borderRadius: normalize(25),
                          }}
                          resizeMode="cover"
                        />
                      ) : pet.species === 'cat' ? (
                        <Image
                          source={require('../../assets/icons/cat-icon.png')}
                          style={{
                            width: normalize(30),
                            height: normalize(30),
                          }}
                        />
                      ) : (
                        <Image
                          source={require('../../assets/icons/dog-icon.png')}
                          style={{
                            width: normalize(30),
                            height: normalize(30),
                          }}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: normalize(16),
                          fontWeight: '600',
                          color: COLORS.black,
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
                        {pet.species === 'cat' ? 'Cat' : 'Dog'} • {pet.gender}
                      </Text>
                    </View>
                    {selectedPetId === pet.id && (
                      <Image
                        source={require('../../assets/icons/arrow-left.png')}
                        style={{
                          width: normalize(16),
                          height: normalize(16),
                          transform: [{ rotate: '180deg' }],
                          tintColor: COLORS.blue1,
                        }}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  padding: normalize(20),
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(16),
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
                  Add your first pet to get started
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowPetModal(false)}
              style={{
                padding: normalize(15),
                backgroundColor: COLORS.secondary,
                borderRadius: normalize(10),
                marginTop: normalize(20),
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                  fontWeight: '600',
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Title */}
      <Text
        style={{
          fontSize: normalize(24),
          fontWeight: '600',
          color: COLORS.black,
          textAlign: 'center',
          marginTop: normalize(20),
          marginBottom: normalize(30),
        }}
      >
        Pet Health Information
      </Text>

      {/* Health Services List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: normalize(100) }}
      >
        {healthServices.map(service => (
          <TouchableOpacity
            key={service.id}
            onPress={() => handleServicePress(service.id)}
            style={{
              backgroundColor: service.color,
              borderRadius: normalize(15),
              padding: normalize(20),
              marginBottom: normalize(20),
              flexDirection: 'row',
              alignItems: 'center',
              position: 'relative',
              minHeight: normalize(80),
              gap: normalize(20),
            }}
          >
            {/* Icon */}
            <Image
              source={service.icon}
              style={{
                width: normalize(60),
                height: normalize(60),
                resizeMode: 'contain',
              }}
            />

            {/* Title */}
            <Text
              style={{
                fontSize: normalize(18),
                fontWeight: '700',
                color: COLORS.white,
                flex: 1,
                textTransform: 'uppercase',
              }}
            >
              {service.title}
            </Text>

            {/* Badge */}
            {service.badge && (
              <View
                style={{
                  position: 'absolute',
                  top: normalize(10),
                  right: normalize(10),
                  backgroundColor: COLORS.danger,
                  borderRadius: normalize(12),
                  minWidth: normalize(24),
                  height: normalize(24),
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: normalize(8),
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: normalize(12),
                    fontWeight: '700',
                  }}
                >
                  {service.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
