import { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const [position, setPosition] = useState<Location.LocationObjectCoords | null>(null);
  const [mapRef, setMapRef] = useState<MapView | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { width } = useWindowDimensions();
  const isCompactIphone = Platform.OS === 'ios' && width < 600;

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setPosition(current.coords);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 3000,
        },
        (location) => setPosition(location.coords)
      );
    }

    startTracking();

    return () => {
      subscription?.remove();
    };
  }, []);

  function centerOnMe() {
    if (!position || !mapRef) return;

    mapRef.animateToRegion({
      latitude: position.latitude,
      longitude: position.longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    }, 500);
  }

  function showComingSoon(feature: string) {
    Alert.alert(feature, 'Questa funzione la realizziamo nel prossimo passaggio.');
  }

  return (
    <View style={styles.container}>
      {position ? (
        <MapView
          ref={setMapRef}
          style={styles.map}
          initialRegion={{
            latitude: position.latitude,
            longitude: position.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass
        >
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            tileSize={256}
          />
        </MapView>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#204B3A" />
          <Text style={styles.loadingText}>
            {permissionDenied
              ? 'Autorizza BIN ad accedere alla posizione'
              : 'Sto cercando la tua posizione GPS...'}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.logo}>BIN.</Text>
        <Text style={styles.subtitle}>La mappa intorno a te</Text>
      </View>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => showComingSoon('Impostazioni')}
        activeOpacity={0.75}
        accessibilityLabel="Impostazioni"
      >
        <Text style={styles.settingsIcon}>⚙</Text>
      </TouchableOpacity>

      <View style={[styles.bottomActions, isCompactIphone && styles.bottomActionsIphone]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => showComingSoon('Filtri')}
          activeOpacity={0.75}
          accessibilityLabel="Filtri"
        >
          <Text style={styles.actionIcon}>☷</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => showComingSoon('Aggiungi una segnalazione')}
          activeOpacity={0.75}
          accessibilityLabel="Aggiungi una segnalazione"
        >
          <Text style={styles.addIcon}>＋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={centerOnMe}
          activeOpacity={0.75}
          accessibilityLabel="Centra la mappa sulla mia posizione"
        >
          <Text style={styles.gpsArrow}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F4',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#315641',
    fontSize: 14,
  },
  header: {
    position: 'absolute',
    top: 55,
    left: 18,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  logo: {
    fontSize: 25,
    fontWeight: '900',
    color: '#204B3A',
  },
  subtitle: {
    color: '#64806B',
    fontSize: 12,
    marginTop: 2,
  },
  settingsButton: {
    position: 'absolute',
    top: 55,
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  settingsIcon: {
    fontSize: 25,
    color: '#315641',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 22,
    backgroundColor: 'white',
    elevation: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
  },
  bottomActionsIphone: {
    // Expo Go displays its own bottom navigation on iPhone during testing.
    // Lift BIN's controls above it; standalone builds keep the regular position.
    bottom: 112,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F5F7F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 27,
    color: '#315641',
    lineHeight: 31,
  },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#204B3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 35,
    fontWeight: '300',
    color: 'white',
    lineHeight: 39,
  },
  gpsArrow: {
    color: '#4285F4',
    fontSize: 27,
    transform: [{ rotate: '-45deg' }],
  },
});
