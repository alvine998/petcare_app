import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function CreatePet({ navigation }: { navigation: any }) {
  const [payload, setPayload] = useState([
    {
      name: '',
      species: '',
      gender: '',
      birthday: '',
      weight: '',
      photo: '',
    },
  ]);

  const handleCreatePet = () => {
    console.log('Create Pet');
    Alert.alert('Create Pet', 'Create Pet successful');
    // navigation.navigate('Home');
  };

  const handleChange = (index: number, key: string, value: string) => {
    setPayload(
      payload.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
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
      <ScrollView>
        <View
          style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
        >
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <View style={{ alignItems: 'center', marginTop: normalize(20) }}>
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '400',
              color: COLORS.black,
              textAlign: 'center',
            }}
          >
            Let’s start by creating portfolio for your pet!
          </Text>
          {payload?.map((item, index) => (
            <View
              key={index}
              style={{
                marginTop: normalize(20),
                width: '100%',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View>
                {item.photo ? (
                  <Image
                    source={{ uri: item.photo }}
                    style={{ width: normalize(100), height: normalize(100) }}
                  />
                ) : (
                  <TouchableOpacity>
                    <View
                      style={{
                        width: normalize(100),
                        height: normalize(100),
                        backgroundColor: COLORS.secondary,
                        borderRadius: normalize(100),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: normalize(20),
                        padding: normalize(20),
                      }}
                    >
                      <Image
                        source={require('../../assets/icons/camera.png')}
                        style={{ width: normalize(40), height: normalize(40) }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: normalize(16),
                        fontWeight: '400',
                        color: COLORS.black,
                        marginTop: normalize(10),
                      }}
                    >
                      Upload Image
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  width: '100%',
                  paddingHorizontal: normalize(20),
                  marginTop: normalize(20),
                  flexDirection: 'column',
                  gap: normalize(10),
                }}
              >
                <Input
                  label="Name"
                  placeholder="Enter name"
                  value={item.name}
                  onChangeText={value => handleChange(index, 'name', value)}
                  style={{ backgroundColor: COLORS.info }}
                />
                <Input
                  label="Species"
                  placeholder="Enter species"
                  value={item.species}
                  onChangeText={value => handleChange(index, 'species', value)}
                  style={{ backgroundColor: COLORS.info }}
                />
                <Input
                  label="Sex"
                  placeholder="Enter sex"
                  value={item.gender}
                  onChangeText={value => handleChange(index, 'gender', value)}
                  style={{ backgroundColor: COLORS.info }}
                />
                <Input
                  label="Birthday"
                  placeholder="Month/Day/Year"
                  value={item.birthday}
                  onChangeText={value => handleChange(index, 'birthday', value)}
                  style={{ backgroundColor: COLORS.info }}
                />
                <Input
                  label="Weight"
                  placeholder="Weight (kg)"
                  value={item.weight}
                  onChangeText={value => handleChange(index, 'weight', value)}
                  style={{ backgroundColor: COLORS.info }}
                />
                <Button
                  variant="success"
                  style={{
                    width: '100%',
                    height: normalize(50),
                    marginTop: normalize(20),
                  }}
                  onPress={handleCreatePet}
                >
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: normalize(16),
                      fontWeight: 'bold',
                    }}
                  >
                    SAVE
                  </Text>
                </Button>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Home')}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: normalize(10),
                    marginTop: normalize(30),
                  }}
                >
                  <Image
                    source={require('../../assets/icons/plus-circle.png')}
                    style={{ width: normalize(20), height: normalize(20) }}
                  />
                  <Text
                    style={{
                      fontSize: normalize(16),
                      fontWeight: '300',
                      color: COLORS.black,
                    }}
                  >
                    Add another pet
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
