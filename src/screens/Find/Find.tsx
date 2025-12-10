import {
  View,
  Text,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Linking,
  Share,
  Alert,
} from 'react-native';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import normalize from 'react-native-normalize';
import { COLORS } from '../../config/color';
import firestore from '@react-native-firebase/firestore';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Location {
  id: string;
  lat: number;
  long: number;
  name?: string;
  address?: string;
  schedule?: string;
  phone?: string;
  email?: string;
  website?: string;
  [key: string]: any;
}

export default function Find({ navigation }: { navigation: any }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const webViewRef = useRef<WebView>(null);

  // Handler functions for action buttons
  const handleCall = async () => {
    if (!selectedLocation?.phone) {
      Alert.alert('Error', 'Phone number not available');
      return;
    }
    try {
      const phoneNumber = selectedLocation.phone.replace(/[^0-9+]/g, '');
      const url = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot make phone call');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to make phone call');
    }
  };

  const handleEmail = async () => {
    if (!selectedLocation?.email) {
      Alert.alert('Error', 'Email address not available');
      return;
    }
    try {
      const url = `mailto:${selectedLocation.email}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open email client');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open email');
    }
  };

  const handleWeb = async () => {
    if (!selectedLocation?.website) {
      Alert.alert('Error', 'Website not available');
      return;
    }
    try {
      let url = selectedLocation.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open website');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open website');
    }
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `${selectedLocation?.name || 'Vet Location'}\n${selectedLocation?.address || ''}\n${selectedLocation?.phone ? `Phone: ${selectedLocation.phone}` : ''}\n${selectedLocation?.email ? `Email: ${selectedLocation.email}` : ''}`,
      };
      await Share.share(shareContent);
    } catch (error) {
      Alert.alert('Error', 'Failed to share location');
    }
  };

  const handleMakeAppointment = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location first');
      return;
    }
    navigation.navigate('AppointmentRequest', { location: selectedLocation });
  };

  const loadLocations = useCallback(async () => {
    let mounted = true;
    try {
      setLoading(true);

      // Load locations from Firestore
      const locationsSnapshot = await firestore().collection('locations').get();

      if (mounted) {
        const locationsData = locationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Location[];
        console.log('Raw locations data from Firestore:', locationsData);
        console.log('Total documents:', locationsData.length);

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
            if (!hasLat || !hasLong) {
              console.warn(
                'Invalid location (missing or invalid lat/long):',
                loc,
              );
            }
            return hasLat && hasLong;
          })
          .map((loc: any) => ({
            id: loc.id,
            lat: loc.lat as number,
            long: loc.long as number,
            name: loc.name,
            address: loc.address,
            schedule: loc.schedule,
          })) as Location[];

        console.log(
          'Valid locations after filtering and conversion:',
          validLocations,
        );
        validLocations.forEach((loc, index) => {
          console.log(`Location ${index + 1}:`, {
            id: loc.id,
            name: loc.name,
            lat: loc.lat,
            long: loc.long,
            address: loc.address,
          });
        });

        setLocations(validLocations);
        console.log('Valid locations found:', validLocations.length);

        // Update markers in Leaflet map
        if (webViewRef.current) {
          const locationsJSON = JSON.stringify(validLocations);
          console.log(
            'Injecting markers. Locations count:',
            validLocations.length,
          );

          // Function to add markers
          const addMarkersScript = `
            (function() {
              try {
                console.log('Starting marker injection...');
                console.log('Map available:', typeof window.map !== 'undefined');
                console.log('PinIcon available:', typeof window.pinIcon !== 'undefined');
                
                // Wait for map to be ready
                if (typeof window.map === 'undefined' || !window.map) {
                  console.error('Map is not ready yet');
                  return false;
                }
                
                // Clear existing markers
                if (typeof window.markers !== 'undefined' && window.markers.length > 0) {
                  console.log('Clearing existing markers:', window.markers.length);
                  window.markers.forEach(marker => {
                    if (marker && window.map) {
                      window.map.removeLayer(marker);
                    }
                  });
                }
                window.markers = [];
                
                // Parse locations
                const locations = ${locationsJSON};
                console.log('Parsed locations:', locations.length);
                
                // Add new markers
                if (locations && locations.length > 0) {
                  locations.forEach((loc, index) => {
                    if (loc.lat && loc.long && !isNaN(loc.lat) && !isNaN(loc.long)) {
                      console.log('Adding marker', index + 1, ':', loc.lat, loc.long);
                      
                      // Use pin icon if available, otherwise use default red marker
                      let icon;
                      if (window.pinIcon) {
                        icon = window.pinIcon;
                        console.log('Using pinIcon');
                      } else {
                        // Fallback to default red marker
                        icon = L.icon({
                          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                          iconSize: [40, 40],
                          iconAnchor: [20, 40],
                          popupAnchor: [0, -40]
                        });
                        console.log('Using default red marker');
                      }
                      
                      try {
                        const marker = L.marker([loc.lat, loc.long], { icon: icon })
                          .addTo(window.map)
                          .bindPopup('<b>' + (loc.name || 'Vet Location').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</b><br>' + (loc.address || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                        
                        // Add click event to marker
                        marker.on('click', function() {
                          console.log('Marker clicked:', loc);
                          // Send location data to React Native
                          if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'markerClick',
                              location: loc
                            }));
                          }
                        });
                        
                        window.markers.push(marker);
                        console.log('Marker added successfully:', index + 1);
                      } catch(markerError) {
                        console.error('Error adding marker', index + 1, ':', markerError);
                      }
                    } else {
                      console.warn('Invalid location data:', loc);
                    }
                  });
                  
                  console.log('Total markers added:', window.markers.length);
                  
                  // Fit bounds
                  if (window.markers.length > 0) {
                    try {
                      const group = new L.featureGroup(window.markers);
                      window.map.fitBounds(group.getBounds().pad(0.1));
                      console.log('Map bounds fitted');
                    } catch(boundsError) {
                      console.error('Error fitting bounds:', boundsError);
                    }
                  } else {
                    console.warn('No markers were added');
                  }
                } else {
                  console.warn('No valid locations to display');
                }
              } catch(e) {
                console.error('Error updating markers:', e);
                console.error('Error stack:', e.stack);
              }
            })();
            true;
          `;

          // Try to add markers immediately
          webViewRef.current.injectJavaScript(addMarkersScript);

          // Also retry after a delay to ensure map is ready
          setTimeout(() => {
            if (webViewRef.current && validLocations.length > 0) {
              console.log('Retrying marker injection...');
              webViewRef.current.injectJavaScript(addMarkersScript);
            }
          }, 1000);
        } else if (validLocations.length === 0) {
          console.log('No locations found to display');
        }
      }
    } catch (error: any) {
      console.warn('Failed to load locations:', error);
      if (mounted) {
        setLocations([]);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocations();
    }, [loadLocations]),
  );

  // Leaflet HTML template
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #f0f0f0;
        }
        #map {
          width: 100%;
          height: 100%;
          background-color: #f0f0f0;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 12px;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #666;
          font-family: Arial, sans-serif;
        }
      </style>
    </head>
    <body>
      <div id="map">
        <div class="loading">Loading map...</div>
      </div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
      <script>
        // Wait for page and Leaflet to load
        function initializeMap() {
          try {
            // Check if Leaflet is loaded
            if (typeof L === 'undefined') {
              console.error('Leaflet not loaded!');
              document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Error: Leaflet library failed to load. Please check your internet connection.</div>';
              return;
            }

            // Initialize map centered on Jakarta
            const map = L.map('map', {
              zoomControl: true,
              attributionControl: true
            }).setView([-6.2088, 106.8456], 13);

            // Add OpenStreetMap tile layer with error handling
            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
              errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
            }).addTo(map);

            // Handle tile loading errors
            map.on('tileerror', function(error, tile) {
              console.warn('Tile loading error:', error);
            });

            // Store markers array globally
            window.markers = [];

            // Custom marker icon - using div icon styled like pin-map
            window.pinIcon = L.divIcon({
              className: 'custom-pin-marker',
              html: '<div style="width: 40px; height: 40px; background-color: #000; border: 4px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40]
            });

            // Make map available globally
            window.map = map;
            
            // Signal that map is ready
            window.mapReady = true;
            
            // Notify React Native that map is ready
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
            }
            
            console.log('Map initialized successfully');
            console.log('Map object:', window.map);
            console.log('PinIcon object:', window.pinIcon);
          } catch (error) {
            console.error('Error initializing map:', error);
            document.body.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Error initializing map: ' + error.message + '</div>';
          }
        }
        
        // Wait for Leaflet to be available
        if (typeof L !== 'undefined') {
          initializeMap();
        } else {
          // Retry after a short delay
          setTimeout(function() {
            if (typeof L !== 'undefined') {
              initializeMap();
            } else {
              document.getElementById('map').innerHTML = '<div class="loading" style="color: red;">Error: Failed to load map library. Please check your internet connection.</div>';
            }
          }, 1000);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        height: '100%',
        width: '100%',
      }}
    >
      {/* Title */}
      <View
        style={{
          paddingTop: normalize(50),
          paddingHorizontal: normalize(20),
          paddingBottom: normalize(20),
        }}
      >
        <Text
          style={{
            fontSize: normalize(20),
            fontWeight: '600',
            color: COLORS.black,
            textAlign: 'center',
          }}
        >
          Discover Vets Near You:
        </Text>
      </View>

      {/* Map Container with Search */}
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.lightBlue,
          marginHorizontal: normalize(20),
          marginBottom: normalize(20),
          borderRadius: normalize(15),
          overflow: 'hidden',
        }}
      >
        {/* Search Bar */}
        <View
          style={{
            padding: normalize(15),
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: normalize(10),
              paddingHorizontal: normalize(15),
              paddingVertical: normalize(12),
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Image
              source={require('../../assets/icons/search.png')}
              style={{
                width: normalize(20),
                height: normalize(20),
                marginRight: normalize(10),
                tintColor: COLORS.gray,
              }}
            />
            <TextInput
              placeholder="Search"
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: normalize(16),
                color: COLORS.black,
              }}
            />
          </View>
        </View>

        {/* Map Area */}
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.white,
            marginHorizontal: normalize(15),
            marginBottom: normalize(15),
            borderRadius: normalize(10),
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Loading Indicator */}
          {loading && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.8)',
                zIndex: 100,
                borderRadius: normalize(10),
              }}
            >
              <ActivityIndicator size="large" color={COLORS.blue1} />
            </View>
          )}

          {/* Leaflet Map in WebView */}
          <WebView
            ref={webViewRef}
            source={{ html: leafletHTML }}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="always"
            originWhitelist={['*']}
            onError={syntheticEvent => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            onHttpError={syntheticEvent => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView HTTP error: ', nativeEvent);
            }}
            onLoadEnd={() => {
              console.log('WebView loaded');
              // Wait a bit for map to fully initialize, then load locations
              setTimeout(() => {
                console.log('Loading locations after delay...');
                loadLocations();
              }, 2000);
            }}
            onMessage={event => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                console.log('WebView message received:', data);
                if (data.type === 'mapReady') {
                  console.log('Map is ready, loading locations...');
                  setTimeout(() => {
                    loadLocations();
                  }, 500);
                } else if (data.type === 'markerClick') {
                  console.log('Marker clicked, location:', data.location);
                  setSelectedLocation(data.location);
                }
              } catch (e) {
                console.log('WebView message (raw):', event.nativeEvent.data);
              }
            }}
          />
        </View>

        {/* Location Detail Card */}
        {selectedLocation && (
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: normalize(15),
              padding: normalize(20),
              marginHorizontal: normalize(15),
              marginBottom: normalize(15),
              shadowColor: COLORS.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
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
                <Text
                  style={{
                    fontSize: normalize(18),
                    fontWeight: '700',
                    color: COLORS.black,
                    marginBottom: normalize(5),
                  }}
                >
                  {selectedLocation.name || 'Vet Location'}
                </Text>
                {selectedLocation.schedule && (
                  <Text
                    style={{
                      fontSize: normalize(14),
                      color: COLORS.gray,
                      marginBottom: normalize(5),
                    }}
                  >
                    {selectedLocation.schedule
                      ?.split(',')
                      .map((schedule: any) => schedule.trim())
                      .join('\n')}
                  </Text>
                )}
                {selectedLocation.address && (
                  <Text
                    style={{
                      fontSize: normalize(14),
                      color: COLORS.gray,
                      marginBottom: normalize(5),
                    }}
                  >
                    {selectedLocation.address}
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: normalize(12),
                    color: COLORS.darkGray,
                  }}
                >
                  Lat: {selectedLocation.lat}, Long: {selectedLocation.long}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedLocation(null)}
                style={{
                  padding: normalize(5),
                }}
              >
                <Text
                  style={{
                    fontSize: normalize(24),
                    color: COLORS.gray,
                    fontWeight: 'bold',
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Make Appointment Button */}
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.blue1,
                borderRadius: normalize(12),
                padding: normalize(16),
                alignItems: 'center',
                marginTop: normalize(15),
                marginBottom: normalize(15),
              }}
              onPress={handleMakeAppointment}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: normalize(16),
                  fontWeight: '700',
                }}
              >
                Make Appointment
              </Text>
            </TouchableOpacity>

            {/* Action Buttons Grid - 4 columns */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: normalize(10),
                gap: normalize(10),
              }}
            >
              {/* Call Button */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: COLORS.white,
                  borderRadius: normalize(10),
                  padding: normalize(12),
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.gray,
                }}
                onPress={handleCall}
              >
                <Icon
                  name="phone"
                  size={normalize(20)}
                  color={COLORS.blue1}
                  style={{ marginBottom: normalize(5) }}
                />
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: normalize(12),
                    fontWeight: '600',
                  }}
                >
                  Call
                </Text>
              </TouchableOpacity>

              {/* Email Button */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: COLORS.white,
                  borderRadius: normalize(10),
                  padding: normalize(12),
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.gray,
                }}
                onPress={handleEmail}
              >
                <Icon
                  name="envelope"
                  size={normalize(20)}
                  color={COLORS.blue1}
                  style={{ marginBottom: normalize(5) }}
                />
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: normalize(12),
                    fontWeight: '600',
                  }}
                >
                  Email
                </Text>
              </TouchableOpacity>

              {/* Web Button */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: COLORS.white,
                  borderRadius: normalize(10),
                  padding: normalize(12),
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.gray,
                }}
                onPress={handleWeb}
              >
                <Icon
                  name="globe"
                  size={normalize(20)}
                  color={COLORS.blue1}
                  style={{ marginBottom: normalize(5) }}
                />
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: normalize(12),
                    fontWeight: '600',
                  }}
                >
                  Web
                </Text>
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: COLORS.white,
                  borderRadius: normalize(10),
                  padding: normalize(12),
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.gray,
                }}
                onPress={handleShare}
              >
                <Icon
                  name="share"
                  size={normalize(20)}
                  color={COLORS.blue1}
                  style={{ marginBottom: normalize(5) }}
                />
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: normalize(12),
                    fontWeight: '600',
                  }}
                >
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
