import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS } from '../../config/color';
import normalize from 'react-native-normalize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../components/Button';

export default function Home({ navigation }: { navigation: any }) {
  const [refreshing, setRefreshing] = useState(false);
  const [yourPets, setYourPets] = useState([
    {
      id: 1,
      name: 'Buddy',
      species: 'cat',
      gender: 'Male',
      birthday: '2020-01-01',
    },
  ]);
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Activity',
      icon: require('../../assets/images/daycare.png'),
    },
    {
      id: 2,
      name: 'Health',
      icon: require('../../assets/images/stetoscop.png'),
    },
    {
      id: 3,
      name: 'Networking',
      icon: require('../../assets/images/dog-white.png'),
    },
    {
      id: 4,
      name: 'Location',
      icon: require('../../assets/images/pin-map-white.png'),
    },
  ]);
  const [user, setUser] = useState();
  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored && mounted) {
          setUser(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Failed to load user', err);
      }
    };
    loadUser();
    return () => {
      mounted = false;
    };
  }, []);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
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
                onPress={() => navigation.navigate('CreatePet')}
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
                  Hi, Name
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
            <TouchableOpacity onPress={() => navigation.navigate('CreatePet')}>
              <Image
                source={require('../../assets/icons/search.png')}
                style={{ width: normalize(30), height: normalize(30) }}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CreatePet')}>
              <Image
                source={require('../../assets/icons/bell.png')}
                style={{ width: normalize(30), height: normalize(35) }}
              />
            </TouchableOpacity>
          </View>
        </View>

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
              onPress={() => navigation.navigate('CreatePet')}
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
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: normalize(10),
              }}
            >
              <TouchableOpacity
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
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: normalize(14),
                  fontWeight: '500',
                  color: COLORS.black,
                }}
              >
                Add Pet
              </Text>
            </View>
            {yourPets.map(pet => (
              <View
                key={pet.id}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  gap: normalize(10),
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.lightGreen,
                    padding: normalize(10),
                    borderRadius: normalize(10),
                    width: normalize(60),
                    height: normalize(60),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {pet?.species === 'cat' ? (
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
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: normalize(14),
                    fontWeight: '500',
                    color: COLORS.black,
                  }}
                >
                  {pet.name}
                </Text>
              </View>
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
              onPress={() => navigation.navigate('Home')}
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
                onPress={() => navigation.navigate('Home')}
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
