import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  PanResponder,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
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

const PIN_COLORS: Record<string, string> = {
  fontanelle: '#249BD1',
  'acqua-potabile': '#249BD1',
  sorgenti: '#249BD1',
  cestini: '#777F88',
  'bagni-pubblici': '#1769AA',
  'distributori-sacchetti': '#777F88',
  rampe: '',
  ascensori: '#815DB5',
  'percorsi-accessibili': '#815DB5',
  'parcheggi-riservati': '#815DB5',
  panchine: '#D99A36',
  tavoli: '#D99A36',
  'aree-riparate': '#D99A36',
  'punti-ombra': '#D99A36',
  'aree-cani': '#D47791',
  'fontanelle-animali': '#D47791',
  'pet-friendly': '#D47791',
  negozi: '#287C83',
  bar: '#287C83',
  ristoranti: '#287C83',
  'servizi-commerciali': '#287C83',
  parcheggi: '#536D9D',
  biciclette: '#536D9D',
  colonnine: '#536D9D',
  fermate: '#536D9D',
  parchi: '#32865A',
  giochi: '#32865A',
  picnic: '#32865A',
  sport: '#32865A',
  percorsi: '#32865A',
  dae: '#D45C4D',
  'primo-soccorso': '#D45C4D',
  'dispositivi-emergenza': '#D45C4D',
};

const PIN_DARK_COLORS: Record<string, string> = {
  fontanelle: '#1675A8',
  'acqua-potabile': '#1675A8',
  sorgenti: '#1675A8',
  cestini: '#555D65',
  'bagni-pubblici': '#104C80',
  'distributori-sacchetti': '#555D65',
  rampe: '#62428F',
  ascensori: '#62428F',
  'percorsi-accessibili': '#62428F',
  'parcheggi-riservati': '#62428F',
  panchine: '#A96F1D',
  tavoli: '#A96F1D',
  'aree-riparate': '#A96F1D',
  'punti-ombra': '#A96F1D',
  'aree-cani': '#A94E69',
  'fontanelle-animali': '#A94E69',
  'pet-friendly': '#A94E69',
  negozi: '#185B60',
  bar: '#185B60',
  ristoranti: '#185B60',
  'servizi-commerciali': '#185B60',
  parcheggi: '#3A5078',
  biciclette: '#3A5078',
  colonnine: '#3A5078',
  fermate: '#3A5078',
  parchi: '#205C3B',
  giochi: '#205C3B',
  picnic: '#205C3B',
  sport: '#205C3B',
  percorsi: '#205C3B',
  dae: '#A83E33',
  'primo-soccorso': '#A83E33',
  'dispositivi-emergenza': '#A83E33',
};

const PIN_ICON_PATHS: Record<string, string> = {
  fontanelle: 'M12 2 C10 6 5 11 5 15 A7 7 0 0 0 19 15 C19 11 14 6 12 2 Z M8.5 16.5 C9 18 10 19 12 19',
  'acqua-potabile': 'M12 2 C10 6 5 11 5 15 A7 7 0 0 0 19 15 C19 11 14 6 12 2 Z M8.5 14.5 L11 17 L16 11.5',
  sorgenti: 'M2 17 L7 11 L11 15 L16 8 L22 17 M3 21 H21 M8 5 C9 3 11 3 12 5 M14 5 C15 3 17 3 18 5',
  cestini: 'M5 7 H19 M9 7 V4 H15 V7 M7 7 L8 21 H16 L17 7 M10 10 V18 M14 10 V18',
  'bagni-pubblici': '',
  'distributori-sacchetti': 'M7 8 V6 A5 5 0 0 1 17 6 V8 M5 8 H19 L18 21 H6 Z M9 12 V17 M15 12 V17',
  rampe: 'M9 2 A2 2 0 1 0 9 6 A2 2 0 0 0 9 2 M9 7 L13 9 L17 9 L19 13 M13 9 L11 14 L15 17 M15 17 A5 5 0 1 0 23 17 M9 8 L6 13 L11 13',
  ascensori: 'M4 3 H20 V21 H4 Z M12 7 V17 M9 10 L12 7 L15 10 M9 14 L12 17 L15 14',
  'percorsi-accessibili': 'M3 17 L8 11 L12 15 L17 8 L21 12 M3 21 H21 M7 5 A2 2 0 1 0 7 9 A2 2 0 0 0 7 5',
  'parcheggi-riservati': 'M7 21 V3 H13 A6 6 0 0 1 13 15 H7 M7 9 H13 A2 2 0 0 0 13 5 H7',
  panchine: 'M4 12 H20 V17 H4 Z M6 17 V21 M18 17 V21 M5 8 H19 V12 H5 Z',
  tavoli: 'M3 10 H21 V13 H3 Z M6 13 V21 M18 13 V21 M12 13 V21',
  'aree-riparate': 'M3 11 L12 4 L21 11 M5 10 V20 H19 V10 M9 20 V14 H15 V20',
  'punti-ombra': 'M12 3 V21 M3 12 H21 M5.5 5.5 L18.5 18.5 M18.5 5.5 L5.5 18.5 M8 4 A8 8 0 0 1 20 16',
  'aree-cani': 'M5 8 A2 2 0 1 0 5 4 A2 2 0 0 0 5 8 M12 6 A2 2 0 1 0 12 2 A2 2 0 0 0 12 6 M19 8 A2 2 0 1 0 19 4 A2 2 0 0 0 19 8 M12 12 C8 8 4 12 6 17 C8 22 10 19 12 19 C14 19 16 22 18 17 C20 12 16 8 12 12 Z',
  'fontanelle-animali': 'M12 2 C10 6 5 11 5 15 A7 7 0 0 0 19 15 C19 11 14 6 12 2 Z M4 21 H20 M7 18 L5 21 M17 18 L19 21',
  'pet-friendly': 'M5 8 A2 2 0 1 0 5 4 A2 2 0 0 0 5 8 M12 6 A2 2 0 1 0 12 2 A2 2 0 0 0 12 6 M19 8 A2 2 0 1 0 19 4 A2 2 0 0 0 19 8 M12 12 C8 8 4 12 6 17 C8 22 10 19 12 19 C14 19 16 22 18 17 C20 12 16 8 12 12 Z',
  negozi: 'M4 10 H20 V21 H4 Z M3 10 L5 4 H19 L21 10 M3 10 A3 3 0 0 0 9 10 A3 3 0 0 0 15 10 A3 3 0 0 0 21 10 M9 21 V15 H15 V21',
  bar: 'M4 5 H18 L17 14 H7 Z M18 7 H20 A3 3 0 0 1 20 13 H17 M9 18 H16 M12 14 V18 M8 21 H17',
  ristoranti: 'M6 3 V10 M3 3 V8 A3 3 0 0 0 9 8 V3 M6 10 V21 M16 3 C13 7 13 12 17 13 V21 M17 3 V13',
  'servizi-commerciali': 'M4 5 H20 V19 H4 Z M8 9 H16 M8 13 H16 M8 17 H13',
  parcheggi: 'M7 21 V3 H14 A6 6 0 0 1 14 15 H7',
  biciclette: 'M5 17 A4 4 0 1 0 5 9 A4 4 0 0 0 5 17 M19 17 A4 4 0 1 0 19 9 A4 4 0 0 0 19 17 M5 13 L10 7 L14 13 H5 L10 13 L14 7 H17',
  colonnine: 'M7 3 H17 V21 H7 Z M10 7 L14 7 L12 12 L15 12 L9 19 L11 13 H8 Z',
  fermate: 'M5 3 H19 V17 H5 Z M8 7 H16 V12 H8 Z M8 20 H8.1 M16 20 H16.1 M8 17 V20 M16 17 V20',
  parchi: 'M12 3 L5 13 H9 L5 19 H19 L15 13 H19 Z M12 19 V22',
  giochi: 'M4 14 L12 5 L20 14 M6 13 V21 H18 V13 M9 16 H15 V21',
  picnic: 'M3 10 H21 M5 10 L7 21 M19 10 L17 21 M8 10 L12 3 L16 10 M9 15 H15',
  sport: 'M12 3 A9 9 0 1 0 12 21 A9 9 0 1 0 12 3 M3 12 H21 M12 3 C8 7 8 17 12 21 M12 3 C16 7 16 17 12 21',
  percorsi: 'M3 18 L8 12 L12 15 L17 7 L21 10 M3 21 H21 M17 7 H21 V11',
  dae: 'M5 3 H19 Q21 3 21 5 V19 Q21 21 19 21 H5 Q3 21 3 19 V5 Q3 3 5 3 Z M12 6 C10 4 7 6 8 9 C8.5 11 12 14 12 14 C12 14 15.5 11 16 9 C17 6 14 4 12 6 Z M13 8 L10 11 H12 L11 13 L15 9 H13 Z',
  'primo-soccorso': 'M12 3 A9 9 0 1 0 12 21 A9 9 0 1 0 12 3 M12 7 V17 M7 12 H17',
  'dispositivi-emergenza': 'M5 4 H19 V20 H5 Z M9 8 H15 M12 8 V16 M9 12 H15',
};

function MapPin({ subcategoryId }: { subcategoryId: string }) {
  const color = PIN_COLORS[subcategoryId] ?? '#32865A';
  const darkColor = PIN_DARK_COLORS[subcategoryId] ?? '#205C3B';
  const iconPath = PIN_ICON_PATHS[subcategoryId] ?? PIN_ICON_PATHS.parchi;

  return (
    <View style={styles.mapPin}>
      <Svg width={48} height={58} viewBox="0 0 48 58">
        <Defs>
          <LinearGradient id="binPinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={darkColor} />
          </LinearGradient>
        </Defs>
        <Path
          d="M24 2 C12.4 2 3 11.2 3 22.8 C3 36.1 24 55.5 24 55.5 C24 55.5 45 36.1 45 22.8 C45 11.2 35.6 2 24 2 Z"
          fill="url(#binPinGradient)"
          stroke="#FFFFFF"
          strokeWidth={1.7}
        />
        <G transform="translate(12 12)">
          {subcategoryId === 'bagni-pubblici' ? (
            <SvgText x="12" y="16.5" fill="#FFFFFF" fontSize="10.5" fontWeight="bold" textAnchor="middle" letterSpacing={0.2}>WC</SvgText>
          ) : subcategoryId === 'parcheggi' ? (
            <Path d={iconPath} fill="none" stroke="#FFFFFF" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
          ) : subcategoryId === 'dae' ? (
            <>
              <Path d="M5 3 H19 Q21 3 21 5 V19 Q21 21 19 21 H5 Q3 21 3 19 V5 Q3 3 5 3 Z" fill="none" stroke="#FFFFFF" strokeWidth={1.8} strokeLinejoin="round" />
              <Path d="M12 7 C10 5 7 7 8 10 C8.5 12 12 14 12 14 C12 14 15.5 12 16 10 C17 7 14 5 12 7 Z" fill="none" stroke="#FFFFFF" strokeWidth={1.5} strokeLinejoin="round" />
              <Path d="M12.8 7.7 L10.8 10.1 H12.2 L11.5 12.7 L14 9.8 H12.7 Z" fill="#FFFFFF" />
            </>
          ) : subcategoryId === 'rampe' ? (
            <>
              {/* International Symbol of Access (ISA), 1968 — ISO 7001 */}
              <Circle cx={9.1} cy={2.7} r={1.9} fill="#FFFFFF" />
              <Path
                d="M8.2 5 L8.8 12.5 L15.5 12.5 L19.5 20.2 L21.8 19.2 M8.6 8.4 H14.6"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={2.35}
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
              <Path
                d="M5.1 8.7 A8.2 8.2 0 0 1 17.5 19"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={2.2}
                strokeLinecap="square"
              />
            </>
          ) : (
            <Path
              d={iconPath}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={subcategoryId === 'rampe' ? 2.2 : 1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </G>
      </Svg>
    </View>
  );
}

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
  const markerPressRef = useRef(false);
  const [pointSheetExpanded, setPointSheetExpanded] = useState(false);
  const { width, height } = useWindowDimensions();
  const isCompactIphone = Platform.OS === 'ios' && width < 600;

  const sheetMaxTravel = height * 0.43;
  const sheetMaxTravelRef = useRef(sheetMaxTravel);
  const sheetTranslateY = useRef(new Animated.Value(sheetMaxTravel)).current;
  const sheetExpandedRef = useRef(pointSheetExpanded);
  const sheetStartYRef = useRef(sheetMaxTravel);

  sheetMaxTravelRef.current = sheetMaxTravel;
  sheetExpandedRef.current = pointSheetExpanded;

  useEffect(() => {
    const target = pointSheetExpanded ? 0 : sheetMaxTravel;
    Animated.spring(sheetTranslateY, {
      toValue: target,
      stiffness: 260,
      damping: 30,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [height, pointSheetExpanded, sheetMaxTravel, sheetTranslateY]);

  const sheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_event, gestureState) =>
        Math.abs(gestureState.dy) > 2,
      onPanResponderGrant: () => {
        sheetStartYRef.current = sheetExpandedRef.current ? 0 : sheetMaxTravelRef.current;
        sheetTranslateY.stopAnimation();
      },
      onPanResponderMove: (_event, gestureState) => {
        const nextPosition = Math.max(
          0,
          Math.min(sheetMaxTravelRef.current, sheetStartYRef.current + gestureState.dy)
        );
        sheetTranslateY.setValue(nextPosition);
      },
      onPanResponderRelease: (_event, gestureState) => {
        const currentPosition = Math.max(
          0,
          Math.min(sheetMaxTravelRef.current, sheetStartYRef.current + gestureState.dy)
        );
        const shouldExpand = gestureState.vy < -0.45 ||
          (Math.abs(gestureState.vy) <= 0.45 && currentPosition < sheetMaxTravelRef.current / 2);
        setPointSheetExpanded(shouldExpand);
      },
      onPanResponderTerminate: () => {
        setPointSheetExpanded(sheetExpandedRef.current);
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

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

  function openPointCard(point: DemoPoint & { latitude: number; longitude: number }) {
    setSelectedPoint(point);
    setFiltersOpen(false);
    setFiltersExpanded(false);
  }

  function handleMapTap() {
    if (markerPressRef.current) {
      markerPressRef.current = false;
      return;
    }
    if (filtersOpen) {
      setAppliedSubcategories(selectedSubcategories);
      setAppliedDistance(selectedDistance);
      setFiltersOpen(false);
      setFiltersExpanded(false);
    }
    if (selectedPoint) {
      setSelectedPoint(null);
      setPointSheetExpanded(false);
    }
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

  function applyFilters() {
    setAppliedSubcategories(selectedSubcategories);
    setAppliedDistance(selectedDistance);
    setFiltersOpen(false);
    setFiltersExpanded(false);
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
          onPress={handleMapTap}
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
              onPress={() => {
                markerPressRef.current = true;
                openPointCard(point);
                setTimeout(() => {
                  markerPressRef.current = false;
                }, 250);
              }}
              tracksViewChanges
            >
              <MapPin subcategoryId={point.subcategoryId} />
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
            <View style={styles.filterFooterButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
                activeOpacity={0.75}
                accessibilityRole="button"
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, styles.applyButtonFlex]}
                onPress={applyFilters}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <Text style={styles.applyButtonText}>Applica filtri</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.tapHint}>Puoi anche toccare la mappa per applicarli</Text>
          </View>

        </View>
      )}

      {selectedPoint && (
        <Animated.View
          collapsable={false}
          style={[
            styles.pointSheet,
            {
              height: height * 0.78,
              opacity: 1,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <View
            style={styles.sheetHandleArea}
            {...sheetPanResponder.panHandlers}
            accessible
            accessibilityRole="button"
            accessibilityLabel={pointSheetExpanded ? 'Trascina verso il basso per ridurre la scheda' : 'Trascina verso l’alto per espandere la scheda'}
            accessibilityState={{ expanded: pointSheetExpanded }}
          >
            <View style={styles.sheetHandle} />
          </View>

          <ScrollView
            style={styles.pointSheetScroll}
            contentContainerStyle={styles.pointSheetContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
          >
            <View style={styles.pointSheetHeader}>
              <View style={styles.pointSheetTitleGroup}>
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
              </View>
              <TouchableOpacity activeOpacity={1}
                style={styles.pointCardClose}
                onPress={() => {
                  setSelectedPoint(null);
                  setPointSheetExpanded(false);
                }}
                accessibilityLabel="Chiudi scheda punto"
              >
                <Text style={styles.pointCardCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pointPhotoPlaceholder}>
              <View style={styles.pointPhotoIconWrap}>
                <Text style={styles.pointPhotoIcon}>▧</Text>
              </View>
              <Text style={styles.pointPhotoTitle}>Nessuna foto disponibile</Text>
              <Text style={styles.pointPhotoSubtitle}>Le foto condivise dalla community appariranno qui</Text>
            </View>

            <View style={styles.pointQuickActions}>
              <TouchableWithoutFeedback onPress={() => showComingSoon('Indicazioni')}>
                <View collapsable={false} style={styles.pointQuickAction}>
                <Text style={styles.pointQuickActionIcon}>➤</Text>
                <Text style={styles.pointQuickActionLabel}>Indicazioni</Text>
              </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => showComingSoon('Segnala un problema')}>
                <View collapsable={false} style={styles.pointQuickAction}>
                <Text style={styles.pointQuickActionIcon}>⚑</Text>
                <Text style={styles.pointQuickActionLabel}>Segnala</Text>
              </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => showComingSoon('Aggiungi una foto')}>
                <View collapsable={false} style={styles.pointQuickAction}>
                <Text style={styles.pointQuickActionIcon}>＋</Text>
                <Text style={styles.pointQuickActionLabel}>Foto</Text>
              </View>
              </TouchableWithoutFeedback>
            </View>

            <View style={styles.pointInfoSection}>
              <Text style={styles.pointSectionTitle}>Informazioni</Text>
              <Text style={styles.pointCardDescription}>{selectedPoint.description}</Text>
              <View style={styles.pointDataNotice}>
                <View style={styles.demoDot} />
                <Text style={styles.demoNotice}>Punto dimostrativo · posizione e informazioni non reali</Text>
              </View>
            </View>

            <View style={styles.pointFeatureGrid}>
              <TouchableWithoutFeedback onPress={() => showComingSoon('Recensioni')}>
                <View collapsable={false} style={styles.pointFeatureItem}>
                <Text style={styles.pointFeatureIcon}>☆</Text>
                <View style={styles.pointFeatureCopy}>
                  <Text style={styles.pointFeatureTitle}>Recensioni</Text>
                  <Text style={styles.pointFeatureSubtitle}>Esperienze e valutazioni</Text>
                </View>
                <Text style={styles.pointFeatureChevron}>›</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => showComingSoon('Foto')}>
                <View collapsable={false} style={styles.pointFeatureItem}>
                <Text style={styles.pointFeatureIcon}>▧</Text>
                <View style={styles.pointFeatureCopy}>
                  <Text style={styles.pointFeatureTitle}>Foto</Text>
                  <Text style={styles.pointFeatureSubtitle}>Immagini condivise dagli utenti</Text>
                </View>
                <Text style={styles.pointFeatureChevron}>›</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => showComingSoon('Aggiornamenti')}>
                <View collapsable={false} style={styles.pointFeatureItem}>
                <Text style={styles.pointFeatureIcon}>↻</Text>
                <View style={styles.pointFeatureCopy}>
                  <Text style={styles.pointFeatureTitle}>Aggiornamenti</Text>
                  <Text style={styles.pointFeatureSubtitle}>Verifiche e cronologia del punto</Text>
                </View>
                <Text style={styles.pointFeatureChevron}>›</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => showComingSoon('Altre informazioni')}>
                <View collapsable={false} style={styles.pointFeatureItem}>
                <Text style={styles.pointFeatureIcon}>ⓘ</Text>
                <View style={styles.pointFeatureCopy}>
                  <Text style={styles.pointFeatureTitle}>Altre informazioni</Text>
                  <Text style={styles.pointFeatureSubtitle}>Dettagli e caratteristiche</Text>
                </View>
                <Text style={styles.pointFeatureChevron}>›</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {!selectedPoint && (
        <View
          style={[
            styles.bottomActions,
            isCompactIphone && styles.bottomActionsIphone,
          ]}
        >
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
      )}
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
    width: 48,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
    shadowColor: '#10251A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
  },
  pointSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingBottom: 18,
    elevation: 18,
    shadowColor: '#173B2A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#E8EEE8',
  },
  sheetHandleArea: {
    // A larger touch target makes the sheet easier to grab without changing the visible handle.
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(49, 86, 65, 0.28)',
  },
  pointSheetScroll: {
    flex: 1,
  },
  pointSheetContent: {
    paddingBottom: 14,
  },
  pointSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  pointSheetTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointCardClose: {
    width: 32,
    height: 32,
    borderRadius: 11,
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
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E7EFE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointCardIconText: {
    color: '#204B3A',
    fontSize: 18,
    fontWeight: '800',
  },
  pointCardCopy: {
    flex: 1,
  },
  pointCardTitle: {
    color: '#204B3A',
    fontSize: 16,
    fontWeight: '800',
    flexShrink: 1,
  },
  pointCardCategory: {
    color: '#64806B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  pointPhotoPlaceholder: {
    height: 112,
    borderRadius: 16,
    backgroundColor: '#F1F5F1',
    borderWidth: 1,
    borderColor: '#E6ECE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
    gap: 4,
  },
  pointPhotoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#E3EBE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  pointPhotoIcon: {
    color: '#64806B',
    fontSize: 21,
  },
  pointPhotoTitle: {
    color: '#315641',
    fontSize: 12,
    fontWeight: '700',
  },
  pointPhotoSubtitle: {
    color: '#8A9B8E',
    fontSize: 10,
    textAlign: 'center',
  },
  pointQuickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5,
    marginBottom: 12,
  },
  pointQuickAction: {
    opacity: 1,
    minWidth: 82,
    alignItems: 'center',
    gap: 5,
  },
  pointQuickActionIcon: {
    opacity: 1,
    width: 40,
    height: 40,
    borderRadius: 14,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#EDF3EE',
    color: '#315641',
    fontSize: 20,
    fontWeight: '700',
    paddingTop: 8,
  },
  pointQuickActionLabel: {
    opacity: 1,
    color: '#315641',
    fontSize: 10,
    fontWeight: '700',
  },
  pointInfoSection: {
    paddingTop: 12,
    paddingBottom: 13,
    borderTopWidth: 1,
    borderTopColor: '#EDF1ED',
  },
  pointSectionTitle: {
    color: '#204B3A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  pointCardDescription: {
    color: '#526357',
    fontSize: 12,
    lineHeight: 18,
  },
  pointDataNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
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
  pointFeatureGrid: {
    borderTopWidth: 1,
    borderTopColor: '#EDF1ED',
  },
  pointFeatureItem: {
    opacity: 1,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F0',
    gap: 12,
    paddingVertical: 8,
  },
  pointFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F1',
    color: '#315641',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 20,
    paddingTop: 7,
  },
  pointFeatureCopy: {
    flex: 1,
    gap: 3,
  },
  pointFeatureTitle: {
    color: '#315641',
    fontSize: 12,
    fontWeight: '800',
  },
  pointFeatureSubtitle: {
    color: '#8A9B8E',
    fontSize: 10,
  },
  pointFeatureChevron: {
    color: '#91A195',
    fontSize: 23,
    paddingHorizontal: 4,
  },
  filterPanel: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    elevation: 14,
    shadowColor: '#173B2A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EEE8',
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
    letterSpacing: -0.3,
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#789080',
    marginTop: 4,
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
    gap: 5,
  },
  filterFooterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 4,
  },
  resetButton: {
    height: 43,
    minWidth: 82,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F1F5F1',
    borderWidth: 1,
    borderColor: '#E5EBE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#315641',
    fontSize: 13,
    fontWeight: '700',
  },
  applyButtonFlex: {
    flex: 1,
  },
  selectionSummary: {
    color: '#64806B',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  tapHint: {
    color: '#9AA69D',
    fontSize: 10,
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
