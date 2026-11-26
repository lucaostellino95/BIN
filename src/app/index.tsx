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
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

const CATEGORIES = [
  {
    id: 'acqua',
    label: 'Acqua',
    icon: '💧',
    subcategories: [
      { id: 'fontanelle', label: 'Fontanelle' },
      { id: 'acqua-potabile', label: 'Acqua potabile' },
      { id: 'sorgenti', label: 'Sorgenti' },
    ],
  },
  {
    id: 'servizi',
    label: 'Servizi',
    icon: '🗑️',
    subcategories: [
      { id: 'cestini', label: 'Cestini' },
      { id: 'bagni-pubblici', label: 'Bagni pubblici' },
      { id: 'distributori-sacchetti', label: 'Distributori sacchetti' },
    ],
  },
  {
    id: 'accessibilita',
    label: 'Accessibilità',
    icon: '♿',
    subcategories: [
      { id: 'rampe', label: 'Rampe' },
      { id: 'ascensori', label: 'Ascensori' },
      { id: 'percorsi-accessibili', label: 'Percorsi accessibili' },
      { id: 'parcheggi-riservati', label: 'Parcheggi riservati' },
    ],
  },
  {
    id: 'comfort',
    label: 'Comfort',
    icon: '🪑',
    subcategories: [
      { id: 'panchine', label: 'Panchine' },
      { id: 'tavoli', label: 'Tavoli' },
      { id: 'aree-riparate', label: 'Aree riparate' },
      { id: 'punti-ombra', label: 'Punti ombra' },
    ],
  },
  {
    id: 'animali',
    label: 'Animali',
    icon: '🐾',
    subcategories: [
      { id: 'aree-cani', label: 'Aree cani' },
      { id: 'fontanelle-animali', label: 'Fontanelle per animali' },
      { id: 'pet-friendly', label: 'Attività pet-friendly' },
    ],
  },
  {
    id: 'attivita',
    label: 'Attività',
    icon: '🏪',
    subcategories: [
      { id: 'negozi', label: 'Negozi' },
      { id: 'bar', label: 'Bar' },
      { id: 'ristoranti', label: 'Ristoranti' },
      { id: 'servizi-commerciali', label: 'Servizi commerciali' },
    ],
  },
  {
    id: 'mobilita',
    label: 'Mobilità',
    icon: '🚲',
    subcategories: [
      { id: 'parcheggi', label: 'Parcheggi' },
      { id: 'biciclette', label: 'Biciclette' },
      { id: 'colonnine', label: 'Colonnine' },
      { id: 'fermate', label: 'Fermate' },
    ],
  },
  {
    id: 'verde',
    label: 'Verde e tempo libero',
    icon: '🌳',
    subcategories: [
      { id: 'parchi', label: 'Parchi' },
      { id: 'giochi', label: 'Aree giochi' },
      { id: 'picnic', label: 'Aree picnic' },
      { id: 'sport', label: 'Sport' },
      { id: 'percorsi', label: 'Percorsi' },
    ],
  },
  {
    id: 'emergenza',
    label: 'Emergenza e sicurezza',
    icon: '🚨',
    subcategories: [
      { id: 'dae', label: 'DAE' },
      { id: 'primo-soccorso', label: 'Primo soccorso' },
      { id: 'dispositivi-emergenza', label: 'Dispositivi di emergenza' },
    ],
  },
];

const ALL_SUBCATEGORY_IDS = CATEGORIES.flatMap((category) =>
  category.subcategories.map((subcategory) => subcategory.id)
);

const DISTANCES = ['250 m', '500 m', '1 km', '2 km', '5 km', 'Tutti'];

type DemoPoint = {
  id: string;
  title: string;
  subcategoryId: string;
  icon: string;
  description: string;
  latitudeOffset: number;
  longitudeOffset: number;
};

const DEMO_POINTS: DemoPoint[] = [
  { id: 'demo-1', title: 'Fontanella di prova', subcategoryId: 'fontanelle', icon: '◆', description: 'Punto dimostrativo: fontanella pubblica.', latitudeOffset: 0.0011, longitudeOffset: 0.0007 },
  { id: 'demo-2', title: 'Cestino di prova', subcategoryId: 'cestini', icon: '▤', description: 'Punto dimostrativo: cestino pubblico.', latitudeOffset: -0.0010, longitudeOffset: 0.0011 },
  { id: 'demo-3', title: 'Panchina di prova', subcategoryId: 'panchine', icon: '▰', description: 'Punto dimostrativo: panchina.', latitudeOffset: 0.0004, longitudeOffset: -0.0015 },
  { id: 'demo-4', title: 'Bagno pubblico di prova', subcategoryId: 'bagni-pubblici', icon: 'WC', description: 'Punto dimostrativo: bagno pubblico.', latitudeOffset: -0.0018, longitudeOffset: -0.0005 },
  { id: 'demo-5', title: 'Area cani di prova', subcategoryId: 'aree-cani', icon: '♧', description: 'Punto dimostrativo: area dedicata ai cani.', latitudeOffset: 0.0020, longitudeOffset: 0.0018 },
  { id: 'demo-6', title: 'Parcheggio di prova', subcategoryId: 'parcheggi', icon: 'P', description: 'Punto dimostrativo: parcheggio.', latitudeOffset: -0.0022, longitudeOffset: 0.0016 },
  { id: 'demo-7', title: 'Parco di prova', subcategoryId: 'parchi', icon: '♣', description: 'Punto dimostrativo: area verde.', latitudeOffset: 0.0025, longitudeOffset: -0.0017 },
  { id: 'demo-8', title: 'DAE di prova', subcategoryId: 'dae', icon: '⚡', description: 'Punto dimostrativo: defibrillatore.', latitudeOffset: -0.0027, longitudeOffset: -0.0018 },
  { id: 'demo-9', title: 'Rampa accessibile di prova', subcategoryId: 'rampe', icon: '♿', description: 'Punto dimostrativo: rampa per l’accessibilità.', latitudeOffset: 0.0002, longitudeOffset: 0.0028 },
  { id: 'demo-10', title: 'Fermata bus di prova', subcategoryId: 'fermate', icon: '↔', description: 'Punto dimostrativo: fermata del trasporto pubblico.', latitudeOffset: 0.0030, longitudeOffset: 0.0004 },
];

function distanceBetweenMeters(latitude1: number, longitude1: number, latitude2: number, longitude2: number) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;
  const latitudeDelta = toRadians(latitude2 - latitude1);
  const longitudeDelta = toRadians(longitude2 - longitude1);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(latitude1)) * Math.cos(toRadians(latitude2)) *
    Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceLimitMeters(distance: string) {
  if (distance === 'Tutti') return Number.POSITIVE_INFINITY;
  const value = Number.parseFloat(distance);
  return distance.includes('km') ? value * 1000 : value;
}

export default function HomeScreen() {
  const [position, setPosition] = useState<Location.LocationObjectCoords | null>(null);
  const [mapRef, setMapRef] = useState<MapView | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState('Tutti');
  const [appliedSubcategories, setAppliedSubcategories] = useState<string[] | null>(null);
  const [appliedDistance, setAppliedDistance] = useState('Tutti');
  const [selectedPoint, setSelectedPoint] = useState<(DemoPoint & { latitude: number; longitude: number }) | null>(null);
  const [selectedPointScreenPosition, setSelectedPointScreenPosition] = useState<{ x: number; y: number } | null>(null);
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

  async function openPointCard(point: DemoPoint & { latitude: number; longitude: number }) {
    if (!mapRef) return;

    try {
      const screenPosition = await mapRef.pointForCoordinate({
        latitude: point.latitude,
        longitude: point.longitude,
      });
      setSelectedPoint(point);
      setSelectedPointScreenPosition(screenPosition);
    } catch {
      setSelectedPoint(point);
      setSelectedPointScreenPosition({
        x: width / 2,
        y: height / 2,
      });
    }
  }

  function closeMapOverlays() {
    setFiltersOpen(false);
    setFiltersExpanded(false);
    setSelectedPoint(null);
    setSelectedPointScreenPosition(null);
  }

  function showComingSoon(feature: string) {
    Alert.alert(feature, 'Questa funzione la realizziamo nel prossimo passaggio.');
  }

  function toggleCategory(categoryId: string) {
    const category = CATEGORIES.find((item) => item.id === categoryId);
    if (!category) return;

    const categoryIds = category.subcategories.map((item) => item.id);
    const allSelected = categoryIds.every((id) => selectedSubcategories.includes(id));

    setSelectedSubcategories((current) =>
      allSelected
        ? current.filter((id) => !categoryIds.includes(id))
        : Array.from(new Set([...current, ...categoryIds]))
    );
  }

  function toggleSubcategory(subcategoryId: string) {
    setSelectedSubcategories((current) =>
      current.includes(subcategoryId)
        ? current.filter((id) => id !== subcategoryId)
        : [...current, subcategoryId]
    );
  }

  function selectAllCategories() {
    setSelectedSubcategories(ALL_SUBCATEGORY_IDS);
  }

  function clearCategories() {
    setSelectedSubcategories([]);
  }

  function resetFilters() {
    setSelectedSubcategories([]);
    setSelectedDistance('Tutti');
    setExpandedCategory(null);
  }

  const demoPoints = position
    ? DEMO_POINTS.map((point) => ({
        ...point,
        latitude: position.latitude + point.latitudeOffset,
        longitude: position.longitude + point.longitudeOffset,
      }))
    : [];

  const visibleDemoPoints = position
    ? demoPoints.filter((point) =>
        (!appliedSubcategories || appliedSubcategories.length === 0 ||
          appliedSubcategories.includes(point.subcategoryId)) &&
        distanceBetweenMeters(position.latitude, position.longitude, point.latitude, point.longitude) <=
          distanceLimitMeters(appliedDistance)
      )
    : [];

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
          onPress={closeMapOverlays}
        >
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            tileSize={256}
          />
          {visibleDemoPoints.map((point) => (
            <Marker
              key={point.id}
              coordinate={{ latitude: point.latitude, longitude: point.longitude }}
              anchor={{ x: 0.5, y: 1 }}
              onPress={() => openPointCard(point)}
              tracksViewChanges
            >
              <View style={styles.mapPin}>
                <View style={styles.mapPinCircle}>
                  <Text style={styles.mapPinIcon}>{point.icon}</Text>
                </View>
                <View style={styles.mapPinTail} />
              </View>
            </Marker>
          ))}
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
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setFiltersExpanded((expanded) => !expanded)}
            activeOpacity={0.7}
            accessibilityLabel={filtersExpanded ? 'Riduci pannello' : 'Espandi pannello'}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.expandButtonText,
                filtersExpanded && styles.expandButtonTextDown,
              ]}
            >
              ⌃
            </Text>
          </TouchableOpacity>
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

            <View style={styles.categoryList}>
              {CATEGORIES.map((category) => {
                const selectedCount = category.subcategories.filter((item) =>
                  selectedSubcategories.includes(item.id)
                ).length;
                const allSelected = selectedCount === category.subcategories.length;
                const partiallySelected = selectedCount > 0 && !allSelected;
                const expanded = expandedCategory === category.id;

                return (
                  <View key={category.id} style={styles.categoryAccordion}>
                    <View style={styles.categoryHeaderRow}>
                      <TouchableOpacity
                        style={styles.categoryHeaderButton}
                        onPress={() => toggleCategory(category.id)}
                        activeOpacity={0.75}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: allSelected }}
                      >
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                        <Text
                          style={[
                            styles.categoryLabel,
                            (allSelected || partiallySelected) && styles.categoryLabelSelected,
                          ]}
                        >
                          {category.label}
                        </Text>
                        <Text style={styles.categoryCount}>
                          {selectedCount}/{category.subcategories.length}
                        </Text>
                        <View
                          style={[
                            styles.selectionMark,
                            allSelected && styles.selectionMarkSelected,
                            partiallySelected && styles.selectionMarkPartial,
                          ]}
                        >
                          {allSelected && <Text style={styles.selectionCheck}>✓</Text>}
                          {partiallySelected && <View style={styles.selectionPartialLine} />}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.categoryExpandButton}
                        onPress={() =>
                          setExpandedCategory(expanded ? null : category.id)
                        }
                        activeOpacity={0.7}
                        accessibilityLabel={expanded ? 'Nascondi sottocategorie' : 'Mostra sottocategorie'}
                        accessibilityState={{ expanded }}
                      >
                        <Text
                          style={[
                            styles.categoryExpandText,
                            expanded && styles.categoryExpandTextUp,
                          ]}
                        >
                          ⌄
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {expanded && (
                      <View style={styles.subcategoryList}>
                        {category.subcategories.map((subcategory) => {
                          const selected = selectedSubcategories.includes(subcategory.id);
                          return (
                            <TouchableOpacity
                              key={subcategory.id}
                              style={[
                                styles.subcategoryOption,
                                selected && styles.subcategoryOptionSelected,
                              ]}
                              onPress={() => toggleSubcategory(subcategory.id)}
                              activeOpacity={0.75}
                              accessibilityRole="checkbox"
                              accessibilityState={{ checked: selected }}
                            >
                              <Text
                                style={[
                                  styles.subcategoryLabel,
                                  selected && styles.subcategoryLabelSelected,
                                ]}
                              >
                                {subcategory.label}
                              </Text>
                              <View
                                style={[
                                  styles.subcategoryMark,
                                  selected && styles.subcategoryMarkSelected,
                                ]}
                              >
                                {selected && <Text style={styles.subcategoryCheck}>✓</Text>}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
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
              {CATEGORIES.filter((category) =>
                category.subcategories.some((item) => selectedSubcategories.includes(item.id))
              ).length} categorie · {selectedSubcategories.length} sottocategorie selezionate
            </Text>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setAppliedSubcategories(selectedSubcategories);
                setAppliedDistance(selectedDistance);
                setSelectedPoint(null);
                setSelectedPointScreenPosition(null);
                setFiltersOpen(false);
                setFiltersExpanded(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Mostra sulla mappa</Text>
            </TouchableOpacity>
          </View>

        </View>
      )}

      {selectedPoint && selectedPointScreenPosition && (
        <View
          style={[
            styles.pointCard,
            {
              left: Math.max(12, Math.min(selectedPointScreenPosition.x - 145, width - 302)),
              top: selectedPointScreenPosition.y > 190
                ? selectedPointScreenPosition.y - 164
                : selectedPointScreenPosition.y + 22,
            },
          ]}
        >
          <View style={styles.pointCardTopRow}>
            <View style={styles.pointCardIcon}>
              <Text style={styles.pointCardIconText}>{selectedPoint.icon}</Text>
            </View>
            <View style={styles.pointCardCopy}>
              <Text style={styles.pointCardTitle}>{selectedPoint.title}</Text>
              <Text style={styles.pointCardCategory}>
                {CATEGORIES.flatMap((category) => category.subcategories)
                  .find((subcategory) => subcategory.id === selectedPoint.subcategoryId)?.label}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.pointCardClose}
              onPress={() => {
                setSelectedPoint(null);
                setSelectedPointScreenPosition(null);
              }}
              accessibilityLabel="Chiudi scheda punto"
              activeOpacity={0.7}
            >
              <Text style={styles.pointCardCloseText}>×</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.pointCardDescription}>{selectedPoint.description}</Text>
          <View style={styles.pointCardFooter}>
            <View style={styles.demoDot} />
            <Text style={styles.demoNotice}>Punto dimostrativo · posizione non reale</Text>
          </View>
        </View>
      )}

      <View style={[styles.bottomActions, isCompactIphone && styles.bottomActionsIphone]}>
        <TouchableOpacity
          style={[styles.actionButton, filtersOpen && styles.actionButtonActive]}
          onPress={() => {
            setFiltersOpen((open) => !open);
          }}
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
  mapPin: {
    width: 38,
    height: 45,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mapPinCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#204B3A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
  },
  mapPinIcon: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },
  mapPinTail: {
    position: 'absolute',
    top: 26,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#204B3A',
  },
  pointCard: {
    position: 'absolute',
    width: 290,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    elevation: 14,
    shadowColor: '#173B2A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EEE8',
  },
  pointCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointCardClose: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: '#F1F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointCardCloseText: {
    color: '#315641',
    fontSize: 22,
    lineHeight: 25,
  },
  pointCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#204B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointCardIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  pointCardCopy: {
    flex: 1,
  },
  pointCardTitle: {
    color: '#204B3A',
    fontSize: 15,
    fontWeight: '800',
    flexShrink: 1,
  },
  pointCardCategory: {
    color: '#64806B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  pointCardDescription: {
    color: '#526357',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 12,
  },
  pointCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  demoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A8B9AA',
  },
  demoNotice: {
    color: '#9AA69D',
    fontSize: 10,
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
  categoryList: {
    gap: 7,
  },
  categoryAccordion: {
    borderWidth: 1,
    borderColor: '#E5EBE5',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  categoryHeaderRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryHeaderButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 7,
    gap: 8,
  },
  categoryExpandButton: {
    width: 40,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryExpandText: {
    color: '#789080',
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
    transform: [{ translateY: -1 }],
  },
  categoryExpandTextUp: {
    transform: [{ rotate: '180deg' }, { translateY: -1 }],
  },
  categoryCount: {
    color: '#8A9B8E',
    fontSize: 11,
    fontWeight: '600',
    marginRight: 2,
  },
  subcategoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 9,
    paddingTop: 2,
    paddingBottom: 10,
    gap: 7,
  },
  subcategoryOption: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EBE5',
    backgroundColor: '#F8FAF8',
    gap: 7,
  },
  subcategoryOptionSelected: {
    borderColor: '#A8BEAC',
    backgroundColor: '#EDF4EE',
  },
  subcategoryLabel: {
    color: '#68796D',
    fontSize: 11,
    fontWeight: '600',
  },
  subcategoryLabelSelected: {
    color: '#204B3A',
  },
  subcategoryMark: {
    width: 14,
    height: 14,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#C8D3C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subcategoryMarkSelected: {
    backgroundColor: '#315641',
    borderColor: '#315641',
  },
  subcategoryCheck: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  selectionMarkPartial: {
    backgroundColor: '#DDE9DF',
    borderColor: '#9AB5A0',
  },
  selectionPartialLine: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#315641',
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
    alignSelf: 'center',
    width: 42,
    height: 30,
    marginBottom: 2,
    borderRadius: 15,
    backgroundColor: '#F1F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButtonText: {
    color: '#315641',
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
    includeFontPadding: false,
    transform: [{ translateY: 1 }],
  },
  expandButtonTextDown: {
    transform: [{ rotate: '180deg' }, { translateY: 1 }],
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
