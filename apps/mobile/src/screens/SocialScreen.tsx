import { Image, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { useEvents, useLeaderboard, useMe, useNotifications, useUsers } from '../api/hooks';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { PrimaryButton } from '../components/PrimaryButton';
import { Logo } from '../components/Logo';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const SocialSkeleton = () => (
  <View style={styles.scrollContent}>
    <View style={styles.leaderboardHeader}>
      <View style={styles.eventInfo}>
        <RectSkeleton width={150} height={14} style={{ marginBottom: 8 }} />
        <RectSkeleton width={100} height={18} borderRadius={12} />
      </View>
      <View style={styles.scoreModeRow}>
        <RectSkeleton width={60} height={28} borderRadius={14} style={{ marginRight: 8 }} />
        <RectSkeleton width={60} height={28} borderRadius={14} />
      </View>
    </View>

    {[1, 2, 3, 4, 5].map((i) => (
      <View key={i} style={styles.row}>
        <View style={styles.rankWrap}>
          <RectSkeleton width={20} height={24} />
          <View style={{ marginTop: 4 }}>
            <CircleSkeleton width={12} height={12} />
          </View>
        </View>
        <View style={styles.avatarContainer}>
          <CircleSkeleton width={44} height={44} />
        </View>
        <View style={styles.nameWrap}>
          <RectSkeleton width={120} height={18} style={{ marginBottom: 6 }} />
          <View style={styles.trendRow}>
            <RectSkeleton width={50} height={12} />
            <View style={styles.dotSeparator} />
            <RectSkeleton width={60} height={12} />
          </View>
        </View>
        <View style={styles.scoreWrap}>
          <RectSkeleton width={30} height={24} style={{ marginBottom: 4 }} />
          <RectSkeleton width={35} height={10} />
        </View>
      </View>
    ))}
  </View>
);

export function SocialScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { centeredContainerStyle } = useResponsiveLayout();
  const {
    data,
    isLoading,
    error: leaderboardError,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = useLeaderboard();
  const { data: users } = useUsers();
  const { data: events } = useEvents();
  const { data: me } = useMe();
  const {
    data: notifications,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useNotifications(me?.id);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'notifications'>('leaderboard');
  const [scoreMode, setScoreMode] = useState<'GROSS' | 'NET'>('GROSS');

  const avatarByName = new Map((users ?? []).map((user) => [user.fullName, user.avatarUrl]));
  const userById = new Map((users ?? []).map((user) => [user.id, user]));

  useEffect(() => {
    const params = (route as { params?: TabParamList['Social'] })?.params;
    if (params?.initialTab) {
      setActiveTab(params.initialTab);
    }
  }, [route]);

  const activeEvent = events?.[0];
  const lastUpdated = useMemo(() => {
    if (!dataUpdatedAt) return 'JUST NOW';
    const diff = Date.now() - dataUpdatedAt;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'JUST NOW';
    return `${mins}M AGO`;
  }, [dataUpdatedAt, isRefetching]);

  const isLoadingAny = activeTab === 'leaderboard' ? isLoading : notificationsLoading;
  const activeError = activeTab === 'leaderboard' ? leaderboardError : notificationsError;

  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      <View style={[styles.page, centeredContainerStyle]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Logo size={36} />
            <Text style={styles.title}>Community</Text>
          </View>
          <Pressable 
            style={({ pressed }) => [
              styles.refreshBtn,
              pressed && { opacity: 0.7, backgroundColor: '#E8F0EB' }
            ]} 
            onPress={() => void refetch()}
          >
            <Ionicons name="refresh" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabRow}>
            {(['leaderboard', 'notifications'] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tabOption, activeTab === tab && styles.tabOptionActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'leaderboard' ? 'Leaderboard' : 'Notifications'}
                </Text>
                {tab === 'notifications' && (notifications?.length ?? 0) > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{notifications?.length}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {isLoadingAny ? (
          <SocialSkeleton />
        ) : activeError ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Failed to load</Text>
            <Text style={styles.emptySub}>
              {activeError instanceof Error ? activeError.message : 'Please try again.'}
            </Text>
            <View style={{ marginTop: spacing.lg, width: '100%' }}>
              <PrimaryButton
                label="Retry"
                onPress={() => {
                  if (activeTab === 'leaderboard') {
                    void refetch();
                  } else {
                    void refetchNotifications();
                  }
                }}
              />
            </View>
          </View>
        ) : activeTab === 'leaderboard' ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.leaderboardHeader}>
            <View style={styles.eventInfo}>
              <Text style={styles.subTitle}>{activeEvent?.title?.toUpperCase() ?? 'GLOBAL LEADERBOARD'}</Text>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>LIVE • {isRefetching ? 'UPDATING' : lastUpdated}</Text>
              </View>
            </View>

            <View style={styles.scoreModeRow}>
              {(['GROSS', 'NET'] as const).map((mode) => (
                <Pressable
                  key={mode}
                  style={[styles.scoreModePill, scoreMode === mode && styles.scoreModePillActive]}
                  onPress={() => setScoreMode(mode)}
                >
                  <Text style={[styles.scoreModeText, scoreMode === mode && styles.scoreModeTextActive]}>{mode}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {(data ?? []).map((entry, index) => {
            const user = userById.get(entry.userId);
            const isYou = entry.userId === me?.id;
            const rawHandicapIndex = user?.handicapIndex;
            const handicapIndexParsed =
              typeof rawHandicapIndex === 'number'
                ? rawHandicapIndex
                : typeof rawHandicapIndex === 'string'
                  ? Number(rawHandicapIndex)
                  : null;
            const handicapIndex =
              handicapIndexParsed !== null && Number.isFinite(handicapIndexParsed) ? handicapIndexParsed : null;
            const netScore = handicapIndex !== null ? entry.total - Math.round(handicapIndex) : entry.total;
            const isTop3 = index < 3;

            return (
              <View key={entry.userId} style={[styles.row, isYou && styles.rowHighlight]}>
                <View style={styles.rankWrap}>
                  <Text style={[styles.pos, isTop3 && styles.posTop3]}>{entry.position}</Text>
                  <View style={styles.trendIconWrap}>
                    {entry.trend === 'UP' ? (
                      <Ionicons name="caret-up" size={14} color="#1DCB63" />
                    ) : entry.trend === 'DOWN' ? (
                      <Ionicons name="caret-down" size={14} color="#E35157" />
                    ) : (
                      <View style={styles.trendDot} />
                    )}
                  </View>
                </View>
                
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatarWrap, isTop3 && styles.avatarWrapTop3]}>
                    {avatarByName.get(entry.playerName) ? (
                      <Image source={{ uri: avatarByName.get(entry.playerName) }} style={styles.avatar} />
                    ) : (
                      <Ionicons name="person" size={24} color={colors.textMuted} />
                    )}
                  </View>
                  {isTop3 && (
                    <View style={styles.crownIcon}>
                      <Ionicons name="ribbon" size={14} color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} />
                    </View>
                  )}
                </View>

                <View style={styles.nameWrap}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{entry.playerName}</Text>
                    {isYou ? (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>YOU</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.trendRow}>
                    <Text style={styles.thru}>THRU {entry.thru}</Text>
                    <View style={styles.dotSeparator} />
                    <Text style={styles.thru}>HDCP {handicapIndex !== null ? handicapIndex.toFixed(1) : '-'}</Text>
                  </View>
                </View>
                
                <View style={styles.scoreWrap}>
                  <Text style={styles.score}>{scoreMode === 'NET' ? netScore : entry.total}</Text>
                  <Text style={styles.scoreLabel}>{scoreMode}</Text>
                </View>
              </View>
            );
          })}

          <View style={styles.ctaCard}>
            <View style={styles.ctaIconBox}>
              <Ionicons name="fast-food" size={24} color={colors.primaryDark} />
            </View>
            <View style={styles.ctaTextWrap}>
              <Text style={styles.ctaTitle}>Order Refreshments</Text>
              <Text style={styles.ctaSub}>View the menu and track delivery</Text>
            </View>
            <Pressable 
              style={styles.ctaButton} 
              onPress={() => navigation.navigate('Tabs', { screen: 'Order' })}
            >
              <Text style={styles.ctaButtonText}>Menu</Text>
              <Ionicons name="arrow-forward" size={16} color="#0A1F10" />
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {(notifications ?? []).map((notification) => (
            <View key={notification.id} style={styles.noticeCard}>
              <View style={styles.noticeIcon}>
                <Ionicons name="notifications" size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.noticeText}>
                <View style={styles.noticeHeader}>
                  <Text style={styles.noticeTitle}>{notification.title}</Text>
                  <Text style={styles.noticeTime}>
                    {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.noticeMessage}>{notification.message}</Text>
              </View>
            </View>
          ))}
          {(notifications ?? []).length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySub}>We'll notify you when something happens.</Text>
            </View>
          )}
        </ScrollView>
      )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4F2',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  tabContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E8F0EB',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tabOption: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  tabOptionActive: {
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  tabText: {
    fontWeight: '800',
    color: '#5D7C6E',
    fontSize: 15,
  },
  tabTextActive: {
    color: colors.text,
  },
  notifBadge: {
    backgroundColor: colors.primaryDark,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  scoreModeRow: {
    flexDirection: 'row',
    backgroundColor: '#E8F0EB',
    borderRadius: 999,
    padding: 3,
  },
  scoreModePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreModePillActive: {
    backgroundColor: colors.primaryDark,
  },
  scoreModeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#5D7C6E',
  },
  scoreModeTextActive: {
    color: '#FFFFFF',
  },
  subTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCEFE3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1DCB63',
  },
  livePillText: {
    color: '#1A2C22',
    fontWeight: '800',
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  rowHighlight: {
    borderColor: colors.primaryDark,
    backgroundColor: '#F0FAF3',
    borderWidth: 1.5,
  },
  pos: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  posTop3: {
    color: colors.primaryDark,
    fontSize: 22,
  },
  rankWrap: {
    width: 32,
    alignItems: 'center',
    marginRight: 8,
  },
  trendIconWrap: {
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4D1C9',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F0F4F2',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapTop3: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  crownIcon: {
    position: 'absolute',
    top: -6,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  nameWrap: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  youBadge: {
    borderRadius: 6,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.border,
  },
  thru: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 11,
  },
  scoreWrap: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primaryDark,
    lineHeight: 32,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  ctaCard: {
    marginTop: spacing.md,
    borderRadius: 20,
    backgroundColor: '#1A2C22',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ctaIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTextWrap: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  ctaSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A5B5AD',
    marginTop: 2,
  },
  ctaButton: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A1F10',
  },
  noticeCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  noticeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F0FAF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeText: {
    flex: 1,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
  },
  noticeMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 20,
  },
  noticeTime: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A69C',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
