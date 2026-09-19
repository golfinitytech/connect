import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCourses, useRounds } from '../api/hooks';
import { Course, TeeBox } from '../api/types';
import { HelpModal, HelpItem } from '../components/HelpModal';
import { useRoundStore } from '../store/roundStore';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { RootStackParamList } from '../navigation/types';
import { calculateDistance } from '../utils/geo';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const START_NEW_ROUND_BG = require('../../assets/mock/start-new-round/header-1.jpg');

const NewRoundSkeleton = () => (
  <View style={{ flex: 1, padding: spacing.md }}>
    <View style={styles.sectionHeader}>
      <RectSkeleton width={180} height={28} style={{ marginBottom: 4 }} />
      <RectSkeleton width={220} height={18} />
    </View>

    <View style={[styles.searchContainer, { backgroundColor: '#F0F4F2', height: 50, marginBottom: 20 }]}>
      <RectSkeleton width="100%" height="100%" borderRadius={16} />
    </View>

    <View style={styles.listContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.courseCard, { height: 120 }]}>
          <View style={styles.courseRow}>
            <View style={{ flex: 1 }}>
              <RectSkeleton width={180} height={24} style={{ marginBottom: 8 }} />
              <RectSkeleton width={140} height={16} />
            </View>
          </View>
          <View style={styles.courseFooter}>
            <RectSkeleton width={80} height={20} borderRadius={6} />
            <RectSkeleton width={60} height={28} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

type Props = NativeStackScreenProps<RootStackParamList, 'NewRound'>;

export function NewRoundScreen({ navigation, route }: Props) {
  const { centeredContainerStyle } = useResponsiveLayout({ maxWidth: 980 });
  const { data: courses, isLoading } = useCourses();
  const { data: rounds } = useRounds();
  const [searchText, setSearchText] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const recordMode = route.params?.recordMode ?? 'LIVE';
  const [courseTab, setCourseTab] = useState<'NEARBY' | 'RECENT' | 'SEARCH'>('NEARBY');
  const [distanceUnit, setDistanceUnit] = useState<'YDS' | 'M'>('M');
  const {
    selectedCourseId,
    selectedTeeBoxId,
    gameMode,
    eventName,
    caddyName,
    caddyNumber,
    teeDate,
    teeTime,
    setCourse,
    setGameMode,
    setEventName,
    setCaddyName,
    setCaddyNumber,
    setTeeDate,
    setTeeTime,
  } = useRoundStore();

  const [helpVisible, setHelpVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const getCourseDistanceMeters = (course: Course) => {
    if (!location) return null;
    const lat = course.holes?.[0]?.latitude;
    const lon = course.holes?.[0]?.longitude;
    if (lat === undefined || lon === undefined) return null;
    return calculateDistance(location.coords.latitude, location.coords.longitude, lat, lon);
  };

  const nearbyCourses = useMemo(() => {
    let result = courses ?? [];
    if (!location) return result;
    return [...result].sort((a, b) => {
      const distA = getCourseDistanceMeters(a);
      const distB = getCourseDistanceMeters(b);
      if (distA === null || distB === null) return 0;
      return distA - distB;
    });
  }, [courses, location]);

  const recentCourses = useMemo(() => {
    const seen = new Set<string>();
    const items: Course[] = [];
    for (const round of rounds ?? []) {
      const course = round.course;
      if (!course?.id) continue;
      if (seen.has(course.id)) continue;
      seen.add(course.id);
      items.push(course);
    }
    return items;
  }, [rounds]);

  const searchedCourses = useMemo(() => {
    const value = searchText.trim().toLowerCase();
    let result = courses ?? [];

    if (value) {
      result = result.filter((course) => {
        const haystack = `${course.name} ${course.city} ${course.country}`.toLowerCase();
        return haystack.includes(value);
      });
    }
    if (!location) return result;
    return [...result].sort((a, b) => {
      const distA = getCourseDistanceMeters(a);
      const distB = getCourseDistanceMeters(b);
      if (distA === null || distB === null) return 0;
      return distA - distB;
    });
  }, [courses, location, searchText]);

  const tabCourses = useMemo(() => {
    if (courseTab === 'RECENT') return recentCourses;
    if (courseTab === 'SEARCH') return searchedCourses;
    return nearbyCourses;
  }, [courseTab, nearbyCourses, recentCourses, searchedCourses]);

  const formatDistance = (meters: number | null) => {
    if (meters === null) return null;
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatTeeDistance = (yards: number) => {
    if (distanceUnit === 'M') {
      const meters = Math.round(yards * 0.9144);
      return `${meters.toLocaleString()} m`;
    }
    return `${yards.toLocaleString()} yds`;
  };

  const getTeeMarker = (teeName: string) => {
    const name = teeName.toLowerCase();
    if (name.includes('black')) return { label: 'Black', color: '#111827', border: '#0B1220', text: '#FFFFFF' };
    if (name.includes('blue')) return { label: 'Blue', color: '#2563EB', border: '#1D4ED8', text: '#FFFFFF' };
    if (name.includes('white')) return { label: 'White', color: '#FFFFFF', border: '#CBD5E1', text: '#111827' };
    if (name.includes('red')) return { label: 'Red', color: '#EF4444', border: '#DC2626', text: '#FFFFFF' };
    if (name.includes('yellow')) return { label: 'Yellow', color: '#FACC15', border: '#EAB308', text: '#111827' };
    return { label: '—', color: '#F1F5F9', border: '#CBD5E1', text: '#475569' };
  };

  const selectedCourse = useMemo(() => {
    if (!selectedCourseId) {
      return null;
    }
    return (courses ?? []).find((course) => course.id === selectedCourseId) ?? null;
  }, [courses, selectedCourseId]);

  const onSelectCourse = (course: Course) => {
    const defaultTee = course.teeBoxes[0];
    if (!defaultTee) {
      return;
    }
    setCourse(course.id, defaultTee.id);
  };

  const onSelectTee = (tee: TeeBox) => {
    if (!selectedCourse) {
      return;
    }
    setCourse(selectedCourse.id, tee.id);
  };

  if (isLoading) {
    return (
      <ScreenWrapper style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.topBarSide}>
            <View style={styles.backButton} />
          </View>
          <View style={styles.topBarCenter}>
            <Text style={styles.topTitle}>New Round</Text>
          </View>
          <View style={styles.topBarSide} />
        </View>
        <NewRoundSkeleton />
      </ScreenWrapper>
    );
  }

  const helpItems: HelpItem[] = [
    {
      icon: 'search',
      title: 'Select Course',
      description: 'Find your golf course by name or distance from current location.',
    },
    {
      icon: 'golf',
      title: 'Tee Box',
      description: 'Choose which tee box you will be playing from for this round.',
    },
    {
      icon: 'trophy',
      title: 'Game Mode',
      description: 'Select your preferred scoring method for this session.',
    },
    {
      icon: 'people',
      title: 'Players',
      description: 'Continue to select which players are joining your round.',
    },
  ];

  return (
    <ScreenWrapper style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <View style={styles.topBarSide}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
            hitSlop={14}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.topBarCenter}>
          <Text style={styles.topTitle}>New Round</Text>
        </View>
        <View style={styles.topBarSide}>
          <Pressable
            style={styles.helpTextButton}
            hitSlop={14}
            onPress={() => setHelpVisible(true)}
          >
            <Text style={styles.helpText}>Help</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, centeredContainerStyle]} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <ImageBackground
            source={selectedCourse?.imageUrl ? { uri: selectedCourse.imageUrl } : START_NEW_ROUND_BG}
            style={styles.heroBg}
            imageStyle={styles.heroBgImage}
          >
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>Select course</Text>
              <Pressable style={styles.heroEditBtn} onPress={() => setCourseTab('SEARCH')} hitSlop={12}>
                <Ionicons name="pencil" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.tabRow}>
          {[
            { key: 'NEARBY' as const, label: 'Nearby' },
            { key: 'RECENT' as const, label: 'Recent' },
            { key: 'SEARCH' as const, label: 'Search' },
          ].map((tab) => {
            const active = courseTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setCourseTab(tab.key)}
                style={[styles.tabItem, active && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {courseTab === 'SEARCH' ? (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="Search golf courses..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
              placeholderTextColor="#94A69C"
            />
          </View>
        ) : null}

        {courseTab === 'NEARBY' && !location ? (
          <View style={styles.locationHint}>
            <Ionicons name="location-outline" size={18} color={colors.textMuted} />
            <Text style={styles.locationHintText}>Aktifkan GPS untuk menampilkan course terdekat.</Text>
          </View>
        ) : null}

        <View style={styles.listContainer}>
          {tabCourses.map((course, index) => {
            const selected = course.id === selectedCourseId;
            const distanceLabel = formatDistance(getCourseDistanceMeters(course));
            const showNearest = courseTab === 'NEARBY' && Boolean(location) && index === 0;
            const showRecent = courseTab === 'RECENT';

            return (
              <Pressable
                key={course.id}
                style={[styles.courseCard, selected && styles.courseCardSelected]}
                onPress={() => onSelectCourse(course)}
              >
                <View style={styles.courseRow}>
                  <View style={styles.courseMainInfo}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseMeta}>
                      {course.city}, {course.country}
                      {distanceLabel ? ` • ${distanceLabel}` : ''}
                      {' • '}
                      {course.totalHoles} Holes
                    </Text>
                    {showNearest ? (
                      <View style={styles.nearestBadge}>
                        <Ionicons name="location" size={12} color="#FFFFFF" />
                        <Text style={styles.nearestBadgeText}>NEAREST</Text>
                      </View>
                    ) : showRecent ? (
                      <View style={styles.recentBadge}>
                        <Ionicons name="time" size={12} color="#FFFFFF" />
                        <Text style={styles.nearestBadgeText}>RECENT</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.courseImageWrap}>
                    {course.imageUrl ? (
                      <Image source={{ uri: course.imageUrl }} style={styles.courseImage} resizeMode="cover" />
                    ) : (
                      <Image source={START_NEW_ROUND_BG} style={styles.courseImage} resizeMode="cover" />
                    )}
                  </View>
                </View>

                <View style={styles.courseFooter}>
                  {selected ? (
                    <View style={styles.selectedPill}>
                      <Ionicons name="checkmark-circle" size={16} color="#06210E" />
                      <Text style={styles.selectedPillText}>Selected</Text>
                    </View>
                  ) : (
                    <View />
                  )}
                </View>
              </Pressable>
            );
          })}

          {tabCourses.length === 0 ? (
            <View style={styles.emptyCourses}>
              <Ionicons name="golf-outline" size={34} color={colors.textMuted} />
              <Text style={styles.emptyCoursesTitle}>Tidak ada course</Text>
              <Text style={styles.emptyCoursesSub}>
                {courseTab === 'RECENT' ? 'Belum ada course yang pernah dimainkan.' : 'Coba gunakan pencarian.'}
              </Text>
            </View>
          ) : null}
        </View>

        {selectedCourse ? (
          <>
            <View style={[styles.sectionHeader, styles.sectionHeaderRow]}>
              <Text style={styles.sectionTitleGreen}>2. Select Tee Box</Text>
              <View style={styles.unitToggleRow}>
                {(['M', 'YDS'] as const).map((unit) => {
                  const active = distanceUnit === unit;
                  return (
                    <Pressable
                      key={unit}
                      onPress={() => setDistanceUnit(unit)}
                      style={[styles.unitTogglePill, active && styles.unitTogglePillActive]}
                    >
                      <Text style={[styles.unitToggleText, active && styles.unitToggleTextActive]}>
                        {unit === 'YDS' ? 'Yds' : 'Meter'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            
            <View style={styles.listContainer}>
              {selectedCourse.teeBoxes.map((tee) => {
                const selected = tee.id === selectedTeeBoxId;
                const marker = getTeeMarker(tee.name);
                return (
                  <Pressable
                    key={tee.id}
                    style={[styles.choiceCard, selected && styles.choiceCardSelected]}
                    onPress={() => onSelectTee(tee)}
                  >
                    <View style={styles.choiceRow}>
                      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                        {selected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <View style={[styles.teeMarkerDot, { backgroundColor: marker.color, borderColor: marker.border }]}>
                        <Text style={[styles.teeMarkerDotText, { color: marker.text }]}>{marker.label[0] ?? ''}</Text>
                      </View>
                      <View style={styles.choiceTextWrap}>
                        <Text style={styles.choiceTitle}>{tee.name}</Text>
                        <Text style={styles.choiceSub}>
                          {formatTeeDistance(tee.yardage)} • Tee Marker {marker.label} • Rating {tee.rating} • Slope {tee.slope}
                        </Text>
                      </View>
                      {selected ? (
                        <Ionicons name="checkmark-circle" size={22} color={colors.primaryDark} />
                      ) : (
                        <Ionicons name="ellipse-outline" size={22} color="#C5D4CC" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleGreen}>Event & Caddy</Text>
            </View>

            <View style={styles.eventCard}>
              <View style={styles.eventField}>
                <Text style={styles.eventLabel}>Nama Event</Text>
                <TextInput
                  value={eventName}
                  onChangeText={setEventName}
                  placeholder="Contoh: Monthly Medal"
                  placeholderTextColor="#94A69C"
                  style={styles.eventInput}
                />
              </View>

              <View style={styles.eventRow}>
                <View style={[styles.eventField, styles.eventFieldHalf]}>
                  <Text style={styles.eventLabel}>Nama Caddy</Text>
                  <TextInput
                    value={caddyName}
                    onChangeText={setCaddyName}
                    placeholder="Nama"
                    placeholderTextColor="#94A69C"
                    style={styles.eventInput}
                  />
                </View>
                <View style={[styles.eventField, styles.eventFieldHalf]}>
                  <Text style={styles.eventLabel}>No. Caddy</Text>
                  <TextInput
                    value={caddyNumber}
                    onChangeText={setCaddyNumber}
                    placeholder="Nomor"
                    placeholderTextColor="#94A69C"
                    keyboardType="number-pad"
                    style={styles.eventInput}
                  />
                </View>
              </View>

              <View style={styles.eventRow}>
                <View style={[styles.eventField, styles.eventFieldHalf]}>
                  <Text style={styles.eventLabel}>Tanggal</Text>
                  <TextInput
                    value={teeDate}
                    onChangeText={setTeeDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A69C"
                    style={styles.eventInput}
                  />
                </View>
                <View style={[styles.eventField, styles.eventFieldHalf]}>
                  <Text style={styles.eventLabel}>Jam</Text>
                  <TextInput
                    value={teeTime}
                    onChangeText={setTeeTime}
                    placeholder="HH:MM"
                    placeholderTextColor="#94A69C"
                    style={styles.eventInput}
                  />
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleGreen}>3. Game Mode</Text>
            </View>

            <View style={styles.listContainer}>
              {[
                { key: 'STROKE_PLAY', label: 'Stroke Play', sub: 'Standard score by total strokes.' },
                { key: 'STABLEFORD', label: 'Stableford', sub: 'Points based scoring per hole.' },
                { key: 'MATCH_PLAY', label: 'Match Play', sub: 'Compete hole-by-hole.' },
              ].map((mode) => {
                const selected = gameMode === mode.key;
                return (
                  <Pressable
                    key={mode.key}
                    style={[styles.choiceCard, selected && styles.choiceCardSelected]}
                    onPress={() => setGameMode(mode.key as typeof gameMode)}
                  >
                    <View style={styles.choiceRow}>
                      <View style={[styles.modeIconBox, selected && styles.modeIconBoxActive]}>
                        <Ionicons
                          name={
                            mode.key === 'STROKE_PLAY'
                              ? 'golf'
                              : mode.key === 'STABLEFORD'
                                ? 'stats-chart'
                                : 'people'
                          }
                          size={20}
                          color={selected ? colors.primaryDark : '#63766E'}
                        />
                      </View>
                      <View style={styles.choiceTextWrap}>
                        <Text style={styles.choiceTitle}>{mode.label}</Text>
                        <Text style={styles.choiceSub}>{mode.sub}</Text>
                      </View>
                      {selected && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primaryDark} style={styles.choiceCheck} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerMetaRow}>
          <Text style={styles.footerMetaText} numberOfLines={1}>
            {selectedCourse ? selectedCourse.name : 'Select a course'} •{' '}
            {selectedTeeBoxId && selectedCourse
              ? selectedCourse.teeBoxes.find((t) => t.id === selectedTeeBoxId)?.name ?? 'Tee'
              : 'Tee'}{' '}
            •{' '}
            {gameMode === 'STROKE_PLAY' ? 'Stroke Play' : gameMode === 'STABLEFORD' ? 'Stableford' : 'Match Play'}
          </Text>
          <Pressable onPress={() => setHelpVisible(true)} hitSlop={10}>
            <Text style={styles.footerLink}>Edit Settings</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate('PlayerSelection', { recordMode })}
          disabled={!selectedCourseId}
          style={({ pressed }) => [
            styles.startRoundBtn,
            !selectedCourseId && styles.startRoundBtnDisabled,
            pressed && selectedCourseId ? { opacity: 0.92, transform: [{ scale: 0.99 }] } : null,
          ]}
        >
          <Ionicons name="play" size={18} color="#06210E" />
          <Text style={styles.startRoundText}>START ROUND</Text>
        </Pressable>
      </View>
      <HelpModal 
        visible={helpVisible} 
        onClose={() => setHelpVisible(false)} 
        title="New Round Help" 
        items={helpItems} 
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  topBarSide: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  helpTextButton: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  helpText: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroBg: {
    width: '100%',
    height: 190,
    justifyContent: 'flex-end',
  },
  heroBgImage: {
    opacity: 0.95,
  },
  heroOverlay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  heroEditBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.primaryDark,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primaryDark,
  },
  locationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F4F2',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationHintText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  unitToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F2',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  unitTogglePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  unitTogglePillActive: {
    backgroundColor: colors.primary,
  },
  unitToggleText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textMuted,
  },
  unitToggleTextActive: {
    color: '#0B1A10',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  sectionTitleGreen: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: -0.4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F2',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  listContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  courseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  courseCardSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: '#F0FAF3',
    borderWidth: 1.5,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  courseMainInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 26,
    marginBottom: 4,
  },
  courseMeta: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  courseImageWrap: {
    width: 110,
    height: 86,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F0F4F2',
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  courseImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  nearestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: spacing.sm,
  },
  recentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F1C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: spacing.sm,
  },
  nearestBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyCourses: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: 8,
  },
  emptyCoursesTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  emptyCoursesSub: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  selectedPillText: {
    fontSize: 13,
    color: '#0B1A10',
    fontWeight: '900',
    marginLeft: 8,
  },
  choiceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  choiceCardSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: '#F0FAF3',
    borderWidth: 1.5,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  choiceTextWrap: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
  },
  choiceSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C5D4CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primaryDark,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryDark,
  },
  teeMarkerDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teeMarkerDotText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  modeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIconBoxActive: {
    backgroundColor: colors.primary,
  },
  choiceCheck: {
    marginLeft: 'auto',
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  eventRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  eventField: {
    flex: 1,
    gap: 6,
  },
  eventFieldHalf: {
    flex: 1,
  },
  eventLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  eventInput: {
    backgroundColor: '#F0F4F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  footerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  footerMetaText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  footerLink: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
  },
  startRoundBtn: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startRoundBtnDisabled: {
    opacity: 0.6,
  },
  startRoundText: {
    color: '#06210E',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginLeft: 10,
  },
});
