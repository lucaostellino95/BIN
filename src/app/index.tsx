import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

const CATEGORIES = [
  { id: 'acqua', label: 'Acqua', icon: '💧' },
  { id: 'servizi', label: 'Servizi', icon: '🗑️' },
  { id: 'accessibilita', label: 'Accessibilità', icon: '♿' },
  { id: 'comfort', label: 'Comfort', icon: '🪑' },
  { id: 'animali', label: 'Animali', icon: '🐾' },
  { id: 'attivita', label: 'Attività', icon: '🏪' },
];

const DISTANCES = ['250 m', '500 m', '1 km', '2 km', '5 km', 'Tutti'];

export default function HomeScreen() {
  const [position, setPosition] = useState<Location.LocationObjectCoords | null>(null);
  const [mapRef, setMapRef] = useState<MapView | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    CATEGORIES.map((category) => category.id)
  );
  const [selectedDistance, setSelectedDistance] = useState('Tutti');
  const { width, height } = useWindowDimensions();
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

  function toggleCategory(categoryId: string) {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  }

  function selectAllCategories() {
    setSelectedCategories(CATEGORIES.map((category) => category.id));
  }

  function clearCategories() {
    setSelectedCategories([]);
  }

  const filterPanelHeight = filtersExpanded
    ? Math.min(height * 0.72, 620)
    : Math.min(height * 0.46, 390);

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

      {filtersOpen && (
        <View
          style={[
            styles.filterPanel,
            {
              height: filterPanelHeight,
              bottom: isCompactIphone ? 180 : 96,
            },
          ]}
        >
          <View style={styles.panelHandle} />
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>Filtra la mappa</Text>
              <Text style={styles.panelSubtitle}>Scegli cosa vuoi vedere intorno a te</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setFiltersOpen(false);
                setFiltersExpanded(false);
              }}
              activeOpacity={0.7}
              accessibilityLabel="Chiudi filtri"
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.filterScroll}
            contentContainerStyle={styles.filterScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Categorie</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity onPress={selectAllCategories} activeOpacity={0.7}>
                  <Text style={styles.quickActionText}>Tutte</Text>
                </TouchableOpacity>
                <Text style={styles.quickActionSeparator}>·</Text>
                <TouchableOpacity onPress={clearCategories} activeOpacity={0.7}>
                  <Text style={styles.quickActionText}>Nessuna</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => {
                const selected = selectedCategories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selected && styles.categoryOptionSelected,
                    ]}
                    onPress={() => toggleCategory(category.id)}
                    activeOpacity={0.75}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        selected && styles.categoryLabelSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                    <View
                      style={[
                        styles.selectionMark,
                        selected && styles.selectionMarkSelected,
                      ]}
                    >
                      {selected && <Text style={styles.selectionCheck}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.distanceHeading}>
              <Text style={styles.sectionTitle}>Distanza</Text>
              <Text style={styles.distanceValue}>{selectedDistance}</Text>
            </View>
            <View style={styles.distanceOptions}>
              {DISTANCES.map((distance) => {
                const selected = selectedDistance === distance;
                return (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceOption,
                      selected && styles.distanceOptionSelected,
                    ]}
                    onPress={() => setSelectedDistance(distance)}
                    activeOpacity={0.75}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.distanceLabel,
                        selected && styles.distanceLabelSelected,
                      ]}
                    >
                      {distance}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.panelFooter}>
            <Text style={styles.selectionSummary}>
              {selectedCategories.length} categorie selezionate
            </Text>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setFiltersOpen(false);
                setFiltersExpanded(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Mostra sulla mappa</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setFiltersExpanded((expanded) => !expanded)}
            activeOpacity={0.7}
            accessibilityLabel={filtersExpanded ? 'Riduci pannello' : 'Espandi pannello'}
          >
            <Text style={styles.expandButtonText}>{filtersExpanded ? '⌄' : '⌃'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.bottomActions, isCompactIphone && styles.bottomActionsIphone]}>
        <TouchableOpacity
          style={[styles.actionButton, filtersOpen && styles.actionButtonActive]}
          onPress={() => setFiltersOpen((open) => !open)}
          activeOpacity={0.75}
          accessibilityLabel="Filtri"
          accessibilityState={{ expanded: filtersOpen }}
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
  filterPanel: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  panelHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9E1DA',
    marginBottom: 13,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  panelTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#204B3A',
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#789080',
    marginTop: 3,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F1F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 25,
    lineHeight: 28,
    color: '#315641',
  },
  filterScroll: {
    flex: 1,
  },
  filterScrollContent: {
    paddingBottom: 10,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#315641',
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#47745A',
  },
  quickActionSeparator: {
    color: '#A8B6AA',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  categoryOption: {
    width: '48.5%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E5EBE5',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  categoryOptionSelected: {
    borderColor: '#9AB5A0',
    backgroundColor: '#F0F5F0',
  },
  categoryIcon: {
    fontSize: 19,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 12,
    color: '#647568',
    fontWeight: '600',
  },
  categoryLabelSelected: {
    color: '#204B3A',
  },
  selectionMark: {
    width: 17,
    height: 17,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C8D3C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionMarkSelected: {
    backgroundColor: '#315641',
    borderColor: '#315641',
  },
  selectionCheck: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  distanceHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  distanceValue: {
    color: '#64806B',
    fontSize: 12,
    fontWeight: '700',
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  distanceOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F6F3',
    borderWidth: 1,
    borderColor: '#E8EEE8',
  },
  distanceOptionSelected: {
    backgroundColor: '#204B3A',
    borderColor: '#204B3A',
  },
  distanceLabel: {
    fontSize: 12,
    color: '#617466',
    fontWeight: '600',
  },
  distanceLabelSelected: {
    color: '#FFFFFF',
  },
  panelFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EDF1ED',
    paddingTop: 11,
    marginTop: 7,
    gap: 9,
  },
  selectionSummary: {
    color: '#829187',
    fontSize: 11,
    textAlign: 'center',
  },
  applyButton: {
    height: 43,
    borderRadius: 14,
    backgroundColor: '#204B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  expandButton: {
    position: 'absolute',
    top: 8,
    right: 58,
    width: 26,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButtonText: {
    color: '#8A9B8E',
    fontSize: 19,
    fontWeight: '700',
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
  actionButtonActive: {
    backgroundColor: '#E5EEE6',
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
