import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import normalize from 'react-native-normalize';
import { COLORS } from '../../../config/color';
import BackButton from '../../../components/BackButton';
import BottomTabsBar from '../../../components/BottomTabsBar';

export default function VaccinationDetail({ navigation, route }: { navigation: any; route: any }) {
  const { petId, vaccinationId, vaccination } = route?.params || {};

  const formatDate = (date: any): string => {
    if (!date) return 'Not recorded';
    
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
      return 'Not recorded';
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();
  };

  // Use data from route params if available, otherwise use default
  const detail = vaccination || {
    name: vaccinationId || 'Vaccination',
    lastVaccination: null,
    nextDue: null,
    veterinarian: '',
    clinic: '',
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

      <View style={{ marginTop: normalize(30), alignItems: 'center' }}>
        <Text
          style={{
            fontSize: normalize(30),
            fontWeight: '400',
            color: COLORS.black,
            textAlign: 'center',
          }}
        >
          {detail.name}
        </Text>
      </View>

      <ScrollView
        style={{ marginTop: normalize(30) }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: normalize(100) }}
      >
        <View
          style={{
            padding: normalize(20),
            backgroundColor: COLORS.info,
            borderRadius: normalize(10),
            marginBottom: normalize(15),
          }}
        >
          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: normalize(10),
            }}
          >
            Last Vaccination
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
              marginBottom: normalize(20),
            }}
          >
            {formatDate(detail.lastVaccination)}
          </Text>

          <Text
            style={{
              fontSize: normalize(16),
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: normalize(10),
            }}
          >
            Next Due Date
          </Text>
          <Text
            style={{
              fontSize: normalize(14),
              color: COLORS.gray,
              marginBottom: normalize(20),
            }}
          >
            {formatDate(detail.nextDue)}
          </Text>

          {detail.veterinarian && (
            <>
              <Text
                style={{
                  fontSize: normalize(16),
                  fontWeight: '500',
                  color: COLORS.black,
                  marginBottom: normalize(10),
                }}
              >
                Veterinarian
              </Text>
              <Text
                style={{
                  fontSize: normalize(14),
                  color: COLORS.gray,
                  marginBottom: normalize(20),
                }}
              >
                {detail.veterinarian}
              </Text>
            </>
          )}

          {detail.clinic && (
            <>
              <Text
                style={{
                  fontSize: normalize(16),
                  fontWeight: '500',
                  color: COLORS.black,
                  marginBottom: normalize(10),
                }}
              >
                Clinic
              </Text>
              <Text
                style={{
                  fontSize: normalize(14),
                  color: COLORS.gray,
                }}
              >
                {detail.clinic}
              </Text>
            </>
          )}
        </View>
      </ScrollView>
      <BottomTabsBar />
    </View>
  );
}

