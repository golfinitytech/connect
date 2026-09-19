import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedSensor,
  SensorType,
  runOnJS,
  useAnimatedProps,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Rect,
  Pattern,
} from 'react-native-svg';
import { useRound, useWeather } from '../api/hooks';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { calculateDistance } from '../utils/geo';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';

const MapSkeleton = () => (
  <View style={{ flex: 1 }}>
    <View style={[styles.topBar, { backgroundColor: colors.primaryDark }]}>
      <CircleSkeleton width={32} height={32} />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <RectSkeleton width={120} height={20} style={{ marginBottom: 4 }} />
        <RectSkeleton width={80} height={14} />
      </View>
      <View style={styles.topActions}>
        <CircleSkeleton width={32} height={32} />
        <CircleSkeleton width={32} height={32} />
      </View>
    </View>
    <View style={{ flex: 1, backgroundColor: '#0C3A2A', justifyContent: 'center', alignItems: 'center' }}>
      <RectSkeleton width="90%" height="80%" borderRadius={20} />
    </View>
  </View>
);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'HoleMap'>;

// Fallback pin locations for demo purposes until API supports coordinates
const FALLBACK_PIN_LOCATIONS: Record<number, { latitude: number; longitude: number }> = {
  1: { latitude: -6.1754, longitude: 106.8272 },
  2: { latitude: -6.1764, longitude: 106.8282 },
  3: { latitude: -6.1774, longitude: 106.8292 },
  4: { latitude: -6.1784, longitude: 106.8302 },
  // Default fallback for other holes
};

function getCompassDirection(degrees?: number) {
  if (degrees === undefined) return 'N';
  const val = Math.floor((degrees / 22.5) + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16];
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

function getWeatherLayerVisual(code?: number) {
  if (code === undefined) return { icon: 'cloud-outline', label: 'Tidak diketahui' };
  if (code === 0) return { icon: 'sunny', label: 'Cerah' };
  if (code >= 1 && code <= 3) return { icon: 'partly-sunny', label: 'Berawan' };
  if (code >= 45 && code <= 48) return { icon: 'cloudy', label: 'Berkabut' };
  if (code >= 51 && code <= 67) return { icon: 'rainy', label: 'Hujan' };
  if (code >= 71 && code <= 77) return { icon: 'snow', label: 'Salju' };
  if (code >= 80 && code <= 82) return { icon: 'rainy', label: 'Hujan' };
  if (code >= 95 && code <= 99) return { icon: 'thunderstorm', label: 'Badai' };
  return { icon: 'cloud-outline', label: 'Berawan' };
}

export function HoleMapScreen({ route, navigation }: Props) {
  const { roundId, holeNumber } = route.params;
  const { data: round, isLoading } = useRound(roundId);
  const [mapMode, setMapMode] = useState<'2D' | '3D'>('3D');
  const [zoom, setZoom] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showWind, setShowWind] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showDistances, setShowDistances] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState<Location.LocationHeadingObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shotStartLocation, setShotStartLocation] = useState<Location.LocationObject | null>(null);
  const [isTrackingShot, setIsTrackingShot] = useState(false);
  const [rangeDistances, setRangeDistances] = useState({ toMarker: 0, toPin: 0 });
  const [placeLabel, setPlaceLabel] = useState<string>('');
  const lastGeocodeAtRef = useRef(0);
  const lastGeocodeCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  // Reanimated values for 3D Orbit
  const rotateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const mapScale = useSharedValue(1);
  const mapTranslateY = useSharedValue(0);

  // Rangefinder shared values (SVG coordinates 0-200, 0-400)
  const rangeX = useSharedValue(100);
  const rangeY = useSharedValue(200);
  const isDraggingRange = useSharedValue(false);
  const mapWidth = useSharedValue(SCREEN_WIDTH);
  const mapHeight = useSharedValue(SCREEN_WIDTH * 2); // default ratio 200:400

  // Sensor for subtle tilt effect
  const sensor = useAnimatedSensor(SensorType.ROTATION, { interval: 20 });

  useEffect(() => {
    const reverseGeocode = async () => {
      if (!location) return;

      const { latitude, longitude } = location.coords;
      const now = Date.now();

      if (now - lastGeocodeAtRef.current < 60_000) return;

      const last = lastGeocodeCoordsRef.current;
      if (last) {
        const moved = calculateDistance(last.lat, last.lon, latitude, longitude);
        if (moved < 200) return;
      }

      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        const place = results?.[0];

        const nameParts = [
          place?.city ?? place?.district ?? place?.subregion ?? place?.region,
          place?.region,
          place?.country,
        ].filter(Boolean) as string[];

        setPlaceLabel(nameParts.join(', '));
        lastGeocodeAtRef.current = now;
        lastGeocodeCoordsRef.current = { lat: latitude, lon: longitude };
      } catch {
        lastGeocodeAtRef.current = now;
        lastGeocodeCoordsRef.current = { lat: latitude, lon: longitude };
      }
    };

    reverseGeocode();
  }, [location?.coords.latitude, location?.coords.longitude]);

  useEffect(() => {
    if (mapMode === '3D') {
      rotateX.value = withSpring(45);
      mapTranslateY.value = withSpring(20);
      mapScale.value = withSpring(1.2);
    } else {
      rotateX.value = withSpring(0);
      rotateZ.value = withSpring(0);
      mapTranslateY.value = withSpring(0);
      mapScale.value = withSpring(1);
    }
  }, [mapMode]);

  useEffect(() => {
    mapScale.value = withSpring(zoom * (mapMode === '3D' ? 1.2 : 1));
  }, [zoom, mapMode]);

  const animatedMapStyle = useAnimatedStyle(() => {
    // Add subtle tilt based on phone orientation when in 3D mode
    let tiltX = 0;
    let tiltY = 0;

    if (mapMode === '3D' && sensor.sensor.value) {
      // Use rotation vector for subtle parallax effect
      // sensor.sensor.value: { qx, qy, qz, qw }
      const { qx, qy } = sensor.sensor.value;
      tiltX = qx * 10; // Adjust intensity
      tiltY = qy * 10;
    }

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotateX.value + tiltX}deg` },
        { rotateZ: `${rotateZ.value + tiltY}deg` },
        { scale: mapScale.value },
        { translateY: mapTranslateY.value },
      ],
    };
  });

  const animatedCompassStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${withSpring(heading?.trueHeading ?? 0, { damping: 20, stiffness: 90 })}deg` },
      ],
    };
  });

  const { data: weather } = useWeather(location?.coords.latitude, location?.coords.longitude);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Subscribe to location updates
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1, // update every 1 meter
        },
        (newLocation) => {
          setLocation(newLocation);
        },
      );

      // Subscribe to heading updates
      const headingSubscription = await Location.watchHeadingAsync((newHeading) => {
        setHeading(newHeading);
      });

      return () => {
        subscription.remove();
        headingSubscription.remove();
      };
    })();
  }, []);

  const currentHole = useMemo(() => {
    return round?.course.holes?.find((h) => h.number === holeNumber);
  }, [round, holeNumber]);

  const pinLocation = useMemo(() => {
    if (currentHole?.latitude && currentHole?.longitude) {
      return { latitude: currentHole.latitude, longitude: currentHole.longitude };
    }
    return FALLBACK_PIN_LOCATIONS[holeNumber] || FALLBACK_PIN_LOCATIONS[1];
  }, [currentHole, holeNumber]);

  const distanceToPin = location
    ? calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        pinLocation.latitude,
        pinLocation.longitude,
      )
    : null;

  const displayDistance = distanceToPin ? `${Math.round(distanceToPin)}m` : '--m';
  const gpsAccuracy = errorMsg
    ? errorMsg
    : location
      ? `${Math.round(location.coords.accuracy || 0)}m`
      : 'Scanning...';

  const userProgress = useMemo(() => {
    if (!distanceToPin || !currentHole?.lengthYds) return 0;
    const totalDist = currentHole.lengthYds * 0.9144; // to meters
    return Math.max(0, Math.min(0.95, (totalDist - distanceToPin) / totalDist));
  }, [distanceToPin, currentHole]);

  const userSvgPos = useMemo(() => {
    // The fairway path is: M100 360 Q 60 300 80 200 Q 100 100 120 40
    // This is two quadratic segments:
    // 1: (100,360) -> (60,300) -> (80,200)
    // 2: (80,200) -> (100,100) -> (120,40)

    const t = userProgress;
    if (t <= 0.5) {
      // First segment
      const t1 = t * 2;
      const x = (1 - t1) ** 2 * 100 + 2 * (1 - t1) * t1 * 60 + t1 ** 2 * 80;
      const y = (1 - t1) ** 2 * 360 + 2 * (1 - t1) * t1 * 300 + t1 ** 2 * 200;
      return { x, y };
    } else {
      // Second segment
      const t2 = (t - 0.5) * 2;
      const x = (1 - t2) ** 2 * 80 + 2 * (1 - t2) * t2 * 100 + t2 ** 2 * 120;
      const y = (1 - t2) ** 2 * 200 + 2 * (1 - t2) * t2 * 100 + t2 ** 2 * 40;
      return { x, y };
    }
  }, [userProgress]);

  const shotStartSvgPos = useMemo(() => {
    if (!isTrackingShot || !shotStartLocation || !currentHole?.lengthYds) return null;
    const totalDist = currentHole.lengthYds * 0.9144;
    const distanceToPinAtStart = calculateDistance(
      shotStartLocation.coords.latitude,
      shotStartLocation.coords.longitude,
      pinLocation.latitude,
      pinLocation.longitude,
    );
    const t = Math.max(0, Math.min(0.95, (totalDist - distanceToPinAtStart) / totalDist));
    
    // Fairway curve logic (same as userSvgPos)
    if (t <= 0.5) {
      const t1 = t * 2;
      const x = (1 - t1) ** 2 * 100 + 2 * (1 - t1) * t1 * 60 + t1 ** 2 * 80;
      const y = (1 - t1) ** 2 * 360 + 2 * (1 - t1) * t1 * 300 + t1 ** 2 * 200;
      return { x, y };
    } else {
      const t2 = (t - 0.5) * 2;
      const x = (1 - t2) ** 2 * 80 + 2 * (1 - t2) * t2 * 100 + t2 ** 2 * 120;
      const y = (1 - t2) ** 2 * 200 + 2 * (1 - t2) * t2 * 100 + t2 ** 2 * 40;
      return { x, y };
    }
  }, [isTrackingShot, shotStartLocation, currentHole, pinLocation]);

  const holeLength = currentHole?.lengthYds ?? 350;
  const svgToMeters = (holeLength * 0.9144) / 320;

  useEffect(() => {
    const d1 = Math.sqrt((userSvgPos.x - rangeX.value) ** 2 + (userSvgPos.y - rangeY.value) ** 2) * svgToMeters;
    const d2 = Math.sqrt((rangeX.value - 120) ** 2 + (rangeY.value - 60) ** 2) * svgToMeters;
    setRangeDistances({ toMarker: Math.round(d1), toPin: Math.round(d2) });
  }, [userSvgPos.x, userSvgPos.y, svgToMeters]);

  useEffect(() => {
    if (!location) return;
    if (rangeX.value !== 100 || rangeY.value !== 200) return;

    const initialX = userSvgPos.x;
    const initialY = Math.max(40, userSvgPos.y - 100);
    rangeX.value = initialX;
    rangeY.value = initialY;
  }, [location?.coords.latitude, location?.coords.longitude, userSvgPos.x, userSvgPos.y]);

  const rangeLine1Props = useAnimatedProps(() => {
    return {
      d: `M${userSvgPos.x} ${userSvgPos.y} L ${rangeX.value} ${rangeY.value}`,
    };
  }, [userSvgPos.x, userSvgPos.y]);

  const rangeLine2Props = useAnimatedProps(() => {
    return {
      d: `M${rangeX.value} ${rangeY.value} L 120 60`,
    };
  });

  const panGesture = useMemo(() => Gesture.Pan()
    .onStart((e) => {
      // Convert screen tap to approximate SVG coordinates (ignoring rotation for a moment)
      const svgX = (e.x / mapWidth.value) * 200;
      const svgY = (e.y / mapHeight.value) * 400;
      
      const distToMarker = Math.sqrt((svgX - rangeX.value) ** 2 + (svgY - rangeY.value) ** 2);
      
      // If tap is within 30 SVG units of the marker, start dragging it
      if (distToMarker < 30) {
        isDraggingRange.value = true;
      } else {
        isDraggingRange.value = false;
      }
    })
    .onUpdate((e) => {
      if (isDraggingRange.value) {
        // Drag marker
        const newX = Math.max(0, Math.min(200, (e.x / mapWidth.value) * 200));
        const newY = Math.max(0, Math.min(400, (e.y / mapHeight.value) * 400));
        rangeX.value = newX;
        rangeY.value = newY;
        
        // Calculate distances and update state
        const d1 = Math.sqrt((userSvgPos.x - newX) ** 2 + (userSvgPos.y - newY) ** 2) * svgToMeters;
        const d2 = Math.sqrt((newX - 120) ** 2 + (newY - 60) ** 2) * svgToMeters;
        
        runOnJS(setRangeDistances)({ toMarker: Math.round(d1), toPin: Math.round(d2) });
      } else if (mapMode === '3D') {
        // Rotate map
        rotateZ.value = e.translationX / 5;
        rotateX.value = 45 + e.translationY / 10;
      }
    })
    .onEnd(() => {
      isDraggingRange.value = false;
    }), [mapMode, userSvgPos, svgToMeters]);

  if (errorMsg) {
    return (
      <ScreenWrapper style={styles.errorContainer} edges={['top', 'bottom']}>
        <Ionicons name="alert-circle" size={48} color="#FF4B4B" />
        <Text style={styles.errorTitle}>Location Required</Text>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Pressable style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryBtnText}>Go Back</Text>
        </Pressable>
      </ScreenWrapper>
    );
  }

  const windSpeed = weather?.current?.wind_speed_10m;
  const windDir = getCompassDirection(weather?.current?.wind_direction_10m);

  const shotDistance = useMemo(() => {
    if (isTrackingShot && shotStartLocation && location) {
      return calculateDistance(
        shotStartLocation.coords.latitude,
        shotStartLocation.coords.longitude,
        location.coords.latitude,
        location.coords.longitude,
      );
    }
    return null;
  }, [isTrackingShot, shotStartLocation, location]);

  const handleToggleShotTracker = () => {
    if (!isTrackingShot) {
      setShotStartLocation(location);
      setIsTrackingShot(true);
    } else {
      setIsTrackingShot(false);
      setShotStartLocation(null);
    }
  };

  const animatedRangeMarkerStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: (rangeX.value / 200) * mapWidth.value,
      top: (rangeY.value / 400) * mapHeight.value,
      width: 40,
      height: 40,
      marginLeft: -20,
      marginTop: -20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      transform: [
        { scale: isDraggingRange.value ? 1.2 : 1 },
      ],
    };
  });

  const animatedRangeLabel1Style = useAnimatedStyle(() => {
    const midX = (userSvgPos.x + rangeX.value) / 2;
    const midY = (userSvgPos.y + rangeY.value) / 2;
    
    return {
      position: 'absolute',
      left: (midX / 200) * mapWidth.value,
      top: (midY / 400) * mapHeight.value,
      backgroundColor: '#4B91FF',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      transform: [{ translateX: -20 }, { translateY: -10 }],
    };
  });

  const animatedRangeLabel2Style = useAnimatedStyle(() => {
    const midX = (rangeX.value + 120) / 2;
    const midY = (rangeY.value + 60) / 2;
    
    return {
      position: 'absolute',
      left: (midX / 200) * mapWidth.value,
      top: (midY / 400) * mapHeight.value,
      backgroundColor: '#FF4B4B',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      transform: [{ translateX: -20 }, { translateY: -10 }],
    };
  });

  if (isLoading || !round) {
    return (
      <ScreenWrapper style={styles.screen} edges={['top', 'bottom']}>
        <MapSkeleton />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={32} color="#F6FBF8" />
        </Pressable>
        <View>
          <Text style={styles.topTitle}>Hole {holeNumber}, Par {currentHole?.par ?? '-'}</Text>
          <Text style={styles.topSub}>
            {currentHole?.lengthYds ? `${Math.round(currentHole.lengthYds * 0.9144)}M` : '-'} TOTAL
          </Text>
          {weather?.current && (
            <View style={styles.weatherContainer}>
              <Ionicons name="cloud-outline" size={16} color="#2CE067" />
              <View style={styles.weatherMeta}>
                <Text style={styles.weatherText}>
                  {Math.round(weather.current.temperature_2m)}°C
                </Text>
                <Text style={styles.weatherSubText} numberOfLines={1}>
                  {placeLabel || `${location?.coords.latitude.toFixed(4)}, ${location?.coords.longitude.toFixed(4)}`}
                </Text>
                {placeLabel ? (
                  <Text style={styles.weatherSubText} numberOfLines={1}>
                    {`${location?.coords.latitude.toFixed(4)}, ${location?.coords.longitude.toFixed(4)}`}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        </View>
        <View style={styles.topActions}>
          <Pressable
            style={styles.helpBtn}
            onPress={() => Linking.openURL('tel:+15550101188')}
          >
            <Ionicons name="call" size={20} color="#0D1712" />
          </Pressable>
          <Pressable
            style={styles.settingsBtn}
            onPress={() => setShowSettings((value) => !value)}
          >
            <Ionicons name={showSettings ? 'close' : 'settings'} size={24} color="#0D1712" />
          </Pressable>
        </View>
      </View>

      {showSettings ? (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>Map Layers</Text>
          <View style={styles.settingsRow}>
            <Pressable
              style={[styles.settingsPill, showDistances && styles.settingsPillActive]}
              onPress={() => setShowDistances((value) => !value)}
            >
              <Text style={[styles.settingsText, showDistances && styles.settingsTextActive]}>Distances</Text>
            </Pressable>
            <Pressable
              style={[styles.settingsPill, showWind && styles.settingsPillActive]}
              onPress={() => setShowWind((value) => !value)}
            >
              <Text style={[styles.settingsText, showWind && styles.settingsTextActive]}>Wind</Text>
            </Pressable>
            <Pressable
              style={[styles.settingsPill, showHazards && styles.settingsPillActive]}
              onPress={() => setShowHazards((value) => !value)}
            >
              <Text style={[styles.settingsText, showHazards && styles.settingsTextActive]}>Hazards</Text>
            </Pressable>
            <Pressable
              style={[styles.settingsPill, showWeather && styles.settingsPillActive]}
              onPress={() => setShowWeather((value) => !value)}
            >
              <View style={styles.settingsPillContent}>
                <Ionicons
                  name={(weather?.current ? getWeatherLayerVisual(weather.current.weather_code).icon : 'cloud-outline') as any}
                  size={14}
                  color={showWeather ? '#FFFFFF' : '#1C2A22'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.settingsText, showWeather && styles.settingsTextActive]}>
                  {weather?.current ? `${Math.round(weather.current.temperature_2m)}°C` : 'Cuaca'}
                </Text>
              </View>
            </Pressable>
          </View>
          {showWeather ? (
            <View style={styles.weatherLayerInline}>
              <Text style={styles.weatherLayerInlineText} numberOfLines={1}>
                {weather?.current
                  ? `${getWeatherLayerVisual(weather.current.weather_code).label} • ${Math.round(weather.current.wind_speed_10m)} km/h • ${placeLabel || `${location?.coords.latitude.toFixed(4)}, ${location?.coords.longitude.toFixed(4)}`}`
                  : location
                    ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
                    : 'GPS belum tersedia'}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.heroMap}>
        <GestureDetector gesture={panGesture}>
          <View 
            style={styles.mapCanvas}
            onLayout={(e) => {
              mapWidth.value = e.nativeEvent.layout.width;
              mapHeight.value = e.nativeEvent.layout.height;
            }}
          >
            <Animated.View style={[styles.mapSurface, animatedMapStyle]}>
              <Svg height="100%" width="100%" viewBox="0 0 200 400">
                <Defs>
                  <LinearGradient id="fairwayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#1F7B52" />
                    <Stop offset="100%" stopColor="#155D3E" />
                  </LinearGradient>
                  <RadialGradient id="greenGradient" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#2ED47A" />
                    <Stop offset="100%" stopColor="#1F9B58" />
                  </RadialGradient>
                  <LinearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#3A8FD9" />
                    <Stop offset="100%" stopColor="#1E5F9A" />
                  </LinearGradient>
                  <RadialGradient id="bunkerGradient" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#EAD8A3" />
                    <Stop offset="100%" stopColor="#D4BC7B" />
                  </RadialGradient>

                  {/* Grass Pattern */}
                  <Pattern id="grassPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                    <Path d="M0 0 L 2 2 M 5 5 L 7 7" stroke="#164A35" strokeWidth="0.5" opacity={0.2} />
                  </Pattern>

                  {/* Sand Texture */}
                  <Pattern id="sandPattern" width="4" height="4" patternUnits="userSpaceOnUse">
                    <Circle cx="1" cy="1" r="0.2" fill="#8D7D54" opacity={0.3} />
                  </Pattern>

                  {/* Sky Gradient for 3D Mode */}
                  <LinearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#87CEEB" />
                    <Stop offset="100%" stopColor="#E0F6FF" />
                  </LinearGradient>

                  {/* Shadows */}
                  <RadialGradient id="shadowGradient" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </RadialGradient>
                </Defs>

                {/* Sky Background (visible when tilted) */}
                {mapMode === '3D' && (
                  <Rect x="-100" y="-200" width="400" height="200" fill="url(#skyGradient)" />
                )}

                {/* Base Course Layer */}
                <Rect x="-50" y="-50" width="300" height="500" fill="#0C3A2A" />
                <Rect x="-50" y="-50" width="300" height="500" fill="url(#grassPattern)" />

                {/* Rough Areas with depth */}
                <Path
                  d="M100 400 Q 50 350 40 250 Q 30 150 70 50 Q 130 50 170 150 Q 180 250 160 350 Q 150 400 100 400"
                  fill="#0E5A3F"
                  stroke="#083D2B"
                  strokeWidth="2"
                />

                {/* Fairway Shadow - only in 3D */}
                {mapMode === '3D' && (
                  <Path
                    d="M100 365 Q 65 305 85 205 Q 105 105 125 45"
                    stroke="black"
                    strokeWidth="60"
                    strokeLinecap="round"
                    fill="none"
                    opacity={0.15}
                  />
                )}

                {/* Fairway */}
                <Path
                  d="M100 360 Q 60 300 80 200 Q 100 100 120 40"
                  stroke={mapMode === '3D' ? "url(#fairwayGradient)" : "#228B22"}
                  strokeWidth="60"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Rough borders for organic feel - only in 3D */}
                {mapMode === '3D' && (
                  <Path
                    d="M100 360 Q 60 300 80 200 Q 100 100 120 40"
                    stroke="#164A35"
                    strokeWidth="70"
                    strokeLinecap="round"
                    fill="none"
                    opacity={0.2}
                  />
                )}

                {/* Hazards */}
                {showHazards && (
                  <>
                    {/* Water Hazard with ripple effect simulation */}
                    <G>
                      <Ellipse cx="140" cy="120" rx="32" ry="22" fill="#15456A" opacity={0.3} />
                      <Ellipse cx="140" cy="120" rx="30" ry="20" fill="url(#waterGradient)" />
                      {/* Ripples */}
                      <Ellipse cx="130" cy="115" rx="5" ry="2" fill="white" opacity={0.1} />
                      <Ellipse cx="150" cy="125" rx="8" ry="3" fill="white" opacity={0.05} />
                    </G>

                    {/* Bunker with sand texture */}
                    <G>
                      <Path
                        d="M60 255 Q 40 235 70 215 Q 90 235 60 255"
                        fill="black"
                        opacity={0.1}
                      />
                      <Path
                        d="M60 250 Q 40 230 70 210 Q 90 230 60 250"
                        fill="url(#bunkerGradient)"
                      />
                      <Path
                        d="M60 250 Q 40 230 70 210 Q 90 230 60 250"
                        fill="url(#sandPattern)"
                      />
                    </G>
                  </>
                )}

                {/* Green Shadow */}
                {mapMode === '3D' && (
                  <Circle cx="122" cy="62" r="25" fill="black" opacity={0.2} />
                )}

                {/* Green */}
                <G>
                  <Circle cx="120" cy="60" r="25" fill={mapMode === '3D' ? "url(#greenGradient)" : "#32CD32"} />
                  {mapMode === '3D' && (
                    <>
                      <Circle cx="120" cy="60" r="25" fill="url(#grassPattern)" opacity={0.4} />
                      <Circle cx="120" cy="60" r="28" stroke="#1F7B52" strokeWidth="6" fill="none" opacity={0.3} />
                    </>
                  )}
                </G>

                {/* Trees - simple 3D representation - only in 3D */}
                {mapMode === '3D' && (
                  <G>
                    <G transform="translate(40, 150)">
                      <Circle cx="2" cy="2" r="10" fill="black" opacity={0.15} />
                      <Circle cx="0" cy="0" r="10" fill="#0A3D29" />
                      <Circle cx="-2" cy="-2" r="6" fill="#145A32" />
                    </G>
                    <G transform="translate(170, 250)">
                      <Circle cx="2" cy="2" r="12" fill="black" opacity={0.15} />
                      <Circle cx="0" cy="0" r="12" fill="#0A3D29" />
                      <Circle cx="-2" cy="-2" r="8" fill="#145A32" />
                    </G>
                    <G transform="translate(50, 50)">
                      <Circle cx="2" cy="2" r="8" fill="black" opacity={0.15} />
                      <Circle cx="0" cy="0" r="8" fill="#0A3D29" />
                      <Circle cx="-2" cy="-2" r="5" fill="#145A32" />
                    </G>
                  </G>
                )}

                {/* Shot Tracking Path */}
                {isTrackingShot && shotStartSvgPos && (
                  <>
                    <Path
                      d={`M${shotStartSvgPos.x} ${shotStartSvgPos.y} L ${userSvgPos.x} ${userSvgPos.y}`}
                      stroke="#FFCB4B"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <Circle cx={shotStartSvgPos.x} cy={shotStartSvgPos.y} r="4" fill="#FFCB4B" />
                  </>
                )}

                {/* Suggested Path / Shot Line */}
                {location && (
                  <Path
                    d={`M${userSvgPos.x} ${userSvgPos.y} L 120 60`}
                    stroke="#4B91FF"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity={0.3}
                  />
                )}

                {/* Rangefinder Dashed Lines */}
                {showDistances && (
                  <>
                    <AnimatedPath
                      animatedProps={rangeLine1Props}
                      stroke="#4B91FF"
                      strokeWidth="2.5"
                      strokeDasharray="8,5"
                    />
                    <AnimatedPath
                      animatedProps={rangeLine2Props}
                      stroke="#FF4B4B"
                      strokeWidth="2.5"
                      strokeDasharray="8,5"
                    />
                  </>
                )}

                {/* User Location Dot */}
                {location && (
                  <G transform={`translate(${userSvgPos.x}, ${userSvgPos.y})`}>
                    <Circle r="6" fill="#4B91FF" stroke="#FFFFFF" strokeWidth="2" />
                    <Animated.View style={animatedCompassStyle}>
                      <Path d="M0 -10 L 4 -4 L -4 -4 Z" fill="#4B91FF" />
                    </Animated.View>
                  </G>
                )}

                {/* Pin/Flag */}
                <G transform="translate(120, 60)">
                  {/* Pin Shadow */}
                  <Ellipse cx="2" cy="2" rx="3" ry="1.5" fill="black" opacity={0.2} />
                  {/* Pin */}
                  <Rect x="-1" y="-20" width="2" height="20" fill="#EAFBF1" />
                  {/* Flag */}
                  <Path d="M1 -20 L 15 -14 L 1 -8 Z" fill="#FF4B4B" />
                </G>

                {/* Tee Box */}
                <Rect x="85" y="350" width="30" height="15" rx="2" fill="#F4FBF7" opacity={0.8} />

                {/* Distance lines if active */}
                {showDistances && (
                  <G opacity={0.3}>
                    {[50, 100, 150, 200].map((dist) => (
                      <G key={dist}>
                        <Circle
                          cx="120"
                          cy="60"
                          r={dist * 0.8}
                          stroke="white"
                          strokeWidth="0.5"
                          strokeDasharray="4,4"
                          fill="none"
                        />
                      </G>
                    ))}
                  </G>
                )}
              </Svg>

              {/* Rangefinder UI Overlays */}
              {showDistances && (
                <>
                  <Animated.View style={animatedRangeMarkerStyle}>
                    <Ionicons name="move" size={24} color="#FFFFFF" />
                  </Animated.View>

                  <Animated.View style={animatedRangeLabel1Style}>
                    <Text style={styles.rangeLabelText}>{rangeDistances.toMarker}m</Text>
                  </Animated.View>

                  <Animated.View style={animatedRangeLabel2Style}>
                    <Text style={styles.rangeLabelText}>{rangeDistances.toPin}m</Text>
                  </Animated.View>
                </>
              )}
            </Animated.View>
          </View>
        </GestureDetector>

        {showDistances ? (
          <View style={styles.distanceCardsRow}>
            <View style={styles.distanceCard}>
              <Text style={styles.distanceLabel}>FRONT</Text>
              <Text style={styles.distanceValue}>{distanceToPin ? Math.round(distanceToPin - 10) : '---'}m</Text>
            </View>
            <View style={[styles.distanceCard, styles.distanceCardActive]}>
              <Text style={styles.distanceLabelActive}>CENTER</Text>
              <Text style={styles.distanceValue}>{displayDistance}</Text>
            </View>
            <View style={styles.distanceCard}>
              <Text style={styles.distanceLabel}>BACK</Text>
              <Text style={styles.distanceValue}>{distanceToPin ? Math.round(distanceToPin + 10) : '---'}m</Text>
            </View>
          </View>
        ) : null}

        {showDistances ? (
          <View style={styles.liveTrackingCard}>
            <View>
              <Text style={styles.liveTrackingLabel}>
                {isTrackingShot ? 'SHOT DISTANCE' : 'LIVE TRACKING'}
              </Text>
              <Text style={styles.liveTrackingValue}>
                {isTrackingShot ? `${Math.round(shotDistance ?? 0)}m` : `${displayDistance} to Pin`}
              </Text>
              <Text style={styles.liveTrackingSub}>
                {isTrackingShot ? 'Tracking from start...' : `GPS Accuracy: ${gpsAccuracy}`}
              </Text>
            </View>
            <View style={[styles.flagBox, isTrackingShot && styles.flagBoxShot]}>
              <Ionicons
                name={isTrackingShot ? 'golf' : 'flag'}
                size={34}
                color={isTrackingShot ? '#FFFFFF' : colors.primaryDark}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.mapControls}>
          <Pressable
            style={styles.controlBtn}
            onPress={() => setMapMode(mapMode === '2D' ? '3D' : '2D')}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{mapMode}</Text>
          </Pressable>
          <Pressable
            style={[styles.controlBtn, isTrackingShot && styles.controlBtnShotActive]}
            onPress={handleToggleShotTracker}
          >
            <Ionicons name="analytics" size={20} color={isTrackingShot ? '#FFFFFF' : '#0B1B12'} />
          </Pressable>
          <Pressable
            style={styles.controlBtn}
            onPress={() => setZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(1))))}
          >
            <Ionicons name="add" size={20} color="#0B1B12" />
          </Pressable>
          <View style={styles.zoomPill}>
            <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
          </View>
          <Pressable
            style={styles.controlBtn}
            onPress={() => setZoom((value) => Math.max(0.8, Number((value - 0.1).toFixed(1))))}
          >
            <Ionicons name="remove" size={20} color="#0B1B12" />
          </Pressable>
        </View>

        {showWind ? (
          <View style={styles.compassContainer}>
            <View style={styles.compass}>
              <Animated.View style={animatedCompassStyle}>
                <Ionicons
                  name="compass"
                  size={20}
                  color="#0B1B12"
                />
              </Animated.View>
              <Text style={styles.compassText}>
                {heading?.trueHeading ? `${Math.round(heading.trueHeading)}°` : '---°'}
              </Text>
            </View>
            <View style={styles.windIndicator}>
              <Ionicons
                name="arrow-up"
                size={14}
                color="#0B1B12"
                style={{ transform: [{ rotate: `${weather?.current?.wind_direction_10m ?? 0}deg` }] }}
              />
              <Text style={styles.windText}>
                {windSpeed ? `${windDir} ${Math.round(windSpeed)}` : '--'}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, mapMode === '2D' && styles.toggleBtnActive]}
            onPress={() => setMapMode('2D')}
          >
            <Text style={mapMode === '2D' ? styles.toggleTextActive : styles.toggleText}>2D Map</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, mapMode === '3D' && styles.toggleBtnActive]}
            onPress={() => setMapMode('3D')}
          >
            <Text style={mapMode === '3D' ? styles.toggleTextActive : styles.toggleText}>3D Orbit</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.returnBtn}
          onPress={() => navigation.replace('RoundScoring', { roundId })}
        >
          <Text style={styles.returnBtnText}>Return To Score</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  screen: {
    flex: 1,
    backgroundColor: '#0C3A2A',
  },
  topBar: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0C3A2A',
    paddingBottom: spacing.sm,
  },
  topTitle: {
    color: '#F2FBF7',
    fontSize: 20,
    fontWeight: '800',
  },
  topSub: {
    color: '#2CE067',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1.4,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    gap: 6,
  },
  weatherMeta: {
    flexDirection: 'column',
    gap: 1,
  },
  weatherText: {
    color: '#F2FBF7',
    fontSize: 13,
    fontWeight: '700',
  },
  weatherSubText: {
    color: 'rgba(242, 251, 247, 0.8)',
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 170,
  },
  rangeLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6FBF8',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  settingsPanel: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 252, 250, 0.95)',
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0D1A12',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherLayerInline: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: '#E3ECE8',
  },
  weatherLayerInlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C2A22',
    opacity: 0.9,
  },
  settingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    alignItems: 'flex-start',
  },
  settingsPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E3ECE8',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  settingsPillActive: {
    backgroundColor: colors.primaryDark,
  },
  settingsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C2A22',
  },
  settingsTextActive: {
    color: '#FFFFFF',
  },
  heroMap: {
    flex: 1,
    backgroundColor: '#072016',
    overflow: 'hidden',
    position: 'relative',
  },
  mapCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#072016',
  },
  mapSurface: {
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 3,
    backgroundColor: '#0C3A2A',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 20px 0px rgba(0, 0, 0, 0.5)',
      },
    }),
    overflow: 'hidden',
  },
  distanceCardsRow: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    zIndex: 10,
  },
  distanceCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: spacing.sm,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  distanceCardActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  distanceLabel: {
    color: '#637A6E',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  distanceLabelActive: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  distanceValue: {
    color: '#101612',
    fontSize: 24,
    fontWeight: '900',
  },
  liveTrackingCard: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(12, 58, 42, 0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  liveTrackingLabel: {
    color: '#A8C2B4',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  liveTrackingValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  liveTrackingSub: {
    color: '#A8C2B4',
    fontSize: 10,
    fontWeight: '500',
  },
  flagBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBoxShot: {
    backgroundColor: '#FF4B4B',
  },
  mapControls: {
    position: 'absolute',
    right: spacing.md,
    top: 80, // Offset for liveTrackingCard
    gap: 8,
    alignItems: 'center',
    zIndex: 10,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4FBF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnShotActive: {
    backgroundColor: '#FF4B4B',
  },
  zoomPill: {
    borderRadius: 999,
    backgroundColor: '#F4FBF7',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  zoomText: {
    fontWeight: '800',
    color: '#0B1B12',
    fontSize: 12,
  },
  compassContainer: {
    position: 'absolute',
    left: spacing.md,
    top: 80, // Offset for liveTrackingCard
    gap: 6,
    zIndex: 10,
  },
  compass: {
    borderRadius: 16,
    backgroundColor: '#F4FBF7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 0px 4px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  windIndicator: {
    borderRadius: 12,
    backgroundColor: 'rgba(244, 251, 247, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  windText: {
    fontWeight: '700',
    color: '#0B1B12',
    fontSize: 12,
  },
  compassText: {
    fontWeight: '800',
    color: '#0B1B12',
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E8EFEB',
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#F2F5F3',
    padding: 4,
    marginBottom: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  toggleText: {
    color: '#628676',
    fontWeight: '700',
    fontSize: 14,
  },
  toggleTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 14,
  },
  returnBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  returnBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
