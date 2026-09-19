import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinishRound, useRound } from '../api/hooks';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const ScorecardSkeleton = () => (
  <View style={{ flex: 1, padding: spacing.lg }}>
    <View style={styles.topBar}>
      <CircleSkeleton width={32} height={32} />
      <RectSkeleton width={120} height={24} />
      <View style={{ width: 32 }} />
    </View>

    <View style={styles.toggleWrap}>
      <RectSkeleton width={100} height={36} borderRadius={18} style={{ marginRight: 12 }} />
      <RectSkeleton width={100} height={36} borderRadius={18} />
    </View>

    <View style={styles.tableWrap}>
      <View style={styles.headerRow}>
        <RectSkeleton width={60} height={20} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <RectSkeleton key={i} width={40} height={20} />
          ))}
        </View>
      </View>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <View key={i} style={styles.dataRow}>
          <RectSkeleton width={40} height={16} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[1, 2, 3].map((j) => (
              <RectSkeleton key={j} width={40} height={16} />
            ))}
          </View>
        </View>
      ))}
    </View>
  </View>
);

type Props = NativeStackScreenProps<RootStackParamList, 'Scorecard'>;

export function ScorecardScreen({ route, navigation }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const { centeredContainerStyle } = useResponsiveLayout({ maxWidth: 1400 });
  const { roundId } = route.params;
  const { data: round, isLoading } = useRound(roundId);
  const finishRound = useFinishRound();
  const [segment, setSegment] = useState<'FRONT' | 'BACK'>('FRONT');
  const [scoreMode, setScoreMode] = useState<'GROSS' | 'NET'>('GROSS');

  const playerSummaries = useMemo(() => {
    if (!round?.players) {
      return [];
    }

    return round.players.map((player) => {
      const scores = (round.holeScores ?? []).filter((score) => score.userId === player.userId);
      
      const calculateTotal = (holeScores: typeof scores) => {
        return holeScores.reduce((sum, score) => {
          const strokes = scoreMode === 'GROSS' 
            ? score.strokes 
            : netStrokes(score.strokes, score.hole?.number ?? 0, score.user?.handicapIndex ?? 0);
          return sum + strokes;
        }, 0);
      };

      const front9Scores = scores.filter((score) => (score.hole?.number ?? 0) <= 9);
      const back9Scores = scores.filter((score) => (score.hole?.number ?? 0) > 9);

      const front9 = calculateTotal(front9Scores);
      const back9 = calculateTotal(back9Scores);
      const total = front9 + back9;

      return {
        id: player.userId,
        name: player.user.fullName,
        front9,
        back9,
        total,
      };
    });
  }, [round?.holeScores, round?.players, scoreMode]);

  const playerCount = playerSummaries.length;
  const tableMinWidth = 170 + playerCount * 130;
  const isScrollable = screenWidth < tableMinWidth;

  const holes = round?.course.holes ?? [];
  const visibleHoles = holes.filter((hole) => (segment === 'FRONT' ? hole.number <= 9 : hole.number > 9));

  const netStrokes = (strokes: number, holeNumber: number, handicapIndex: number) => {
    const handicap = Math.max(0, Math.round(handicapIndex));
    const base = Math.floor(handicap / 18);
    const extra = handicap % 18;
    const applied = base + (holeNumber <= extra ? 1 : 0);
    return Math.max(1, strokes - applied);
  };

  const onFinishRound = async () => {
    try {
      await finishRound.mutateAsync(roundId);
      Alert.alert('Round finished', 'Round has been marked as finished.');
      navigation.popToTop();
    } catch (error) {
      Alert.alert('Failed to finish round', String(error));
    }
  };

  if (isLoading || !round) {
    return (
      <ScreenWrapper style={styles.screen} edges={['top', 'bottom']}>
        <ScorecardSkeleton />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.screen} edges={['top', 'bottom']}>
      <View style={[styles.topBar, centeredContainerStyle]}>
        <Pressable 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.topInfo}>
          <Text style={styles.topTitle} numberOfLines={1}>{round.course.name}</Text>
          <Text style={styles.topSub}>
            {round.teeBox.name} • {round.gameMode.replace('_', ' ')}
          </Text>
        </View>
        <Pressable 
          onPress={() => navigation.replace('RoundScoring', { roundId })}
          style={styles.settingsButton}
        >
          <Ionicons name="options-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={[styles.toggleWrap, centeredContainerStyle]}>
        <View style={styles.segmentRow}>
          {(['FRONT', 'BACK'] as const).map((value) => (
            <Pressable
              key={value}
              style={[styles.segmentOption, segment === value && styles.segmentOptionActive]}
              onPress={() => setSegment(value)}
            >
              <Text style={[styles.segmentText, segment === value && styles.segmentTextActive]}>
                {value === 'FRONT' ? 'FRONT 9' : 'BACK 9'}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.segmentRow}>
          {(['GROSS', 'NET'] as const).map((value) => (
            <Pressable
              key={value}
              style={[styles.segmentOption, scoreMode === value && styles.segmentOptionActive]}
              onPress={() => setScoreMode(value)}
            >
              <Text style={[styles.segmentText, scoreMode === value && styles.segmentTextActive]}>
                {value} SCORE
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        horizontal={isScrollable}
        style={[styles.tableWrap, centeredContainerStyle]}
        contentContainerStyle={[!isScrollable && { flex: 1 }, { paddingBottom: spacing.lg }]}
        showsHorizontalScrollIndicator={false}
      >
        <View style={[styles.tableContainer, !isScrollable && { minWidth: '100%', flex: 1 }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.cell, styles.holeCellHeader, !isScrollable && { width: undefined, flex: 1.3 }]}>HOLE / PAR</Text>
            {playerSummaries.map((player) => (
              <Text key={player.id} style={[styles.cell, styles.playerHeader, !isScrollable && { width: undefined, flex: 1 }]} numberOfLines={1}>
                {player.name.split(' ')[0]}
              </Text>
            ))}
          </View>

          {visibleHoles.map((hole, index) => (
            <View 
              key={hole.id} 
              style={[
                styles.dataRow,
                index % 2 === 1 && { backgroundColor: '#F8FBF9' }
              ]}
            >
              <Text style={[styles.cell, styles.holeCell, !isScrollable && { width: undefined, flex: 1.3 }]}>
                {hole.number} <Text style={styles.parText}>({hole.par})</Text>
              </Text>
              {playerSummaries.map((player) => {
                const score = (round.holeScores ?? []).find(
                  (entry) => entry.userId === player.id && entry.hole?.number === hole.number,
                );
                return (
                  <Text key={`${hole.id}-${player.id}`} style={[styles.cell, !isScrollable && { width: undefined, flex: 1 }]}>
                    {score
                      ? scoreMode === 'GROSS'
                        ? score.strokes
                        : netStrokes(score.strokes, hole.number, score.user?.handicapIndex ?? 0)
                      : '-'}
                  </Text>
                );
              })}
            </View>
          ))}

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={[styles.cell, styles.holeCellSummary, !isScrollable && { width: undefined, flex: 1.3 }]}>FRONT 9</Text>
              {playerSummaries.map((player) => (
                <Text key={`front-${player.id}`} style={[styles.cell, styles.summaryValue, !isScrollable && { width: undefined, flex: 1 }]}>
                  {player.front9 || '-'}
                </Text>
              ))}
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.cell, styles.holeCellSummary, !isScrollable && { width: undefined, flex: 1.3 }]}>BACK 9</Text>
              {playerSummaries.map((player) => (
                <Text key={`back-${player.id}`} style={[styles.cell, styles.summaryValue, !isScrollable && { width: undefined, flex: 1 }]}>
                  {player.back9 || '-'}
                </Text>
              ))}
            </View>

            <View style={styles.summaryRowTotal}>
              <Text style={[styles.cell, styles.holeCellSummary, !isScrollable && { width: undefined, flex: 1.3 }]}>TOTAL</Text>
              {playerSummaries.map((player) => (
                <Text key={`total-${player.id}`} style={[styles.cell, styles.totalValue, !isScrollable && { width: undefined, flex: 1 }]}>
                  {player.total || '-'}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.orderCard}>
        <View style={styles.orderIconWrap}>
          <Ionicons name="fast-food" size={24} color={colors.primaryDark} />
        </View>
        <View style={styles.orderTextWrap}>
          <Text style={styles.orderTitle}>Turn House Ordering</Text>
          <Text style={styles.orderSub}>Menu available for 9th hole pickup</Text>
        </View>
        <Pressable style={styles.orderCta} onPress={() => navigation.navigate('Tabs', { screen: 'Order' })}>
          <Ionicons name="arrow-forward" size={20} color="#000000" />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.replace('RoundSummary', { roundId })}
        >
          <Text style={styles.secondaryText}>STATS</Text>
        </Pressable>
        <Pressable
          style={styles.primaryButton}
          onPress={() => void onFinishRound()}
          disabled={finishRound.isPending}
        >
          <Text style={styles.primaryText}>
            {finishRound.isPending ? 'FINISHING...' : 'FINISH ROUND'}
          </Text>
        </Pressable>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  topSub: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleWrap: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentOption: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F0F4F2',
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentOptionActive: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: `0px 2px 4px 0px ${colors.primary}1A`,
      },
    }),
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  segmentTextActive: {
    color: colors.primaryDark,
  },
  tableWrap: {
    flex: 1,
  },
  tableContainer: {
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    backgroundColor: '#F0F4F2',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  summarySection: {
    marginTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#F0F4F2',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#E8F2ED',
  },
  cell: {
    width: 130,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  holeCellHeader: {
    width: 170,
    textAlign: 'left',
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    paddingLeft: spacing.md,
  },
  playerHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  holeCell: {
    width: 170,
    textAlign: 'left',
    color: colors.text,
    fontWeight: '800',
    paddingLeft: spacing.md,
  },
  parText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  holeCellSummary: {
    width: 170,
    textAlign: 'left',
    color: colors.text,
    fontWeight: '900',
    paddingLeft: spacing.md,
  },
  summaryValue: {
    color: colors.primaryDark,
    fontWeight: '900',
  },
  totalValue: {
    color: colors.text,
    fontWeight: '900',
  },
  orderCard: {
    margin: spacing.md,
    borderRadius: 16,
    backgroundColor: '#1A1F1C',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orderIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTextWrap: {
    flex: 1,
    gap: 2,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  orderSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0A8A4',
  },
  orderCta: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 0 : spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryButton: {
    width: 100,
    borderRadius: 16,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
});
