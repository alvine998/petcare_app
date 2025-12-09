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
import React, { useState, useEffect } from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import BackButton from '../../components/BackButton';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { auth, storage } from '../../config/firebase';
import firestore from '@react-native-firebase/firestore';

export default function EditPet({ navigation, route }: { navigation: any; route: any }) {
  const petId = route?.params?.petId;
  const [pet, setPet] = useState({
    name: '',
    species: '',
    gender: '',
    birthday: '',
    weight: '',
    photo: '',
    photoURL: '',
  });
  const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (petId) {
      loadPetData();
    }
  }, [petId]);

  const loadPetData = async () => {
    try {
      setLoading(true);
      const petDoc = await firestore().collection('pets').doc(petId).get();
      
      if (petDoc.exists()) {
        const petData = petDoc.data();
        setPet({
          name: petData?.name || '',
          species: petData?.species || '',
          gender: petData?.gender || '',
          birthday: petData?.birthday || '',
          weight: petData?.weight || '',
          photo: '',
          photoURL: petData?.photoURL || '',
        });
      } else {
        Alert.alert('Error', 'Pet not found');
        navigation.goBack();
      }
    } catch (error: any) {
      console.log('Error loading pet:', error);
      Alert.alert('Error', 'Failed to load pet data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = () => {
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
            setPet({ ...pet, photo: uri });
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

  const handleSave = async () => {
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

    setSaving(true);
    try {
      let imageURL = pet.photoURL;

      // Upload image baru jika ada
      if (pet.photo && pet.photo.startsWith('file://')) {
        setUploading(true);
        try {
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

      // Update pet data di Firestore
      const petData = {
        name: pet.name,
        species: pet.species,
        gender: pet.gender,
        birthday: pet.birthday,
        weight: pet.weight || '',
        photoURL: imageURL,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('pets').doc(petId).update(petData);

      ToastAndroid.show('Pet updated successfully!', ToastAndroid.SHORT);
      navigation.goBack();
    } catch (error: any) {
      console.log('Error updating pet:', error);
      Alert.alert('Error', error.message || 'Failed to update pet');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Pet',
      'Are you sure you want to delete this pet? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const currentUser = auth().currentUser;
              if (!currentUser) {
                Alert.alert('Error', 'You must login first');
                setDeleting(false);
                return;
              }

              // Hapus pet dari Firestore
              await firestore().collection('pets').doc(petId).delete();

              // Hapus image dari Storage jika ada
              if (pet.photoURL) {
                try {
                  const imageRef = storage().refFromURL(pet.photoURL);
                  await imageRef.delete();
                } catch (storageError) {
                  console.log('Error deleting image from storage:', storageError);
                  // Continue even if image deletion fails
                }
              }

              ToastAndroid.show('Pet deleted successfully!', ToastAndroid.SHORT);
              navigation.goBack();
            } catch (error: any) {
              console.log('Error deleting pet:', error);
              Alert.alert('Error', error.message || 'Failed to delete pet');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleChange = (key: string, value: string) => {
    setPet({ ...pet, [key]: value });
  };

  const handleSpeciesSelect = (species: string) => {
    handleChange('species', species);
    setShowSpeciesPicker(false);
  };

  const handleSexSelect = (gender: string) => {
    handleChange('gender', gender);
    setShowSexPicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        handleChange('birthday', formattedDate);
      }
    } else {
      // iOS
      if (selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        handleChange('birthday', formattedDate);
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

  if (loading) {
    return (
      <View
        style={{
          backgroundColor: COLORS.primary,
          height: '100%',
          width: '100%',
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
          Loading pet data...
        </Text>
      </View>
    );
  }

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
            Edit Pet Information
          </Text>
          <View
            style={{
              marginTop: normalize(20),
              width: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View>
              {pet.photo || pet.photoURL ? (
                <View>
                  <Image
                    source={{
                      uri: pet.photo || pet.photoURL,
                    }}
                    style={{
                      width: normalize(100),
                      height: normalize(100),
                      borderRadius: normalize(50),
                    }}
                  />
                  <TouchableOpacity
                    onPress={handleImagePicker}
                    style={{ marginTop: normalize(10) }}
                  >
                    <Text
                      style={{
                        fontSize: normalize(14),
                        color: COLORS.blue1,
                        textAlign: 'center',
                      }}
                    >
                      Change Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={handleImagePicker}>
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
                value={pet.name}
                onChangeText={value => handleChange('name', value)}
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
                  onPress={() => setShowSpeciesPicker(true)}
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
                      color: pet.species ? COLORS.black : COLORS.gray,
                    }}
                  >
                    {pet.species || 'Select species'}
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
                  onPress={() => setShowSexPicker(true)}
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
                      color: pet.gender ? COLORS.black : COLORS.gray,
                    }}
                  >
                    {pet.gender || 'Select sex'}
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
                  onPress={() => setShowDatePicker(true)}
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
                      color: pet.birthday ? COLORS.black : COLORS.gray,
                    }}
                  >
                    {pet.birthday
                      ? formatDate(pet.birthday)
                      : 'Select birthday'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Weight"
                placeholder="Weight (kg)"
                value={pet.weight}
                onChangeText={value => handleChange('weight', value)}
                style={{ backgroundColor: COLORS.info }}
                keyboardType="numeric"
              />
              <Button
                variant="success"
                style={{
                  width: '100%',
                  height: normalize(50),
                  marginTop: normalize(20),
                  opacity: saving || uploading ? 0.6 : 1,
                }}
                onPress={handleSave}
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
                    SAVE CHANGES
                  </Text>
                )}
              </Button>

              <Button
                variant="danger"
                style={{
                  width: '100%',
                  height: normalize(50),
                  marginTop: normalize(20),
                  opacity: deleting ? 0.6 : 1,
                }}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
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
                      Deleting...
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
                    DELETE PET
                  </Text>
                )}
              </Button>
            </View>
          </View>
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
              onPress={() => handleSpeciesSelect('cat')}
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
              onPress={() => handleSpeciesSelect('dog')}
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
              onPress={() => handleSexSelect('Male')}
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
              onPress={() => handleSexSelect('Female')}
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
                    pet.birthday ? new Date(pet.birthday) : new Date()
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
              value={pet.birthday ? new Date(pet.birthday) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </>
      )}
    </View>
  );
}

