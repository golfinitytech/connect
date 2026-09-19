import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../components/Logo';
import { useMe, useOrders, useRounds } from '../api/hooks';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const StatsSkeleton = () => (
  <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <View style={styles.headerRow}>
      <RectSkeleton width={40} height={40} borderRadius={8} />
      <RectSkeleton width={120} height={28} />
      <RectSkeleton width={44} height={44} borderRadius={14} />
    </View>

    <View style={styles.heroCard}>
      <View style={styles.heroHeader}>
        <RectSkeleton width={80} height={20} borderRadius={8} />
        <RectSkeleton width={100} height={14} />
      </View>
      <View style={styles.heroContent}>
        <View style={styles.heroScoreWrap}>
          <RectSkeleton width={100} height={80} />
          <RectSkeleton width={50} height={24} borderRadius={10} style={{ marginTop: 10 }} />
        </View>
        <RectSkeleton width={180} height={24} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.heroFooter}>
        <View style={styles.miniStat}>
          <RectSkeleton width={50} height={12} style={{ marginBottom: 4 }} />
          <RectSkeleton width={40} height={20} />
        </View>
        <View style={styles.heroDivider} />
        <View style={styles.miniStat}>
          <RectSkeleton width={60} height={12} style={{ marginBottom: 4 }} />
          <RectSkeleton width={30} height={20} />
        </View>
      </View>
    </View>

    <View style={styles.sectionHeader}>
      <RectSkeleton width={100} height={24} />
      <View style={styles.sectionLine} />
    </View>

    <View style={styles.metricsGrid}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.metricCard}>
          <CircleSkeleton width={36} height={36} style={{ marginBottom: 8 }} />
          <RectSkeleton width={50} height={24} style={{ marginBottom: 4 }} />
          <RectSkeleton width={40} height={12} />
        </View>
      ))}
    </View>

    <View style={[styles.orderCard, { height: 160 }]}>
      <View style={styles.orderTextWrap}>
        <RectSkeleton width={150} height={28} style={{ marginBottom: 8 }} />
        <RectSkeleton width={200} height={14} style={{ marginBottom: 4 }} />
        <RectSkeleton width={180} height={14} style={{ marginBottom: 12 }} />
        <RectSkeleton width={120} height={40} borderRadius={12} />
      </View>
    </View>
  </ScrollView>
);

export function StatsScreen() {
  const { centeredContainerStyle } = useResponsiveLayout();
  const navigation = useNavigation<
    CompositeNavigationProp<
      BottomTabNavigationProp<TabParamList, 'Stats'>,
      NativeStackNavigationProp<RootStackParamList>
    >
  >();
  const { data: rounds, isLoading: isLoadingRounds } = useRounds();
  const { data: me } = useMe();
  const { data: orders } = useOrders(me?.id);

  if (isLoadingRounds) {
    return (
      <ScreenWrapper style={styles.safeArea} edges={['top']}>
        <StatsSkeleton />
      </ScreenWrapper>
    );
  }

  const roundsCount = rounds?.length ?? 0;
  const finishedRounds = rounds?.filter((round) => round.status === 'FINISHED') ?? [];
  const latestFinished = finishedRounds.length > 0 ? finishedRounds[0] : null;

  const summary = useMemo(() => {
    if (!latestFinished) {
      return {
        score: '--',
        delta: '--',
        course: 'Padang Golf Sulaiman',
        date: '---',
      };
    }

    const playerId = latestFinished.players[0]?.userId;
    const userScores = (latestFinished.holeScores ?? []).filter((score) => score.userId === playerId);
    const total = userScores.reduce((sum, score) => sum + score.strokes, 0);
    const parTotal = (latestFinished.course.holes ?? []).reduce((sum, hole) => sum + hole.par, 0);
    const delta = parTotal ? total - parTotal : 0;
    const deltaLabel = delta === 0 ? 'E' : delta > 0 ? `+${delta}` : `${delta}`;

    const date = new Date(latestFinished.updatedAt);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      score: total || '--',
      delta: parTotal ? deltaLabel : '',
      course: 'Padang Golf Sulaiman',
      date: `${dateStr} • ${latestFinished.course.city}`,
    };
  }, [latestFinished]);

  const metrics = useMemo(() => {
    if (finishedRounds.length === 0) {
      return { gir: '0%', fairways: '0%', avgPutts: '0' };
    }

    let totalHoles = 0;
    let totalGIR = 0;
    let totalFairways = 0;
    let totalFairwayChances = 0;
    let totalPutts = 0;

    finishedRounds.forEach((round) => {
      const playerId = round.players[0]?.userId;
      const scores = (round.holeScores ?? []).filter((s) => s.userId === playerId);
      
      scores.forEach((score) => {
        totalHoles++;
        if (score.gir) totalGIR++;
        if (score.fairwayHit === 'CENTER') totalFairways++;
        if (score.fairwayHit) totalFairwayChances++; 
        totalPutts += score.putts;
      });
    });

    const girPct = totalHoles > 0 ? Math.round((totalGIR / totalHoles) * 100) : 0;
    const fwPct = totalFairwayChances > 0 ? Math.round((totalFairways / totalFairwayChances) * 100) : 0;
    const avgPutts = totalHoles > 0 ? (totalPutts / (totalHoles / 18)).toFixed(1) : '0';

    return {
      gir: `${girPct}%`,
      fairways: `${fwPct}%`,
      avgPutts,
    };
  }, [finishedRounds]);

  const lastOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    return orders[0]; 
  }, [orders]);

  const onShare = async () => {
    const message = [
      `Golfinity Connect - Round Summary`,
      `${summary.score} (${summary.delta})`,
      summary.course,
      summary.date,
      `GIR: ${metrics.gir} | Fairways: ${metrics.fairways} | Avg Putts: ${metrics.avgPutts}`,
    ]
      .filter(Boolean)
      .join('\n');
    try {
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to open share sheet.');
    }
  };

  return (
    <ScreenWrapper style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.container, centeredContainerStyle]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Logo size={40} />
          <Text style={styles.title}>Performance</Text>
          <Pressable style={styles.shareButton} onPress={() => void onShare()}>
            <Ionicons name="share-social-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>LATEST ROUND</Text>
            </View>
            <Text style={styles.heroDate}>{summary.date}</Text>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroScoreWrap}>
              <Text style={styles.heroScore}>{summary.score}</Text>
              <View style={[styles.heroDeltaPill, summary.delta.includes('+') ? styles.deltaPlus : styles.deltaMinus]}>
                <Text style={styles.heroDeltaText}>{summary.delta}</Text>
              </View>
            </View>
            <Text style={styles.heroCourse} numberOfLines={1}>{summary.course}</Text>
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatLabel}>ROUNDS</Text>
              <Text style={styles.miniStatValue}>{roundsCount}</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatLabel}>HANDICAP</Text>
              <Text style={styles.miniStatValue}>{me?.handicapIndex ?? '--'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accuracy</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <Ionicons name="flag-outline" size={18} color={colors.primaryDark} />
            </View>
            <Text style={styles.metricValue}>{metrics.gir}</Text>
            <Text style={styles.metricLabel}>GIR</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <Ionicons name="git-commit-outline" size={18} color={colors.primaryDark} />
            </View>
            <Text style={styles.metricValue}>{metrics.fairways}</Text>
            <Text style={styles.metricLabel}>Fairways</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <Ionicons name="golf-outline" size={18} color={colors.primaryDark} />
            </View>
            <Text style={styles.metricValue}>{metrics.avgPutts}</Text>
            <Text style={styles.metricLabel}>Avg Putts</Text>
          </View>
        </View>

        <View style={styles.orderCard}>
          <View style={styles.orderTextWrap}>
            <Text style={styles.orderTitle}>Hungry for more?</Text>
            <Text style={styles.orderSub}>
              {lastOrder 
                ? `You loved that order on hole ${lastOrder.holeNumber}. Get it again!`
                : 'Order food and drinks for your next round directly from the app.'}
            </Text>
            <Pressable style={styles.orderBtn} onPress={() => navigation.navigate('Order')}>
              <Text style={styles.orderBtnText}>{lastOrder ? 'Reorder Now' : 'View Menu'}</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={styles.orderIconWrap}>
            <Ionicons name="restaurant" size={42} color="rgba(255,255,255,0.2)" />
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    gap: 24,
    paddingBottom: spacing.xl * 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    gap: 12,
  },
  heroCard: {
    backgroundColor: colors.text,
    borderRadius: 28,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 10px 20px 0px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  heroContent: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  heroScoreWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  heroScore: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 80,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLeft: {
    marginRight: spacing.md,
    alignItems: 'center',
  },
  summaryRight: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroDeltaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 10,
  },
  deltaPlus: {
    backgroundColor: '#FFEDED',
  },
  deltaMinus: {
    backgroundColor: '#F0F9F4',
  },
  heroDeltaText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  heroCourse: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  miniStat: {
    alignItems: 'center',
    gap: 4,
  },
  miniStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
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
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  orderCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 28,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  orderTextWrap: {
    flex: 1,
    gap: 8,
    zIndex: 1,
  },
  orderTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  orderSub: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 8,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  orderBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  orderIconWrap: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
});
