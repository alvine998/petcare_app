import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../../../config/color';
import BackButton from '../../../components/BackButton';
import BottomTabsBar from '../../../components/BottomTabsBar';
import firestore from '@react-native-firebase/firestore';

export default function PastVaccinations({ navigation, route }: { navigation: any; route: any }) {
  const petId = route?.params?.petId;
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default vaccinations if no data in Firestore
  const defaultVaccinations = [
    {
      id: 'rabies',
      name: 'RABIES',
      lastVaccination: null,
      vaccinationId: 'rabies',
    },
    {
      id: 'parvovirus',
      name: 'PARVOVIRUS',
      lastVaccination: null,
      vaccinationId: 'parvovirus',
    },
    {
      id: 'distemper',
      name: 'DISTEMPER',
      lastVaccination: null,
      vaccinationId: 'distemper',
    },
    {
      id: 'bordetella',
      name: 'BORDETELLA',
      lastVaccination: null,
      vaccinationId: 'bordetella',
    },
  ];

  const formatDate = (date: any): string => {
    if (!date) return '';
    
    let dateObj: Date;
    
    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date._seconds) {
      dateObj = new Date(date._seconds * 1000 + (date._nanoseconds || 0) / 1000000);
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
  };

  const loadVaccinations = useCallback(async () => {
    if (!petId) {
      setVaccinations(defaultVaccinations);
      setLoading(false);
      return;
    }

    let mounted = true;
    try {
      setLoading(true);

      // Load vaccinations from Firestore
      const vaccinationsSnapshot = await firestore()
        .collection('vaccinations')
        .where('petId', '==', petId)
        .get();

      if (mounted) {
        const firestoreVaccinations = vaccinationsSnapshot.docs.map(doc => ({
          id: doc.id,
          vaccinationId: doc.id,
          ...doc.data(),
        }));

        // If we have data from Firestore, use it
        if (firestoreVaccinations.length > 0) {
          // Map Firestore data to our format
          const formattedVaccinations = firestoreVaccinations.map((vac: any) => ({
            id: vac.id,
            vaccinationId: vac.id,
            name: vac.name || vac.vaccineName || '',
            lastVaccination: vac.lastVaccinationDate || vac.date || vac.lastVaccination,
            veterinarian: vac.veterinarian || '',
            clinic: vac.clinic || '',
            nextDue: vac.nextDueDate || vac.nextDue || null,
          }));

          setVaccinations(formattedVaccinations);
        } else {
          // If no data, use default vaccinations
          setVaccinations(defaultVaccinations);
        }
      }
    } catch (error: any) {
      console.warn('Failed to load vaccinations:', error);
      // On error, use default vaccinations
      if (mounted) {
        setVaccinations(defaultVaccinations);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      loadVaccinations();
    }, [loadVaccinations]),
  );

  const handleViewDetail = (vaccination: any) => {
    // Navigate to vaccination detail screen
    navigation.navigate('VaccinationDetail', {
      petId: petId,
      vaccinationId: vaccination.vaccinationId || vaccination.id,
      vaccination: vaccination,
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
          marginBottom: normalize(30),
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
          Past Vaccinations
        </Text>
      </View>

      {/* Vaccination List */}
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
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
            Loading vaccinations...
          </Text>
        </View>
      ) : vaccinations.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: normalize(100) }}
        >
          {vaccinations.map((vaccination) => (
            <View
              key={vaccination.id || vaccination.vaccinationId}
              style={{
                backgroundColor: COLORS.info,
                borderRadius: normalize(15),
                padding: normalize(20),
                marginBottom: normalize(20),
                position: 'relative',
              }}
            >
              {/* Vaccine Name */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: normalize(15),
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(22),
                    fontWeight: '700',
                    color: COLORS.white,
                    flex: 1,
                  }}
                >
                  {vaccination.name}
                </Text>
                <TouchableOpacity
                  onPress={() => handleViewDetail(vaccination)}
                  style={{
                    backgroundColor: COLORS.white,
                    paddingVertical: normalize(8),
                    paddingHorizontal: normalize(15),
                    borderRadius: normalize(8),
                  }}
                >
                  <Text
                    style={{
                      fontSize: normalize(12),
                      fontWeight: '600',
                      color: COLORS.darkGray,
                    }}
                  >
                    VIEW DETAIL
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Last Vaccination Date */}
              <Text
                style={{
                  fontSize: normalize(14),
                  fontWeight: '500',
                  color: COLORS.white,
                }}
              >
                LAST VACCINATION:{' '}
                {vaccination.lastVaccination
                  ? formatDate(vaccination.lastVaccination)
                  : 'Not recorded'}
              </Text>
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
            No vaccinations found
          </Text>
        </View>
      )}
      <BottomTabsBar />
    </View>
  );
}

