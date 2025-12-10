import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import React, { useState } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import BottomTabsBar from '../../components/BottomTabsBar';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { auth, storage } from '../../config/firebase';
import firestore from '@react-native-firebase/firestore';

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
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImagePicker = (index: number) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          const uri = response.assets[0].uri;
          if (uri) {
            handleChange(index, 'photo', uri);
          }
        }
      },
    );
  };

  const uploadImageToStorage = async (
    imageUri: string,
    petId: string,
  ): Promise<string> => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const filename = `pets/${currentUser.uid}/${petId}_${Date.now()}.jpg`;
    const reference = storage().ref(filename);

    await reference.putFile(imageUri);
    const downloadURL = await reference.getDownloadURL();
    return downloadURL;
  };

  const handleCreatePet = async () => {
    const pet = payload[0];

    // Validasi
    if (!pet.name || !pet.species || !pet.gender || !pet.birthday) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must login first');
      return;
    }

    // Cek jumlah pets yang sudah ada (maksimal 5 pets per user)
    try {
      const existingPetsSnapshot = await firestore()
        .collection('pets')
        .where('userId', '==', currentUser.uid)
        .get();

      if (existingPetsSnapshot.docs.length >= 5) {
        Alert.alert(
          'Limit Reached',
          'You already have 5 pets. Delete existing pet to add new pet.',
        );
        return;
      }
    } catch (error: any) {
      console.log('Error checking pet limit:', error);
      // Continue jika error, biarkan user tetap bisa create
    }

    setSaving(true);
    try {
      let imageURL = '';

      // Upload image jika ada
      if (pet.photo && pet.photo.startsWith('file://')) {
        setUploading(true);
        try {
          // Generate pet ID
          const petId = firestore().collection('pets').doc().id;
          imageURL = await uploadImageToStorage(pet.photo, petId);
          setUploading(false);
        } catch (error: any) {
          setUploading(false);
          console.log('Error uploading image:', error);
          Alert.alert('Error', 'Failed to upload image: ' + error.message);
          setSaving(false);
          return;
        }
      }

      // Save pet data ke Firestore
      const petData = {
        userId: currentUser.uid,
        name: pet.name,
        species: pet.species,
        gender: pet.gender,
        birthday: pet.birthday,
        weight: pet.weight || '',
        photoURL: imageURL,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('pets').add(petData);

      ToastAndroid.show('Pet created successfully!', ToastAndroid.SHORT);
      navigation.navigate('MainTabs');
    } catch (error: any) {
      console.log('Error creating pet:', error);
      Alert.alert('Error', error.message || 'Gagal membuat pet');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleChange = (index: number, key: string, value: string) => {
    setPayload(
      payload.map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const handleSpeciesSelect = (species: string, index: number) => {
    handleChange(index, 'species', species);
    setShowSpeciesPicker(false);
  };

  const handleSexSelect = (gender: string, index: number) => {
    handleChange(index, 'gender', gender);
    setShowSexPicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        handleChange(currentIndex, 'birthday', formattedDate);
      }
    } else {
      // iOS
      if (selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        handleChange(currentIndex, 'birthday', formattedDate);
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: normalize(80) }}
        showsVerticalScrollIndicator={false}
      >
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
                  <TouchableOpacity onPress={() => handleImagePicker(index)}>
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
                {item.photo && (
                  <TouchableOpacity
                    onPress={() => handleImagePicker(index)}
                    style={{ marginTop: normalize(10) }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.blue1,
                        textAlign: 'center',
                      }}
                    >
                      Ubah Foto
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
                {/* Species Picker */}
                <View>
                  <Text
                    style={{
                      marginBottom: normalize(4),
                      fontWeight: '500',
                      fontSize: normalize(16),
                      color: COLORS.black,
                    }}
                  >
                    Species
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentIndex(index);
                      setShowSpeciesPicker(true);
                    }}
                    style={{
                      backgroundColor: COLORS.info,
                      paddingVertical: normalize(15),
                      paddingHorizontal: normalize(15),
                      borderRadius: normalize(4),
                      borderWidth: 1,
                      borderColor: COLORS.secondary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(16),
                        color: item.species ? COLORS.black : COLORS.gray,
                      }}
                    >
                      {item.species || 'Select species'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sex Picker */}
                <View>
                  <Text
                    style={{
                      marginBottom: normalize(4),
                      fontWeight: '500',
                      fontSize: normalize(16),
                      color: COLORS.black,
                    }}
                  >
                    Sex
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentIndex(index);
                      setShowSexPicker(true);
                    }}
                    style={{
                      backgroundColor: COLORS.info,
                      paddingVertical: normalize(15),
                      paddingHorizontal: normalize(15),
                      borderRadius: normalize(4),
                      borderWidth: 1,
                      borderColor: COLORS.secondary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(16),
                        color: item.gender ? COLORS.black : COLORS.gray,
                      }}
                    >
                      {item.gender || 'Select sex'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Birthday Date Picker */}
                <View>
                  <Text
                    style={{
                      marginBottom: normalize(4),
                      fontWeight: '500',
                      fontSize: normalize(16),
                      color: COLORS.black,
                    }}
                  >
                    Birthday
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentIndex(index);
                      setShowDatePicker(true);
                    }}
                    style={{
                      backgroundColor: COLORS.info,
                      paddingVertical: normalize(15),
                      paddingHorizontal: normalize(15),
                      borderRadius: normalize(4),
                      borderWidth: 1,
                      borderColor: COLORS.secondary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(16),
                        color: item.birthday ? COLORS.black : COLORS.gray,
                      }}
                    >
                      {item.birthday
                        ? formatDate(item.birthday)
                        : 'Select birthday'}
                    </Text>
                  </TouchableOpacity>
                </View>
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
                    opacity: saving || uploading ? 0.6 : 1,
                  }}
                  onPress={handleCreatePet}
                  disabled={saving || uploading}
                >
                  {saving || uploading ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: normalize(10),
                      }}
                    >
                      <ActivityIndicator color={COLORS.white} size="small" />
                      <Text
                        style={{
                          color: COLORS.white,
                          fontSize: normalize(16),
                          fontWeight: 'bold',
                        }}
                      >
                        {uploading ? 'Uploading...' : 'Saving...'}
                      </Text>
                    </View>
                  ) : (
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: normalize(16),
                      fontWeight: 'bold',
                    }}
                  >
                    SAVE
                  </Text>
                  )}
                </Button>

                {/* <TouchableOpacity
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
                </TouchableOpacity> */}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Species Picker Modal */}
      <Modal
        visible={showSpeciesPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSpeciesPicker(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: normalize(20),
              borderTopRightRadius: normalize(20),
              padding: normalize(20),
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
              Select Species
            </Text>
            <TouchableOpacity
              onPress={() => handleSpeciesSelect('cat', currentIndex)}
              style={{
                padding: normalize(15),
                backgroundColor: COLORS.info,
                borderRadius: normalize(10),
                marginBottom: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                  textAlign: 'center',
                }}
              >
                Cat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSpeciesSelect('dog', currentIndex)}
              style={{
                padding: normalize(15),
                backgroundColor: COLORS.info,
                borderRadius: normalize(10),
                marginBottom: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                  textAlign: 'center',
                }}
              >
                Dog
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSpeciesPicker(false)}
              style={{
                padding: normalize(15),
                backgroundColor: COLORS.secondary,
                borderRadius: normalize(10),
                marginTop: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sex Picker Modal */}
      <Modal
        visible={showSexPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSexPicker(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: normalize(20),
              borderTopRightRadius: normalize(20),
              padding: normalize(20),
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
              Select Sex
            </Text>
            <TouchableOpacity
              onPress={() => handleSexSelect('Male', currentIndex)}
              style={{
                padding: normalize(15),
                backgroundColor: COLORS.info,
                borderRadius: normalize(10),
                marginBottom: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                  textAlign: 'center',
                }}
              >
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSexSelect('Female', currentIndex)}
              style={{
                padding: normalize(15),
                backgroundColor: COLORS.info,
                borderRadius: normalize(10),
                marginBottom: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                  textAlign: 'center',
                }}
              >
                Female
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSexPicker(false)}
              style={{
                padding: normalize(15),
                backgroundColor: COLORS.secondary,
                borderRadius: normalize(10),
                marginTop: normalize(10),
              }}
            >
              <Text
                style={{
                  fontSize: normalize(16),
                  color: COLORS.black,
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <>
          {Platform.OS === 'ios' && (
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <View
                style={{
                  backgroundColor: COLORS.white,
                  borderTopLeftRadius: normalize(20),
                  borderTopRightRadius: normalize(20),
                  padding: normalize(20),
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: normalize(10),
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={{ padding: normalize(10) }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(16),
                        color: COLORS.blue1,
                        fontWeight: '600',
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: normalize(18),
                      fontWeight: '600',
                      color: COLORS.black,
                    }}
                  >
                    Select Birthday
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={{ padding: normalize(10) }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(16),
                        color: COLORS.blue1,
                        fontWeight: '600',
                      }}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={
                    payload[currentIndex]?.birthday
                      ? new Date(payload[currentIndex].birthday)
                      : new Date()
                  }
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  style={{ height: normalize(200) }}
                />
              </View>
            </View>
          )}
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={
                payload[currentIndex]?.birthday
                  ? new Date(payload[currentIndex].birthday)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </>
      )}
      <BottomTabsBar />
    </View>
  );
}
