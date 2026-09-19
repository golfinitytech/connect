import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useCourses,
  useEventRegistrations,
  useEvents,
  useMe,
  useRegisterEvent,
  useRounds,
} from '../api/hooks';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { LanguagePicker } from '../components/LanguagePicker';
import { RecordScoreModal } from '../components/RecordScoreModal';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';

const BRAND_LOGO = require('../../assets/brand/logo.jpeg');
const HOME_HEADER_BG = require('../../assets/mock/home/home-header.jpg');

const HomeSkeleton = () => (
  <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <RectSkeleton width="100%" height={64} borderRadius={0} />
    <RectSkeleton width="100%" height={220} borderRadius={0} style={{ marginTop: -spacing.lg }} />
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
      <RectSkeleton width={220} height={16} />
      <RectSkeleton width={180} height={28} style={{ marginTop: 6 }} />
      <RectSkeleton width="100%" height={116} borderRadius={16} style={{ marginTop: spacing.lg }} />
      <RectSkeleton width="100%" height={88} borderRadius={16} style={{ marginTop: spacing.lg }} />
      <RectSkeleton width="100%" height={220} borderRadius={16} style={{ marginTop: spacing.lg }} />
      <RectSkeleton width="100%" height={200} borderRadius={20} style={{ marginTop: spacing.lg }} />
    </View>

  </ScrollView>
);

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: me, isLoading: meLoading, refetch: refetchMe } = useMe();
  const { data: courses, isLoading: coursesLoading, refetch: refetchCourses } = useCourses();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: rounds, isLoading: roundsLoading } = useRounds();
  const { data: eventRegistrations } = useEventRegistrations(me?.id);
  const registerEvent = useRegisterEvent();

  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [missingDataVisible, setMissingDataVisible] = useState(false);

  const recentRound = useMemo(() => {
    if (!rounds || rounds.length === 0) {
      return null;
    }
    return rounds[0];
  }, [rounds]);

  const activeRound = useMemo(() => {
    return (rounds ?? []).find((round) => round.status === 'IN_PROGRESS');
  }, [rounds]);

  const recentRoundSummary = useMemo(() => {
    if (!recentRound) {
      return { total: '--', delta: '--', date: '---' };
    }

    const playerId = recentRound.players[0]?.userId;
    const userScores = (recentRound.holeScores ?? []).filter((score) => score.userId === playerId);
    const total = userScores.reduce((sum, score) => sum + score.strokes, 0);
    const parTotal = (recentRound.course.holes ?? []).reduce((sum, hole) => sum + hole.par, 0);
    const delta = parTotal ? total - parTotal : 0;
    const deltaLabel = delta === 0 ? 'E' : delta > 0 ? `+${delta}` : `${delta}`;

    const date = new Date(recentRound.updatedAt);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      total: total || '--',
      delta: parTotal ? deltaLabel : '--',
      date: dateStr.toUpperCase(),
    };
  }, [recentRound]);

  const featuredEvent = useMemo(() => {
    if (!events || events.length === 0) {
      return null;
    }
    return events[0];
  }, [events]);

  const eventDate = useMemo(() => {
    if (!featuredEvent) {
      return null;
    }

    const date = new Date(featuredEvent.startDate);
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(date.getDate());
    return { month, day };
  }, [featuredEvent]);

  const registeredEventIds = useMemo(
    () => new Set((eventRegistrations ?? []).map((registration) => registration.eventId)),
    [eventRegistrations],
  );

  const firstName = useMemo(() => {
    const fullName = me?.fullName?.trim();
    if (!fullName) return '';
    return fullName.split(/\s+/)[0] ?? '';
  }, [me?.fullName]);

  const roundsThisYear = useMemo(() => {
    const year = new Date().getFullYear();
    return (rounds ?? []).filter((r) => new Date(r.updatedAt).getFullYear() === year).length;
  }, [rounds]);

  const isDataReady = Boolean(me) && Boolean(courses && courses.length > 0);

  const openStartRound = () => {
    if (!isDataReady) {
      setMissingDataVisible(true);
      return;
    }
    setRecordModalVisible(true);
  };

  const isLoading = meLoading || coursesLoading || roundsLoading || eventsLoading;

  return (
    <ScreenWrapper style={styles.safeArea} edges={['top']}>
      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <>
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Image source={BRAND_LOGO} style={styles.topBarLogo} resizeMode="contain" />
              <Text style={styles.topBarText}>Connect</Text>
            </View>
            <View style={styles.topBarRight}>
              <Pressable
                style={styles.topBarIconBtn}
                onPress={() => navigation.navigate('Tabs', { screen: 'Social', params: { initialTab: 'notifications' } })}
              >
                <Ionicons name="notifications" size={20} color="#FFFFFF" />
              </Pressable>
              <View style={styles.topBarLang}>
                <LanguagePicker />
              </View>
              <Pressable style={styles.topBarIconBtn} onPress={() => navigation.navigate('Tabs', { screen: 'Profile' })}>
                <Ionicons name="menu" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeLabel}>Welcome Back</Text>
              <Text style={styles.welcomeName} numberOfLines={1}>
                {me?.fullName ?? firstName}
              </Text>
            </View>

            <View style={styles.statsPanel}>
              <View style={styles.statsNumbersRow}>
                <View style={styles.statsNumberItem}>
                  <Text style={styles.statsNumberValue}>{roundsThisYear}</Text>
                  <Text style={styles.statsNumberLabel}>{new Date().getFullYear()} Rounds</Text>
                </View>
                <View style={styles.statsNumberItem}>
                  <Text style={styles.statsNumberValue}>{rounds?.length ?? 0}</Text>
                  <Text style={styles.statsNumberLabel}>Total Rounds</Text>
                </View>
                <View style={styles.statsNumberItem}>
                  <Text style={styles.statsNumberValue}>{me?.handicapIndex ?? '--'}</Text>
                  <Text style={styles.statsNumberLabel}>SS Handicap</Text>
                </View>
              </View>

              <View style={styles.statsActionsRow}>
                <Pressable style={styles.recordBtn} onPress={openStartRound}>
                  <Ionicons name="create" size={18} color="#FFFFFF" />
                  <Text style={styles.recordBtnText}>Record Your Score</Text>
                </Pressable>
                <Pressable
                  style={styles.statsBtn}
                  onPress={() => navigation.navigate('Tabs', { screen: 'Stats' })}
                >
                  <Ionicons name="stats-chart" size={18} color="#FFFFFF" />
                  <Text style={styles.statsBtnText}>All Time{'\n'}Statistics</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.rowSpaceBetween}>
                <Text style={styles.sectionTitle}>Recent Round</Text>
                <Pressable
                  onPress={() => {
                    if (recentRound) {
                      navigation.navigate('Scorecard', { roundId: recentRound.id });
                      return;
                    }
                    navigation.navigate('Tabs', { screen: 'Stats' });
                  }}
                  style={styles.seeAllBtn}
                >
                  <Text style={styles.seeAll}>See All</Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.recentRowNew}
                onPress={() => {
                  if (recentRound) {
                    navigation.navigate('Scorecard', { roundId: recentRound.id });
                  }
                }}
                disabled={!recentRound}
              >
                <View style={styles.recentLeft}>
                  <Text style={styles.dateText}>{recentRoundSummary.date}</Text>
                  <Text style={styles.courseName} numberOfLines={1}>
                    {recentRound?.course.name ?? 'No rounds yet'}
                  </Text>
                  <View style={styles.recentScoreRow}>
                    <Text style={styles.recentScore}>{recentRoundSummary.total}</Text>
                    <View style={styles.recentDeltaPill}>
                      <Text style={styles.recentDeltaText}>
                        {recentRoundSummary.delta === 'E'
                          ? 'Even Par'
                          : String(recentRoundSummary.delta).startsWith('-')
                            ? `${recentRoundSummary.delta} Under Par`
                            : `${recentRoundSummary.delta} Over Par`}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.viewScorecardBtn}
                    onPress={() => {
                      if (recentRound) navigation.navigate('Scorecard', { roundId: recentRound.id });
                    }}
                    disabled={!recentRound}
                  >
                    <Ionicons name="flag" size={16} color="#0B2A18" />
                    <Text style={styles.viewScorecardText}>View Scorecard</Text>
                  </Pressable>
                </View>
                <View style={styles.recentRight}>
                  {recentRound?.course.imageUrl ? (
                    <Image source={{ uri: recentRound.course.imageUrl }} style={styles.recentThumbNew} />
                  ) : (
                    <Image source={HOME_HEADER_BG} style={styles.recentThumbNew} />
                  )}
                </View>
              </Pressable>
            </View>

            <View style={styles.menuGrid}>
              {[
                { label: 'Score', icon: 'create', onPress: openStartRound },
                { label: 'Golf Club', icon: 'golf', onPress: () => Alert.alert('Golf Club', 'Coming soon.') },
                { label: 'Golf Buddy', icon: 'people', onPress: () => navigation.navigate('Tabs', { screen: 'Social' }) },
                { label: 'My Golf Bag', icon: 'bag', onPress: () => Alert.alert('My Golf Bag', 'Coming soon.') },
                { label: 'Golfinity Academy', icon: 'school', onPress: () => Alert.alert('Golfinity Academy', 'Coming soon.') },
                { label: 'Golf News', icon: 'newspaper', onPress: () => Alert.alert('Golf News', 'Coming soon.') },
                { label: 'Community', icon: 'chatbubbles', onPress: () => navigation.navigate('Tabs', { screen: 'Social' }) },
                { label: 'Profile', icon: 'person', onPress: () => navigation.navigate('Tabs', { screen: 'Profile' }) },
              ].map((item) => (
                <Pressable key={item.label} style={styles.menuItem} onPress={item.onPress}>
                  <Ionicons name={item.icon as any} size={28} color="#FFFFFF" />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            {featuredEvent ? (
              <ImageBackground
                source={featuredEvent?.imageUrl ? { uri: featuredEvent.imageUrl } : HOME_HEADER_BG}
                style={styles.eventCard}
                imageStyle={styles.eventImage}
              >
                <View style={styles.eventOverlay}>
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <View style={styles.eventBadgeWrap}>
                        <Text style={styles.eventBadge}>Tournament</Text>
                      </View>
                      {eventDate ? (
                        <View style={styles.eventDateBox}>
                          <Text style={styles.eventDateMonth}>{eventDate.month}</Text>
                          <Text style={styles.eventDateDay}>{eventDate.day}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {featuredEvent.title}
                    </Text>
                    <Text style={styles.eventMeta} numberOfLines={2}>
                      {featuredEvent.subtitle ?? 'Join our upcoming club tournament'}
                    </Text>
                    <Text style={styles.eventStatusText}>
                      {registeredEventIds.has(featuredEvent.id) ? 'Already Registered' : ''}
                    </Text>
                    <Pressable
                      style={[
                        styles.eventCta,
                        registeredEventIds.has(featuredEvent.id) && styles.eventCtaRegistered,
                      ]}
                      onPress={() => {
                        if (!me) return;
                        if (registeredEventIds.has(featuredEvent.id)) {
                          return;
                        }
                        void registerEvent
                          .mutateAsync({ eventId: featuredEvent.id, userId: me.id })
                          .catch(() => {});
                      }}
                    >
                      <Text
                        style={[
                          styles.eventCtaText,
                          registeredEventIds.has(featuredEvent.id) && styles.eventCtaTextRegistered,
                        ]}
                      >
                        {registeredEventIds.has(featuredEvent.id) ? 'Registered' : 'Register'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </ImageBackground>
            ) : null}
          </ScrollView>
          <RecordScoreModal
            visible={recordModalVisible}
            onClose={() => setRecordModalVisible(false)}
            showResume={Boolean(activeRound)}
            onResume={() => {
              if (!activeRound) return;
              navigation.navigate('RoundScoring', { roundId: activeRound.id, recordMode: 'LIVE' });
            }}
            onStartNew={() => navigation.navigate('NewRound', { recordMode: 'LIVE' })}
            onLive={() => navigation.navigate('NewRound', { recordMode: 'LIVE' })}
            onPost={() => navigation.navigate('NewRound', { recordMode: 'POST' })}
          />
          <ConfirmationModal
            visible={missingDataVisible}
            onClose={() => setMissingDataVisible(false)}
            onConfirm={() => {
              setMissingDataVisible(false);
              void refetchMe();
              void refetchCourses();
            }}
            title="Data belum siap"
            message="Data user atau daftar course belum berhasil dimuat. Klik Refresh, lalu coba lagi."
            confirmLabel="Refresh data"
            cancelLabel="Tutup"
            type="info"
          />
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  topBar: {
    backgroundColor: '#0B2A18',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  topBarLogo: {
    width: 34,
    height: 34,
  },
  topBarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  topBarLang: {
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
    backgroundColor: '#F5F7F6',
  },
  welcomeSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: 4,
  },
  welcomeLabel: {
    color: '#0B2A18',
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.75,
  },
  welcomeName: {
    color: '#0B2A18',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  statsPanel: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: '#0B2A18',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  statsNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsNumberItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statsNumberValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  statsNumberLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '800',
  },
  statsActionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    marginTop: 12,
  },
  recordBtn: {
    flex: 1,
    backgroundColor: '#0B4A73',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  recordBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  statsBtn: {
    width: 132,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statsBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 14,
  },
  container: {
    padding: spacing.lg,
    gap: 24,
    paddingBottom: spacing.xl * 2,
  },
  headerRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarWrapSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.primary,
    overflow: 'hidden',
    backgroundColor: '#DDEBE3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  weatherWrap: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  weatherTop: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weatherTemp: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
  },
  mainCta: {
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0px 8px 15px 0px ${colors.primary}4D`,
      },
    }),
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: '#F8FAf9',
    padding: spacing.md,
    borderRadius: 20,
  },
  recentMeta: {
    flex: 1,
    gap: 4,
  },
  dateText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  recentRowNew: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  recentLeft: {
    flex: 1,
    padding: spacing.md,
    gap: 6,
  },
  recentRight: {
    width: 130,
    backgroundColor: '#F1F3F2',
  },
  recentThumbNew: {
    width: '100%',
    height: '100%',
  },
  recentScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  recentScore: {
    color: '#0B2A18',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  recentDeltaPill: {
    backgroundColor: '#E8F4EE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(19,95,60,0.25)',
  },
  recentDeltaText: {
    color: '#135F3C',
    fontSize: 12,
    fontWeight: '900',
  },
  viewScorecardBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E7ECEA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  viewScorecardText: {
    color: '#0B2A18',
    fontSize: 13,
    fontWeight: '900',
  },
  menuGrid: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuItem: {
    width: '31.3%',
    minWidth: 92,
    backgroundColor: '#0B2A18',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  menuLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 14,
  },
  eventStatusText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: -6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bigScore: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.primaryDark,
    letterSpacing: -1,
  },
  parPill: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  parPillText: {
    color: '#0C2012',
    fontSize: 14,
    fontWeight: '800',
  },
  recentThumbWrap: {
    width: 84,
    height: 84,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  recentThumb: {
    width: '100%',
    height: '100%',
  },
  recentThumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2F0',
  },
  promoCard: {
    borderRadius: 24,
    backgroundColor: colors.text,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 8px 16px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  promoIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoTextWrap: {
    flex: 1,
    gap: 2,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  promoSub: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  promoCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  promoCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0C2012',
  },
  eventCard: {
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 320,
    backgroundColor: '#072016',
  },
  eventImage: {
    borderRadius: 28,
    opacity: 0.6,
  },
  eventOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  eventContent: {
    padding: spacing.xl,
    gap: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventBadgeWrap: {
    backgroundColor: 'rgba(22, 216, 78, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(22, 216, 78, 0.3)',
  },
  eventBadge: {
    color: colors.primary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '900',
  },
  eventDateBox: {
    width: 64,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  eventDateMonth: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  eventDateDay: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  eventTextWrap: {
    gap: 4,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  eventMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  eventCta: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  eventCtaRegistered: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  eventCtaText: {
    color: '#072016',
    fontSize: 16,
    fontWeight: '800',
  },
  eventCtaTextRegistered: {
    color: '#FFFFFF',
  },
  emptyEventCard: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 200,
  },
  emptyEventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  emptyEventSub: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
