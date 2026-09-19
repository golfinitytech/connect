import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMe, useOrders, useRound, useRounds } from '../api/hooks';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const SummarySkeleton = () => (
  <View style={{ flex: 1, padding: spacing.lg }}>
    <View style={styles.topBar}>
      <CircleSkeleton width={32} height={32} />
      <RectSkeleton width={120} height={24} />
      <CircleSkeleton width={32} height={32} />
    </View>

    <View style={styles.heroWrap}>
      <RectSkeleton width={150} height={48} style={{ marginBottom: 12 }} />
      <RectSkeleton width={100} height={20} style={{ marginBottom: 24 }} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <RectSkeleton key={i} width={80} height={32} borderRadius={16} />
        ))}
      </View>
    </View>

    <View style={styles.compareCard}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.compareRow}>
          <RectSkeleton width={40} height={24} style={{ marginBottom: 4 }} />
          <RectSkeleton width={60} height={12} />
        </View>
      ))}
    </View>

    <View style={styles.chartCard}>
      <RectSkeleton width={120} height={18} style={{ marginBottom: 16 }} />
      <RectSkeleton width="100%" height={150} borderRadius={12} />
    </View>

    <View style={{ marginTop: 'auto', gap: 12, marginBottom: 24 }}>
      <RectSkeleton width="100%" height={56} borderRadius={28} />
      <RectSkeleton width="100%" height={56} borderRadius={28} />
    </View>
  </View>
);

type Props = NativeStackScreenProps<RootStackParamList, 'RoundSummary'>;

export function RoundSummaryScreen({ route, navigation }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const { centeredContainerStyle } = useResponsiveLayout({ maxWidth: 1120 });
  const { roundId } = route.params;
  const { data: round, isLoading } = useRound(roundId);
  const { data: allRounds } = useRounds();
  const { data: me } = useMe();
  const { data: orders } = useOrders(me?.id);

  const isSmallScreen = screenWidth < 380;
  const headingFontSize = isSmallScreen ? 28 : 34;
  const reorderTitleFontSize = isSmallScreen ? 32 : 40;
  const reorderTitleLineHeight = isSmallScreen ? 36 : 44;

  const seasonAverages = useMemo(() => {
    if (!allRounds || !me) return { fairwaysPct: 62, girPct: 44, putts: 32.4 };

    const finishedRounds = allRounds.filter((r) => r.status === 'FINISHED');
    if (finishedRounds.length === 0) return { fairwaysPct: 62, girPct: 44, putts: 32.4 };

    let totalHoles = 0;
    let totalGIR = 0;
    let totalFairways = 0;
    let totalFairwayChances = 0;
    let totalPutts = 0;

    finishedRounds.forEach((r) => {
      const scores = (r.holeScores ?? []).filter((s) => s.userId === me.id);
      scores.forEach((score) => {
        totalHoles++;
        if (score.gir) totalGIR++;
        if (score.fairwayHit === 'CENTER') totalFairways++;
        if (score.fairwayHit) totalFairwayChances++;
        totalPutts += score.putts;
      });
    });

    return {
      fairwaysPct: totalFairwayChances > 0 ? Math.round((totalFairways / totalFairwayChances) * 100) : 62,
      girPct: totalHoles > 0 ? Math.round((totalGIR / totalHoles) * 100) : 44,
      putts: totalHoles > 0 ? Number((totalPutts / (totalHoles / 18)).toFixed(1)) : 32.4,
    };
  }, [allRounds, me]);

  const summary = useMemo(() => {
    if (!round) {
      return null;
    }

    const primaryUserId = round.players[0]?.userId;
    const userScores = (round.holeScores ?? []).filter((score) => score.userId === primaryUserId);
    const totalStrokes = userScores.reduce((sum, score) => sum + score.strokes, 0);
    const putts = userScores.reduce((sum, score) => sum + score.putts, 0);
    const girCount = userScores.filter((score) => score.gir).length;
    const fairwaysCenter = userScores.filter((score) => score.fairwayHit === 'CENTER').length;
    const girPct = userScores.length ? Math.round((girCount / userScores.length) * 100) : 0;
    const fairwaysPct = userScores.length ? Math.round((fairwaysCenter / userScores.length) * 100) : 0;
    const scoring = userScores.reduce(
      (acc, score) => {
        const par = score.hole?.par ?? 0;
        const delta = score.strokes - par;
        if (delta <= -1) {
          acc.birdie += 1;
        } else if (delta === 0) {
          acc.par += 1;
        } else if (delta === 1) {
          acc.bogey += 1;
        } else {
          acc.double += 1;
        }
        return acc;
      },
      { birdie: 0, par: 0, bogey: 0, double: 0 },
    );

    return {
      totalStrokes,
      putts,
      girPct,
      fairwaysPct,
      scoring,
    };
  }, [round]);

  const lastOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    return orders[0];
  }, [orders]);

  const onShare = async () => {
    if (!summary) return;
    const courseName = round?.course.name === 'Augusta National Golf Club' ? 'Padang Golf Sulaiman' : (round?.course.name ?? '');
    const message = [
      `Round Summary`,
      `Score: ${summary.totalStrokes}`,
      courseName,
      `GIR ${summary.girPct}% | Fairways ${summary.fairwaysPct}% | Putts ${summary.putts}`,
    ]
      .filter(Boolean)
      .join('\n');
    try {
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Share failed', 'Unable to open share sheet.');
    }
  };

  if (isLoading || !round || !summary) {
    return (
      <ScreenWrapper style={styles.screen} edges={['top', 'bottom']}>
        <SummarySkeleton />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable 
          onPress={() => navigation.popToTop()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Round Summary</Text>
        <Pressable 
          onPress={() => void onShare()}
          style={styles.shareButton}
        >
          <Ionicons name="share-social-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, centeredContainerStyle]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <View style={styles.heroCircle}>
            {round.course.imageUrl ? (
              <Image source={{ uri: round.course.imageUrl }} style={styles.heroImage} />
            ) : (
              <Ionicons name="image-outline" size={40} color={colors.textMuted} />
            )}
          </View>
          <Text style={styles.scoreText}>{summary.totalStrokes}</Text>
          <Text style={styles.courseText}>
            {round.course.name === 'Augusta National Golf Club' ? 'Padang Golf Sulaiman' : round.course.name}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>
              {new Date(round.updatedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeading, { fontSize: headingFontSize }]}>Scoring Breakdown</Text>
        </View>
        
        <View style={styles.chartCard}>
          {([
            { label: 'Birdies', value: summary.scoring.birdie, color: '#1DCB63' },
            { label: 'Pars', value: summary.scoring.par, color: '#2C7BE5' },
            { label: 'Bogeys', value: summary.scoring.bogey, color: '#F5A623' },
            { label: 'Double+', value: summary.scoring.double, color: '#E35157' },
          ] as const).map((item) => (
            <View key={item.label} style={styles.chartRow}>
              <View style={styles.chartLabelWrap}>
                <Text style={styles.chartLabel}>{item.label}</Text>
                <Text style={styles.chartValue}>{item.value}</Text>
              </View>
              <View style={styles.chartTrack}>
                <View 
                  style={[
                    styles.chartFill, 
                    { 
                      backgroundColor: item.color, 
                      width: `${(item.value / 18) * 100}%` 
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeading, { fontSize: headingFontSize }]}>Performance vs Average</Text>
        </View>

        <View style={styles.compareCard}>
          <View style={styles.compareRow}>
            <View>
              <Text style={styles.compareLabel}>Fairways Hit</Text>
              <Text style={styles.compareSub}>Season Avg: {seasonAverages.fairwaysPct}%</Text>
            </View>
            <View style={styles.compareValueWrap}>
              <Text style={styles.compareValue}>{summary.fairwaysPct}%</Text>
              <View style={[styles.deltaPill, summary.fairwaysPct >= seasonAverages.fairwaysPct ? styles.deltaUp : styles.deltaDown]}>
                <Ionicons 
                  name={summary.fairwaysPct >= seasonAverages.fairwaysPct ? 'caret-up' : 'caret-down'} 
                  size={12} 
                  color={summary.fairwaysPct >= seasonAverages.fairwaysPct ? '#1DCB63' : '#E35157'} 
                />
                <Text style={[styles.deltaText, { color: summary.fairwaysPct >= seasonAverages.fairwaysPct ? '#1DCB63' : '#E35157' }]}>
                  {Math.abs(summary.fairwaysPct - seasonAverages.fairwaysPct)}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.compareRow}>
            <View>
              <Text style={styles.compareLabel}>GIR</Text>
              <Text style={styles.compareSub}>Season Avg: {seasonAverages.girPct}%</Text>
            </View>
            <View style={styles.compareValueWrap}>
              <Text style={styles.compareValue}>{summary.girPct}%</Text>
              <View style={[styles.deltaPill, summary.girPct >= seasonAverages.girPct ? styles.deltaUp : styles.deltaDown]}>
                <Ionicons 
                  name={summary.girPct >= seasonAverages.girPct ? 'caret-up' : 'caret-down'} 
                  size={12} 
                  color={summary.girPct >= seasonAverages.girPct ? '#1DCB63' : '#E35157'} 
                />
                <Text style={[styles.deltaText, { color: summary.girPct >= seasonAverages.girPct ? '#1DCB63' : '#E35157' }]}>
                  {Math.abs(summary.girPct - seasonAverages.girPct)}%
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.compareRow, { borderBottomWidth: 0 }]}>
            <View>
              <Text style={styles.compareLabel}>Putts</Text>
              <Text style={styles.compareSub}>Season Avg: {seasonAverages.putts}</Text>
            </View>
            <View style={styles.compareValueWrap}>
              <Text style={styles.compareValue}>{summary.putts}</Text>
              <View style={[styles.deltaPill, summary.putts <= seasonAverages.putts ? styles.deltaUp : styles.deltaDown]}>
                <Ionicons 
                  name={summary.putts <= seasonAverages.putts ? 'caret-up' : 'caret-down'} 
                  size={12} 
                  color={summary.putts <= seasonAverages.putts ? '#1DCB63' : '#E35157'} 
                />
                <Text style={[styles.deltaText, { color: summary.putts <= seasonAverages.putts ? '#1DCB63' : '#E35157' }]}>
                  {Math.abs(summary.putts - seasonAverages.putts).toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeading, { fontSize: headingFontSize }]}>Round Stats</Text>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Avg. Driving Distance</Text>
            <Text style={styles.listValue}>284 yds</Text>
          </View>
          <View style={styles.listRow}>
            <Text style={styles.listLabel}>Putts per Round</Text>
            <Text style={styles.listValue}>{summary.putts}</Text>
          </View>
          <View style={[styles.listRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.listLabel}>Sand Saves</Text>
            <Text style={styles.listValue}>2/3</Text>
          </View>
        </View>

        {lastOrder ? (
          <View style={styles.reorderCard}>
            <View style={styles.reorderIconWrap}>
              <Ionicons name="fast-food" size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.reorderTitle, { fontSize: reorderTitleFontSize, lineHeight: reorderTitleLineHeight }]}>
              Miss those refreshments?
            </Text>
            <Text style={styles.reorderSub}>
              You ordered {lastOrder.items.length} items on hole {lastOrder.holeNumber ?? '?'}.
            </Text>
            <PrimaryButton
              label="REORDER FOR NEXT ROUND"
              onPress={() => navigation.navigate('Tabs', { screen: 'Order' })}
              style={styles.reorderBtn}
              textStyle={styles.reorderBtnText}
            />
          </View>
        ) : (
          <View style={[styles.reorderCard, styles.reorderCardAlt]}>
            <View style={[styles.reorderIconWrap, { backgroundColor: '#E8F5EE' }]}>
              <Ionicons name="golf" size={32} color={colors.primaryDark} />
            </View>
            <Text style={[styles.reorderTitle, styles.reorderTitleAlt, { fontSize: reorderTitleFontSize * 0.8, lineHeight: reorderTitleLineHeight * 0.8 }]}>
              Ready for the next round?
            </Text>
            <Text style={[styles.reorderSub, styles.reorderSubAlt]}>
              Order food and drinks for your next tee time directly in the app.
            </Text>
            <PrimaryButton
              label="VIEW MENU"
              onPress={() => navigation.navigate('Tabs', { screen: 'Order' })}
              style={styles.reorderBtnAlt}
              textStyle={{ color: '#06210E' }}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <SecondaryButton
          label="RETURN TO HOME"
          onPress={() => navigation.popToTop()}
        />
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
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  heroWrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  heroCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E8F5EE',
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  scoreText: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 80,
  },
  courseText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
    textAlign: 'center',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 15,
  },
  sectionHeader: {
    marginBottom: -spacing.sm,
  },
  sectionHeading: {
    color: colors.text,
    fontWeight: '900',
  },
  chartCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  chartRow: {
    gap: 10,
  },
  chartLabelWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  chartValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  chartTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F2',
    overflow: 'hidden',
  },
  chartFill: {
    height: '100%',
    borderRadius: 6,
  },
  compareCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  compareRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  compareLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  compareSub: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 4,
  },
  compareValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compareValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
  },
  deltaPill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8F9F8',
  },
  deltaUp: {
    backgroundColor: '#F0FAF3',
  },
  deltaDown: {
    backgroundColor: '#FEF2F2',
  },
  deltaText: {
    fontSize: 13,
    fontWeight: '900',
  },
  listCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  listRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listLabel: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  listValue: {
    fontSize: 22,
    color: colors.text,
    fontWeight: '900',
  },
  reorderCard: {
    borderRadius: 28,
    backgroundColor: colors.primaryDark,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
  },
  reorderCardAlt: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reorderIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  reorderTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },
  reorderTitleAlt: {
    color: colors.text,
  },
  reorderSub: {
    fontSize: 18,
    color: '#B8CFC1',
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
  },
  reorderSubAlt: {
    color: colors.textMuted,
  },
  reorderBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    marginTop: spacing.sm,
  },
  reorderBtnAlt: {
    backgroundColor: colors.primary,
    width: '100%',
    marginTop: spacing.sm,
  },
  reorderBtnText: {
    color: '#06210E',
    fontWeight: '900',
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
