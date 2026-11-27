import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Modal,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  PanResponder,
  StyleSheet,
  View,
  Text as NativeText,
  type TextProps,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import * as Location from 'expo-location';


// Tipografia BIN: caratteri di sistema nativi, familiari e leggibili su entrambe le piattaforme.
const BIN_FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'sans-serif',
});

function Text({ style, ...props }: TextProps) {
  return (
    <NativeText
      {...props}
      style={[{ fontFamily: BIN_FONT_FAMILY }, style]}
    />
  );
}

const CATEGORIES = [
  {
    id: 'servizi',
    label: 'Servizi',
    icon: '🗑️',
    subcategories: [
      { id: 'cestini', label: 'Cestini' },
      { id: 'bagni-pubblici', label: 'Bagni pubblici' },
      { id: 'docce-pubbliche', label: 'Docce pubbliche' },
    ],
  },
  {
    id: 'acqua',
    label: 'Acqua',
    icon: '💧',
    subcategories: [
      { id: 'fontanelle', label: 'Fontanelle' },
      { id: 'chioschi-acqua', label: "Chioschi dell'acqua" },
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
    id: 'animali',
    label: 'Animali',
    icon: '🐾',
    subcategories: [
      { id: 'aree-cani', label: 'Aree cani' },
      { id: 'fontanelle-animali', label: 'Fontanelle per animali' },
      { id: 'distributori-sacchetti', label: 'Distributori sacchetti' },
    ],
  },
  {
    id: 'mobilita',
    label: 'Mobilità',
    icon: '🚲',
    subcategories: [
      { id: 'parcheggi-gratuiti', label: 'Parcheggi gratuiti' },
      { id: 'parcheggi-pagamento', label: 'Parcheggi a pagamento' },
    ],
  },
  {
    id: 'verde',
    label: 'Verde e tempo libero',
    icon: '🌳',
    subcategories: [
      { id: 'panchine', label: 'Panchine' },
      { id: 'tavoli', label: 'Tavoli' },
      { id: 'picnic', label: 'Aree picnic' },
      { id: 'giochi', label: 'Aree giochi' },
      { id: 'sport', label: 'Sport' },
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
  { id: 'demo-6', title: 'Parcheggio gratuito di prova', subcategoryId: 'parcheggi-gratuiti', icon: 'P', description: 'Punto dimostrativo: parcheggio gratuito.', latitudeOffset: -0.0022, longitudeOffset: 0.0016 },
  { id: 'demo-10', title: 'Parcheggio a pagamento di prova', subcategoryId: 'parcheggi-pagamento', icon: 'P', description: 'Punto dimostrativo: parcheggio a pagamento.', latitudeOffset: -0.0030, longitudeOffset: 0.0023 }, 
  { id: 'demo-8', title: 'DAE di prova', subcategoryId: 'dae', icon: 'AED', description: 'Punto dimostrativo: defibrillatore.', latitudeOffset: -0.0027, longitudeOffset: -0.0018 },
  { id: 'demo-9', title: 'Rampa accessibile di prova', subcategoryId: 'rampe', icon: '♿', description: 'Punto dimostrativo: rampa per l’accessibilità.', latitudeOffset: 0.0002, longitudeOffset: 0.0028 },
];

const PIN_COLORS: Record<string, string> = {
  fontanelle: '#249BD1',
  'chioschi-acqua': '#249BD1',
  cestini: '#777F88',
  'bagni-pubblici': '#1769AA',
  'docce-pubbliche': '#1769AA',
  rampe: '#815DB5',
  ascensori: '#815DB5',
  'percorsi-accessibili': '#815DB5',
  'parcheggi-riservati': '#815DB5',
  panchine: '#32865A',
  tavoli: '#32865A',
  'aree-cani': '#D47791',
  'fontanelle-animali': '#D47791',
  'distributori-sacchetti': '#D47791',
  'parcheggi-gratuiti': '#536D9D',
  'parcheggi-pagamento': '#536D9D',
  giochi: '#32865A',
  picnic: '#32865A',
  sport: '#32865A',
  dae: '#009640',
  'primo-soccorso': '#D45C4D',
  'dispositivi-emergenza': '#D45C4D',
};

const PIN_DARK_COLORS: Record<string, string> = {
  fontanelle: '#1675A8',
  'chioschi-acqua': '#1675A8',
  cestini: '#555D65',
  'bagni-pubblici': '#104C80',
  'docce-pubbliche': '#104C80',
  rampe: '#62428F',
  ascensori: '#62428F',
  'percorsi-accessibili': '#62428F',
  'parcheggi-riservati': '#62428F',
  panchine: '#205C3B',
  tavoli: '#205C3B',
  'aree-cani': '#A94E69',
  'fontanelle-animali': '#A94E69',
  'distributori-sacchetti': '#A94E69',
  'parcheggi-gratuiti': '#3A5078',
  'parcheggi-pagamento': '#3A5078',
  giochi: '#205C3B',
  picnic: '#205C3B',
  sport: '#205C3B',
  dae: '#007A36',
  'primo-soccorso': '#A83E33',
  'dispositivi-emergenza': '#A83E33',
};

const PIN_ICON_PATHS: Record<string, string> = {
  fontanelle: 'M12 2 C10 6 5 11 5 15 A7 7 0 0 0 19 15 C19 11 14 6 12 2 Z M8.5 16.5 C9 18 10 19 12 19',
  'chioschi-acqua': 'M4 8 H20 M7 8 V18 H17 V8 M9 5 H15 M12 18 V21 M9 12 H15',
  cestini: 'M5 7 H19 M9 7 V4 H15 V7 M7 7 L8 21 H16 L17 7 M10 10 V18 M14 10 V18',
  'bagni-pubblici': '',
  'docce-pubbliche': 'M4 5 H20 M7 5 V8 M12 5 V8 M17 5 V8 M7 12 C7 14 5 15 5 17 M12 12 C12 14 10 15 10 17 M17 12 C17 14 15 15 15 17',
  rampe: 'M9 2 A2 2 0 1 0 9 6 A2 2 0 0 0 9 2 M9 7 L13 9 L17 9 L19 13 M13 9 L11 14 L15 17 M15 17 A5 5 0 1 0 23 17 M9 8 L6 13 L11 13',
  ascensori: 'M4 3 H20 V21 H4 Z M12 7 V17 M9 10 L12 7 L15 10 M9 14 L12 17 L15 14',
  'percorsi-accessibili': 'M3 17 L8 11 L12 15 L17 8 L21 12 M3 21 H21 M7 5 A2 2 0 1 0 7 9 A2 2 0 0 0 7 5',
  'parcheggi-riservati': 'M7 21 V3 H13 A6 6 0 0 1 13 15 H7 M7 9 H13 A2 2 0 0 0 13 5 H7',
  panchine: 'M4 12 H20 V17 H4 Z M6 17 V21 M18 17 V21 M5 8 H19 V12 H5 Z',
  tavoli: 'M3 10 H21 V13 H3 Z M6 13 V21 M18 13 V21 M12 13 V21',
  'aree-cani': 'M5 8 A2 2 0 1 0 5 4 A2 2 0 0 0 5 8 M12 6 A2 2 0 1 0 12 2 A2 2 0 0 0 12 6 M19 8 A2 2 0 1 0 19 4 A2 2 0 0 0 19 8 M12 12 C8 8 4 12 6 17 C8 22 10 19 12 19 C14 19 16 22 18 17 C20 12 16 8 12 12 Z',
  'fontanelle-animali': 'M12 2 C10 6 5 11 5 15 A7 7 0 0 0 19 15 C19 11 14 6 12 2 Z M4 21 H20 M7 18 L5 21 M17 18 L19 21',
  'distributori-sacchetti': 'M7 8 V6 A5 5 0 0 1 17 6 V8 M5 8 H19 L18 21 H6 Z M9 12 V17 M15 12 V17',
  'parcheggi-gratuiti': 'M7 21 V3 H14 A6 6 0 0 1 14 15 H7',
  'parcheggi-pagamento': 'M7 21 V3 H14 A6 6 0 0 1 14 15 H7',
  parchi: 'M12 3 L5 13 H9 L5 19 H19 L15 13 H19 Z M12 19 V22',
  giochi: 'M4 14 L12 5 L20 14 M6 13 V21 H18 V13 M9 16 H15 V21',
  picnic: 'M3 10 H21 M5 10 L7 21 M19 10 L17 21 M8 10 L12 3 L16 10 M9 15 H15',
  sport: 'M12 3 A9 9 0 1 0 12 21 A9 9 0 1 0 12 3 M3 12 H21 M12 3 C8 7 8 17 12 21 M12 3 C16 7 16 17 12 21',
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
          ) : (subcategoryId === 'parcheggi-gratuiti' || subcategoryId === 'parcheggi-pagamento') ? (
            <Path d={iconPath} fill="none" stroke="#FFFFFF" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
          ) : subcategoryId === 'dae' ? (
            <G>
              {/* DAE / ISO 7010 E010-inspired green sign. Cross placed upper-left as requested. */}
              <Path
                d="M12 20 C9 17.7 5 14.3 4 10.7 C3 7.3 5.4 5 8.1 5 C9.8 5 11 5.8 12 7.1 C13 5.8 14.2 5 15.9 5 C18.6 5 21 7.3 20 10.7 C19 14.3 15 17.7 12 20 Z"
                fill="#FFFFFF"
              />
              <Path
                d="M13.2 7.6 L9 13 H11.9 L10.8 17.3 L15.6 11.5 H12.8 L14.5 7.6 Z"
                fill="#009640"
              />
              <Path
                d="M3.3 0.2 H5.2 V1.8 H6.8 V3.7 H5.2 V5.3 H3.3 V3.7 H1.7 V1.8 H3.3 Z"
                fill="#FFFFFF"
              />
            </G>
          ) : subcategoryId === 'rampe' ? (
            <G transform="translate(1.4 -0.2) scale(0.94)">
              {/* Pittogramma accessibilità: braccio accorciato e figura riequilibrata nel pin. */}
              <Circle cx={7.2} cy={3.1} r={2.1} fill="#FFFFFF" />
              <Path
                d="M7.1 6.1 L8.3 12.4 Q8.5 13.5 9.7 13.5 H14.6 L17.2 19.7 Q17.6 20.7 18.7 20.7 H21"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M7.6 7.3 L15.8 7.1"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                strokeLinecap="round"
              />
              <Path
                d="M6.6 9.3 A7.2 7.2 0 1 0 15.3 16.8"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </G>
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

function CategoryFilterIcon({ categoryId }: { categoryId: string }) {
  const paths: Record<string, string> = {
    acqua: 'M12 2 C10 6 5 11 5 15 A7 7 0 0 0 19 15 C19 11 14 6 12 2 Z',
    servizi: 'M5 7 H19 M9 7 V4 H15 V7 M7 7 L8 21 H16 L17 7 M10 11 V17 M14 11 V17',
    accessibilita: 'M9 3 A2 2 0 1 0 9 7 A2 2 0 0 0 9 3 M9 8 L13 10 H18 L20 14 M13 10 L11 15 L15 18 H19 M8 10 L5 15 M15 18 A5 5 0 1 0 23 18',
    animali: 'M6 9 A2 2 0 1 0 6 5 A2 2 0 0 0 6 9 M12 7 A2 2 0 1 0 12 3 A2 2 0 0 0 12 7 M18 9 A2 2 0 1 0 18 5 A2 2 0 0 0 18 9 M12 12 C8 9 4 12 6 17 C8 22 10 19 12 19 C14 19 16 22 18 17 C20 12 16 9 12 12 Z',
    mobilita: PIN_ICON_PATHS['parcheggi-gratuiti'],
    verde: 'M12 3 L5 13 H9 L5 19 H19 L15 13 H19 Z M12 19 V22',
    emergenza: 'M12 3 L20 6 V12 C20 17 16 20 12 22 C8 20 4 17 4 12 V6 Z M12 8 V16 M8 12 H16',
  };
  const isWater = categoryId === 'acqua';
  const isAccessibility = categoryId === 'accessibilita';

  return (
    <View
      style={[
        styles.categoryIcon,
        styles.categoryIconTile,
        { backgroundColor: ({
          acqua: '#249BD1',
          servizi: '#777F88',
          accessibilita: '#815DB5',
          animali: '#D47791',
          mobilita: '#536D9D',
          verde: '#32865A',
          emergenza: '#D45C4D',
        } as Record<string, string>)[categoryId] ?? '#32865A' },
      ]}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24">
        {categoryId === 'mobilita' ? (
          <G>
            {/* Auto frontale stilizzata, piena e leggibile anche in piccolo. */}
            <Path
              d="M5 10 L7 5.8 Q7.7 4.5 9.2 4.5 H14.8 Q16.3 4.5 17 5.8 L19 10 L21 12.2 V18.5 H17.8 V16.8 H6.2 V18.5 H3 V12.2 Z"
              fill="#FFFFFF"
            />
            <Path
              d="M8.2 6.5 H15.8 L17.2 9.7 H6.8 Z"
              fill="#536D9D"
            />
            <Path d="M5.2 12.3 H7.3 V14.1 H5.2 Z M16.7 12.3 H18.8 V14.1 H16.7 Z" fill="#536D9D" />
            <Path d="M9 13 H15 V14.2 H9 Z" fill="#536D9D" />
          </G>
        ) : isAccessibility ? (
          <G transform="translate(1.4 -0.2) scale(0.94)">
            {/* Stesso pittogramma della sedia a rotelle usato nel pin Accessibilità. */}
            <Circle cx={7.2} cy={3.1} r={2.1} fill="#FFFFFF" />
            <Path
              d="M7.1 6.1 L8.3 12.4 Q8.5 13.5 9.7 13.5 H14.6 L17.2 19.7 Q17.6 20.7 18.7 20.7 H21"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M7.6 7.3 L15.8 7.1"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <Path
              d="M6.6 9.3 A7.2 7.2 0 1 0 15.3 16.8"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </G>
        ) : (
          <Path
            d={paths[categoryId] ?? paths.acqua}
            fill={isWater ? '#FFFFFF' : 'none'}
            stroke={isWater ? 'none' : '#FFFFFF'}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
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
  const [compassHeading, setCompassHeading] = useState(0);
  const [compassResetting, setCompassResetting] = useState(false);
  const compassArrowRotation = useRef(new Animated.Value(0)).current;
  const compassDisplayHeadingRef = useRef(0);
  const compassResetAnimationRef = useRef(false);
  const compassResetReadPendingRef = useRef(false);
  const compassResetStableFramesRef = useRef(0);
  const compassSyncFrameRef = useRef<number | null>(null);
  const lastCompassReadAtRef = useRef(0);
  const compassReadPendingRef = useRef(false);
  const compassReadQueuedRef = useRef(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedDistance, setSelectedDistance] = useState('Tutti');
  const [appliedSubcategories, setAppliedSubcategories] = useState<string[] | null>(null);
  const [appliedDistance, setAppliedDistance] = useState('Tutti');
  const [selectedPoint, setSelectedPoint] = useState<(DemoPoint & { latitude: number; longitude: number }) | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('Non funziona');
  const [selectedDuplicatePointId, setSelectedDuplicatePointId] = useState<string | null>(null);
  const [selectingDuplicateOnMap, setSelectingDuplicateOnMap] = useState(false);
  const [reportDetails, setReportDetails] = useState('');
  const [pointReports, setPointReports] = useState<Array<{ pointId: string; type: string; details: string; createdAt: number; lastConfirmedAt?: number; relatedPointId?: string }>>([]);
  const [updatesModalOpen, setUpdatesModalOpen] = useState(false);
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

  function finishCompassNorthReset() {
    compassResetAnimationRef.current = false;
    compassResetStableFramesRef.current = 0;
    compassDisplayHeadingRef.current = 0;
    setCompassResetting(false);
    compassArrowRotation.setValue(0);
    setCompassHeading(0);
  }

  function trackCompassNorthReset() {
    if (!mapRef || !compassResetAnimationRef.current || compassResetReadPendingRef.current) return;

    compassResetReadPendingRef.current = true;
    mapRef.getCamera()
      .then((camera) => {
        if (!compassResetAnimationRef.current) return;

        const heading = ((camera.heading ?? 0) % 360 + 360) % 360;
        const currentDisplayHeading = compassDisplayHeadingRef.current;
        const shortestDelta = ((heading - currentDisplayHeading + 540) % 360) - 180;
        // A gentle follow keeps the arrow from getting ahead of the visible map rotation.
        const displayedHeading =
          ((currentDisplayHeading + shortestDelta * 0.22) % 360 + 360) % 360;

        compassDisplayHeadingRef.current = displayedHeading;
        compassArrowRotation.setValue(-displayedHeading);
        setCompassHeading(displayedHeading);

        const mapIsNorth = Math.min(heading, 360 - heading) <= 0.5;
        const arrowIsNorth = Math.min(displayedHeading, 360 - displayedHeading) <= 0.8;
        if (mapIsNorth && arrowIsNorth) {
          compassResetStableFramesRef.current += 1;
        } else {
          compassResetStableFramesRef.current = 0;
        }

        if (compassResetStableFramesRef.current >= 2) {
          finishCompassNorthReset();
        }
      })
      .catch(() => {
        // Keep the compass visible if the native camera cannot be read.
      })
      .finally(() => {
        compassResetReadPendingRef.current = false;
        if (compassResetAnimationRef.current) {
          compassSyncFrameRef.current = requestAnimationFrame(trackCompassNorthReset);
        }
      });
  }

  function orientMapNorth() {
    if (!mapRef) return;

    compassResetAnimationRef.current = true;
    compassResetStableFramesRef.current = 0;
    setCompassResetting(true);
    compassArrowRotation.stopAnimation();

    if (compassSyncFrameRef.current !== null) {
      cancelAnimationFrame(compassSyncFrameRef.current);
      compassSyncFrameRef.current = null;
    }

    mapRef.animateCamera({ heading: 0 }, { duration: 500 });
    compassSyncFrameRef.current = requestAnimationFrame(trackCompassNorthReset);
  }

  function syncCompassWithMap(force = false) {
    if (!mapRef || compassResetAnimationRef.current) return;

    if (compassReadPendingRef.current) {
      if (force) compassReadQueuedRef.current = true;
      return;
    }

    const now = Date.now();
    if (!force && now - lastCompassReadAtRef.current < 50) return;

    lastCompassReadAtRef.current = now;
    compassReadPendingRef.current = true;

    mapRef.getCamera()
      .then((camera) => {
        const heading = ((camera.heading ?? 0) % 360 + 360) % 360;
        compassDisplayHeadingRef.current = heading;
        compassArrowRotation.setValue(-heading);
        setCompassHeading((current) =>
          Math.abs(current - heading) < 0.5 ? current : heading
        );
      })
      .catch(() => {
        // Keep the last known compass direction if the native camera is unavailable.
      })
      .finally(() => {
        compassReadPendingRef.current = false;
        if (compassReadQueuedRef.current) {
          compassReadQueuedRef.current = false;
          syncCompassWithMap(true);
        }
      });
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

  async function openNavigationApp(app: 'apple' | 'google' | 'waze', destination: string) {
    const nativeUrl = app === 'apple'
      ? `maps://?daddr=${destination}&dirflg=d`
      : app === 'google'
        ? `comgooglemaps://?daddr=${destination}&directionsmode=driving`
        : `waze://?ll=${destination}&navigate=yes`;
    const fallbackUrl = app === 'apple'
      ? `https://maps.apple.com/?daddr=${destination}`
      : app === 'google'
        ? `https://www.google.com/maps/dir/?api=1&destination=${destination}`
        : `https://waze.com/ul?ll=${destination}&navigate=yes`;

    try {
      await Linking.openURL(nativeUrl);
    } catch {
      try {
        await Linking.openURL(fallbackUrl);
      } catch {
        Alert.alert('Navigazione non disponibile', 'Non è stato possibile aprire un’app di navigazione su questo dispositivo.');
      }
    }
  }

  function openPointDirections() {
    if (!selectedPoint) return;

    const destination = `${selectedPoint.latitude},${selectedPoint.longitude}`;
    const options = Platform.OS === 'ios'
      ? [
          { text: 'Mappe', onPress: () => { void openNavigationApp('apple', destination); } },
          { text: 'Google Maps', onPress: () => { void openNavigationApp('google', destination); } },
          { text: 'Waze', onPress: () => { void openNavigationApp('waze', destination); } },
          { text: 'Annulla', style: 'cancel' as const },
        ]
      : [
          { text: 'Google Maps', onPress: () => { void openNavigationApp('google', destination); } },
          { text: 'Waze', onPress: () => { void openNavigationApp('waze', destination); } },
          { text: 'Annulla', style: 'cancel' as const },
        ];

    Alert.alert('Come vuoi arrivare?', 'Scegli l’app di navigazione.', options);
  }

  function submitPointReport() {
    if (!selectedPoint) return;
    if (selectedReportType === 'È un duplicato?' && !selectedDuplicatePointId) {
      Alert.alert('Seleziona il punto', 'Indica quale altro BIN ritieni duplicato.');
      return;
    }
    const relatedPoint = demoPoints.find((point) => point.id === selectedDuplicatePointId);
    const details = [
      reportDetails.trim(),
      selectedReportType === 'È un duplicato?' && relatedPoint ? `Indicato come duplicato di: ${relatedPoint.title}` : '',
    ].filter(Boolean).join(' · ');
    setPointReports((current) => [
      { pointId: selectedPoint.id, type: selectedReportType, details, createdAt: Date.now(), ...(selectedReportType === 'È un duplicato?' && selectedDuplicatePointId ? { relatedPointId: selectedDuplicatePointId } : {}) },
      ...current,
    ]);
    setReportModalOpen(false);
    setSelectedReportType('Non funziona');
    setSelectedDuplicatePointId(null);
    setReportDetails('');
    Alert.alert('Segnalazione registrata', selectedReportType === 'È un duplicato?'
      ? 'Grazie! Abbiamo collegato i due punti per una verifica. Nessuno dei due viene eliminato automaticamente.'
      : 'Grazie! La segnalazione è stata aggiunta alla scheda di questo punto. Non comporta la rimozione automatica del punto.');
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

  const mapPoints = selectingDuplicateOnMap ? demoPoints : visibleDemoPoints;

  const filterPanelHeight = filtersExpanded
    ? Math.min(height * 0.72, 620)
    : Math.min(height * 0.46, 390);

  return (
    <View style={styles.container}>
      {position ? (
        <MapView
          ref={setMapRef}
          style={styles.map}
          mapType={Platform.OS === 'android' ? 'none' : 'standard'}
          initialRegion={{
            latitude: position.latitude,
            longitude: position.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          onPress={handleMapTap}
          onRegionChange={() => syncCompassWithMap()}
          onRegionChangeComplete={() => syncCompassWithMap(true)}
        >
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            tileSize={256}
            shouldReplaceMapContent={Platform.OS === 'ios'}
          />
          {mapPoints.map((point) => (
            <Marker
              key={point.subcategoryId === 'dae' ? `${point.id}-aed-sign-v2` : point.id}
              coordinate={{ latitude: point.latitude, longitude: point.longitude }}
              anchor={{ x: 0.5, y: 1 }}
              onPress={() => {
                markerPressRef.current = true;
                if (selectingDuplicateOnMap) {
                  if (point.id === selectedPoint?.id) {
                    Alert.alert('Seleziona un altro BIN', 'Il punto che stai segnalando non può essere indicato come proprio duplicato.');
                  } else {
                    setSelectedDuplicatePointId(point.id);
                    setSelectingDuplicateOnMap(false);
                    setReportModalOpen(true);
                  }
                } else {
                  openPointCard(point);
                }
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

      {selectingDuplicateOnMap && (
        <View style={{ position: 'absolute', top: 92, left: 20, right: 20, zIndex: 30, backgroundColor: '#204B3A', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, elevation: 8 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' }}>Seleziona sulla mappa il BIN duplicato</Text>
          <Text style={{ color: '#E4EEE8', fontSize: 12, textAlign: 'center', marginTop: 4 }}>Tocca un altro pin per collegarlo alla segnalazione.</Text>
          <TouchableOpacity onPress={() => { setSelectingDuplicateOnMap(false); setReportModalOpen(true); }} style={{ alignSelf: 'center', marginTop: 9, paddingVertical: 5, paddingHorizontal: 12 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Annulla selezione</Text>
          </TouchableOpacity>
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

      {position && !selectedPoint && !filtersOpen && (compassResetting || Math.min(compassHeading, 360 - compassHeading) > 2) && (
        <TouchableOpacity
          style={[
            styles.northButton,
            isCompactIphone && styles.northButtonIphone,
          ]}
          onPress={orientMapNorth}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Riorienta la mappa verso nord"
        >
          <Animated.View
            style={{
              transform: [{
                rotate: compassArrowRotation.interpolate({
                  inputRange: [-360, 0],
                  outputRange: ['-360deg', '0deg'],
                  extrapolate: 'clamp',
                }),
              }],
            }}
          >
            <Svg width={28} height={28} viewBox="0 0 24 24">
              <Path
                d="M12 1.5 L16.4 15 L12 22.5 L7.6 15 Z"
                fill="#FFFFFF"
                stroke="#65766A"
                strokeWidth={0.75}
                strokeLinejoin="round"
              />
              <Path d="M12 1.5 L16.4 15 L12 12.7 L7.6 15 Z" fill="#D94343" />
              <Path d="M7.6 15 L12 12.7 L16.4 15 L12 22.5 Z" fill="#FFFFFF" />
            </Svg>
          </Animated.View>
        </TouchableOpacity>
      )}

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
                        <CategoryFilterIcon categoryId={category.id} />
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

            <View style={styles.pointQuickActions}>
              <TouchableWithoutFeedback onPress={openPointDirections}>
                <View collapsable={false} style={styles.pointQuickAction}>
                <Text style={styles.pointQuickActionIcon}>➤</Text>
                <Text style={styles.pointQuickActionLabel}>Indicazioni</Text>
              </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => { setSelectedDuplicatePointId(null); setReportModalOpen(true); }}>
                <View collapsable={false} style={styles.pointQuickAction}>
                <Text style={styles.pointQuickActionIcon}>⚑</Text>
                <Text style={styles.pointQuickActionLabel}>Contribuisci</Text>
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
              {pointReports.filter((report) => report.pointId === selectedPoint.id || report.relatedPointId === selectedPoint.id).length > 0 && (
                <View style={styles.reportHistory}>
                  <Text style={styles.reportHistoryTitle}>Ultime segnalazioni</Text>
                  {pointReports
                    .filter((report) => report.pointId === selectedPoint.id || report.relatedPointId === selectedPoint.id)
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 3)
                    .map((report, index) => {
                      const ageInDays = (Date.now() - report.createdAt) / (1000 * 60 * 60 * 24);
                      const freshnessLabel = ageInDays >= 40
                        ? 'Segnalazione non recente'
                        : ageInDays >= 20
                          ? 'Da riconfermare'
                          : 'Segnalazione recente';
                      return (
                        <View key={`${report.createdAt}-preview-${index}`} style={styles.reportHistoryItem}>
                          <Text style={styles.reportHistoryType}>{report.type}</Text>
                          <Text style={styles.reportFreshness}>{freshnessLabel}</Text>
                          {report.details ? <Text style={styles.reportHistoryDetails}>{report.details}</Text> : null}
                          <Text style={styles.reportHistoryDate}>{new Date(report.createdAt).toLocaleString('it-IT')}</Text>
                        </View>
                      );
                    })}
                </View>
              )}
            </View>

            <View style={styles.pointFeatureGrid}>
              <TouchableWithoutFeedback onPress={() => setUpdatesModalOpen(true)}>
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

      <Modal
        visible={updatesModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setUpdatesModalOpen(false)}
      >
        <View style={styles.reportModalBackdrop}>
          <View style={styles.reportModalCard}>
            <Text style={styles.reportModalTitle}>Aggiornamenti</Text>
            <Text style={styles.reportModalSubtitle}>{selectedPoint?.title}</Text>
            <ScrollView style={styles.reportModalScroll} contentContainerStyle={styles.reportModalScrollContent}>
              <Text style={styles.reportPrivacyNote}>
                Cronologia delle attività registrate per questo punto. Le segnalazioni degli utenti non significano automaticamente che sia stato effettuato un intervento.
              </Text>
              {pointReports.filter((report) => report.pointId === selectedPoint?.id || report.relatedPointId === selectedPoint?.id).length === 0 ? (
                <Text style={[styles.pointCardDescription, { marginTop: 16 }]}>
                  Non ci sono ancora aggiornamenti per questo punto.
                </Text>
              ) : (
                <View style={styles.reportHistory}>
                  <Text style={styles.reportHistoryTitle}>Segnalazioni della community</Text>
                  {pointReports
                    .filter((report) => report.pointId === selectedPoint?.id || report.relatedPointId === selectedPoint?.id)
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((report, index) => {
                      const ageInDays = (Date.now() - report.createdAt) / (1000 * 60 * 60 * 24);
                      const freshnessLabel = ageInDays >= 40
                        ? 'Segnalazione non recente'
                        : ageInDays >= 20
                          ? 'Da riconfermare'
                          : 'Segnalazione recente';
                      return (
                        <View key={`${report.createdAt}-${index}`} style={styles.reportHistoryItem}>
                          <Text style={styles.reportHistoryType}>{report.type}</Text>
                          <Text style={styles.reportFreshness}>{freshnessLabel}</Text>
                          {report.details ? <Text style={styles.reportHistoryDetails}>{report.details}</Text> : null}
                          <Text style={styles.reportHistoryDate}>{new Date(report.createdAt).toLocaleString('it-IT')}</Text>
                        </View>
                      );
                    })}
                </View>
              )}
            </ScrollView>
            <View style={styles.reportModalActions}>
              <TouchableOpacity style={styles.reportCancelButton} onPress={() => setUpdatesModalOpen(false)}>
                <Text style={styles.reportCancelText}>Chiudi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={reportModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.reportKeyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <View style={styles.reportModalBackdrop}>
            <View style={styles.reportModalCard}>
              <Text style={styles.reportModalTitle}>Contribuisci</Text>
              <Text style={styles.reportModalSubtitle}>{selectedPoint?.title}</Text>
              <ScrollView
                style={styles.reportModalScroll}
                contentContainerStyle={styles.reportModalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
              >
                <Text style={styles.reportFieldLabel}>Che cosa hai notato?</Text>
                {['Non funziona', 'È danneggiato', 'È assente', 'Informazioni errate', 'È un duplicato?', 'Altro'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.reportTypeOption, selectedReportType === type && styles.reportTypeOptionSelected]}
                    onPress={() => setSelectedReportType(type)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.reportRadio, selectedReportType === type && styles.reportRadioSelected]}>
                      {selectedReportType === type ? <View style={styles.reportRadioDot} /> : null}
                    </View>
                    <Text style={[styles.reportTypeText, selectedReportType === type && styles.reportTypeTextSelected]}>{type}</Text>
                  </TouchableOpacity>
                ))}
                {selectedReportType === 'È un duplicato?' && (
                  <View>
                    <Text style={styles.reportFieldLabel}>Quale altro BIN è un duplicato?</Text>
                    <TouchableOpacity
                      style={[styles.reportTypeOption, { justifyContent: 'center', marginBottom: 10 }]}
                      onPress={() => { setReportModalOpen(false); setSelectingDuplicateOnMap(true); }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.reportTypeText, { color: '#204B3A', fontWeight: '700' }]}>⌖  Scegli direttamente sulla mappa</Text>
                    </TouchableOpacity>
                    {demoPoints.filter((point) => point.id !== selectedPoint?.id).map((point) => {
                      const isSelected = selectedDuplicatePointId === point.id;
                      const distance = selectedPoint
                        ? Math.round(distanceBetweenMeters(selectedPoint.latitude, selectedPoint.longitude, point.latitude, point.longitude))
                        : null;
                      return (
                        <TouchableOpacity
                          key={point.id}
                          style={[styles.reportTypeOption, isSelected && styles.reportTypeOptionSelected]}
                          onPress={() => setSelectedDuplicatePointId(point.id)}
                          activeOpacity={0.75}
                        >
                          <View style={[styles.reportRadio, isSelected && styles.reportRadioSelected]}>
                            {isSelected ? <View style={styles.reportRadioDot} /> : null}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.reportTypeText, isSelected && styles.reportTypeTextSelected]}>{point.title}</Text>
                            <Text style={styles.reportPrivacyNote}>{point.subcategoryId} · {distance !== null ? `${distance} m` : ''}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                <Text style={styles.reportFieldLabel}>Aggiungi dettagli (facoltativo)</Text>
                <TextInput
                  value={reportDetails}
                  onChangeText={setReportDetails}
                  placeholder="Descrivi brevemente quello che hai trovato…"
                  placeholderTextColor="#9AA69D"
                  multiline
                  maxLength={300}
                  textAlignVertical="top"
                  style={styles.reportDetailsInput}
                />
                <Text style={styles.reportPrivacyNote}>La segnalazione si aggiunge alla cronologia: il punto non viene eliminato automaticamente.</Text>
              </ScrollView>
              <View style={styles.reportModalActions}>
                <TouchableOpacity style={styles.reportCancelButton} onPress={() => setReportModalOpen(false)}>
                  <Text style={styles.reportCancelText}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reportSubmitButton} onPress={submitPointReport}>
                  <Text style={styles.reportSubmitText}>Invia segnalazione</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  reportKeyboardAvoiding: {
    flex: 1,
  },
  reportModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 31, 21, 0.48)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  reportModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    maxHeight: '96%',
    width: '100%',
  },
  reportModalScroll: {
    flexShrink: 1,
  },
  reportModalScrollContent: {
    paddingBottom: 8,
  },
  reportModalTitle: {
    color: '#204B3A',
    fontSize: 19,
    fontWeight: '800',
  },
  reportModalSubtitle: {
    color: '#789080',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  reportFieldLabel: {
    color: '#315641',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 8,
  },
  reportTypeOption: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8EEE8',
    marginBottom: 6,
  },
  reportTypeOptionSelected: {
    backgroundColor: '#EDF4EE',
    borderColor: '#9AB5A0',
  },
  reportRadio: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#A8B6AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportRadioSelected: {
    borderColor: '#315641',
  },
  reportRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#315641',
  },
  reportTypeText: {
    color: '#647568',
    fontSize: 12,
  },
  reportTypeTextSelected: {
    color: '#204B3A',
    fontWeight: '700',
  },
  reportDetailsInput: {
    minHeight: 72,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#E5EBE5',
    borderRadius: 12,
    padding: 10,
    color: '#315641',
    fontSize: 12,
    backgroundColor: '#FAFCFA',
  },
  reportPrivacyNote: {
    color: '#8A9B8E',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 10,
  },
  reportModalActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 16,
  },
  reportCancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F1F5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCancelText: {
    color: '#315641',
    fontSize: 12,
    fontWeight: '700',
  },
  reportSubmitButton: {
    flex: 1.5,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#204B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reportHistory: {
    marginTop: 12,
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#F7F9F7',
  },
  reportHistoryTitle: {
    color: '#315641',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 7,
  },
  reportHistoryItem: {
    borderTopWidth: 1,
    borderTopColor: '#E8EEE8',
    paddingTop: 7,
    marginTop: 5,
  },
  reportFreshness: {
    color: '#789080',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  reportHistoryToggle: {
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8EEE8',
  },
  reportHistoryToggleText: {
    color: '#315641',
    fontSize: 11,
    fontWeight: '800',
  },
  reportHistoryType: {
    color: '#315641',
    fontSize: 11,
    fontWeight: '700',
  },
  reportHistoryDetails: {
    color: '#647568',
    fontSize: 11,
    marginTop: 3,
  },
  reportHistoryDate: {
    color: '#9AA69D',
    fontSize: 9,
    marginTop: 3,
  },
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
  northButton: {
    position: 'absolute',
    right: 18,
    bottom: 92,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232, 238, 232, 0.85)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  northButtonIphone: {
    bottom: 176,
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
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconTile: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#32865A',
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
