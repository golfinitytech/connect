import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useRound, useUpdateHoleScore } from '../api/hooks';
import { HelpModal, HelpItem } from '../components/HelpModal';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { calculateDistance, findNearestHole } from '../utils/geo';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useBlurOnModal } from '../hooks/useBlurOnModal';

const ScoringSkeleton = () => (
  <View style={{ flex: 1, padding: spacing.lg }}>
    <View style={styles.topBar}>
      <CircleSkeleton width={40} height={40} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <RectSkeleton width={80} height={18} style={{ marginBottom: 4 }} />
        <RectSkeleton width={120} height={14} />
      </View>
      <CircleSkeleton width={40} height={40} />
    </View>

    <View style={styles.progressContainer}>
      <RectSkeleton width="100%" height={8} borderRadius={4} />
    </View>

    <View style={styles.scoringSection}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <RectSkeleton width={100} height={14} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <CircleSkeleton width={64} height={64} />
          <RectSkeleton width={60} height={72} />
          <CircleSkeleton width={64} height={64} />
        </View>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <RectSkeleton width={100} height={14} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <CircleSkeleton width={56} height={56} />
          <RectSkeleton width={40} height={48} />
          <CircleSkeleton width={56} height={56} />
        </View>
      </View>
    </View>

    <View style={styles.detailsSection}>
      <RectSkeleton width={120} height={14} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {[1, 2, 3].map((i) => (
          <RectSkeleton key={i} width="30%" height={48} borderRadius={12} />
        ))}
      </View>
    </View>

    <View style={{ marginTop: 'auto', marginBottom: 24 }}>
      <RectSkeleton width="100%" height={56} borderRadius={28} />
    </View>
  </View>
);

type Props = NativeStackScreenProps<RootStackParamList, 'RoundScoring'>;

type Fairway = 'LEFT' | 'CENTER' | 'RIGHT';

export function RoundScoringScreen({ route, navigation }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const { centeredContainerStyle } = useResponsiveLayout({ maxWidth: 1120 });
  const { roundId, recordMode = 'LIVE' } = route.params;
  const isPostMode = recordMode === 'POST';
  const { data: round, isLoading } = useRound(roundId);
  const updateScore = useUpdateHoleScore();

  const [holeNumber, setHoleNumber] = useState(1);
  const [strokes, setStrokes] = useState(4);
  const [putts, setPutts] = useState(2);
  const [fairwayHit, setFairwayHit] = useState<Fairway>('CENTER');
  const [gir, setGir] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState<Location.LocationHeadingObject | null>(null);
  const [suggestedHole, setSuggestedHole] = useState<number | null>(null);
  const [helpVisible, setHelpVisible] = useState(false);
  const [holePickerVisible, setHolePickerVisible] = useState(false);
  useBlurOnModal(holePickerVisible);

  const isSmallScreen = screenWidth < 380;
  const counterFontSize = isSmallScreen ? 56 : 72;
  const counterButtonSize = isSmallScreen ? 64 : 76;
  const counterButtonSymbolSize = isSmallScreen ? 40 : 48;

  useEffect(() => {
    let positionSubscription: Location.LocationSubscription | null = null;
    let headingSubscription: Location.LocationSubscription | null = null;

    (async () => {
      if (isPostMode) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      positionSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
        },
        (newLocation) => {
          setLocation(newLocation);
        },
      );

      headingSubscription = await Location.watchHeadingAsync((newHeading) => {
        setHeading(newHeading);
      });
    })();

    return () => {
      positionSubscription?.remove();
      headingSubscription?.remove();
    };
  }, [isPostMode]);

  const activePlayerId = round?.players?.[0]?.userId;
  const totalHoles = round?.course.totalHoles ?? 18;
  const progress = Math.min((holeNumber / totalHoles) * 100, 100);

  const currentHoleData = round?.course.holes?.find((h) => h.number === holeNumber);

  const distanceToPin = useMemo(() => {
    if (!location || !currentHoleData?.latitude || !currentHoleData?.longitude) return null;
    return calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      currentHoleData.latitude,
      currentHoleData.longitude,
    );
  }, [location, currentHoleData]);

  const animatedCompassStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${withSpring(heading?.trueHeading ?? 0, { damping: 20, stiffness: 90 })}deg` },
      ],
    };
  });

  // Auto-hole suggestion
  useEffect(() => {
    if (isPostMode) {
      setSuggestedHole(null);
      return;
    }
    if (location && round?.course?.holes) {
      const { hole, distance } = findNearestHole(
        location.coords.latitude,
        location.coords.longitude,
        round.course.holes
      );

      // If user is very close (within 30m) to a hole that is NOT the current one
      if (distance < 30 && hole.number !== holeNumber) {
        setSuggestedHole(hole.number);
      } else {
        setSuggestedHole(null);
      }
    }
  }, [isPostMode, location, round, holeNumber]);

  const currentHoleScore = useMemo(() => {
    if (!round?.holeScores || !activePlayerId) {
      return null;
    }
    return round.holeScores.find(
      (score) => score.userId === activePlayerId && score.hole?.number === holeNumber,
    );
  }, [activePlayerId, holeNumber, round?.holeScores]);

  useEffect(() => {
    if (currentHoleScore) {
      setStrokes(currentHoleScore.strokes);
      setPutts(currentHoleScore.putts);
      setFairwayHit(currentHoleScore.fairwayHit ?? 'CENTER');
      setGir(currentHoleScore.gir ?? true);
    } else {
      const par = round?.course.holes?.[holeNumber - 1]?.par ?? 4;
      setStrokes(par);
      setPutts(2);
      setFairwayHit('CENTER');
      setGir(true);
    }
  }, [currentHoleScore, holeNumber, round?.course.holes]);

  const saveAndMove = async (direction: 'next' | 'prev') => {
    if (!activePlayerId) {
      return;
    }

    await updateScore.mutateAsync({
      roundId,
      holeNumber,
      userId: activePlayerId,
      strokes,
      putts,
      fairwayHit,
      gir,
    });

    if (direction === 'next') {
      if (holeNumber < totalHoles) {
        setHoleNumber((current) => current + 1);
      } else {
        navigation.replace('Scorecard', { roundId });
      }
      return;
    }

    if (holeNumber > 1) {
      setHoleNumber((current) => current - 1);
    }
  };

  const helpItems: HelpItem[] = [
    {
      icon: 'golf',
      title: 'Total Strokes',
      description: 'Record every stroke taken on this hole until the ball is in the cup.',
    },
    {
      icon: 'radio-button-off',
      title: 'Putts',
      description: 'Count only the strokes made while the ball was on the green surface.',
    },
    {
      icon: 'navigate',
      title: 'Fairway Hit',
      description: 'Mark if your tee shot landed in the center, left, or right of the fairway.',
    },
    {
      icon: 'leaf',
      title: 'GIR',
      description: 'Green in Regulation: Check YES if you reached the green in (Par - 2) strokes.',
    },
  ];

  if (isLoading || !round) {
    return (
      <ScreenWrapper style={styles.screen} edges={['top']}>
        <ScoringSkeleton />
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
          <Pressable onPress={() => setHolePickerVisible(true)} hitSlop={10}>
            <Text style={styles.topTitle}>Hole {holeNumber}</Text>
          </Pressable>
          <Text style={styles.topSub}>
            PAR {currentHoleData?.par ?? '-'} • {currentHoleData?.lengthYds ?? '-'} YDS{isPostMode ? ' • After Play' : ''}
          </Text>
        </View>
        <View style={styles.topRight}>
          {isPostMode ? null : (
            <Animated.View style={[styles.compassIcon, animatedCompassStyle]}>
              <Ionicons name="compass" size={24} color={colors.primaryDark} />
            </Animated.View>
          )}
          <Pressable 
            onPress={() => setHelpVisible(true)}
            style={styles.helpButtonHeader}
            hitSlop={12}
          >
            <Ionicons name="help-circle-outline" size={26} color={colors.primaryDark} />
          </Pressable>
          <Pressable 
            onPress={() => navigation.replace('Scorecard', { roundId })}
            style={styles.scorecardButton}
          >
            <Ionicons name="grid-outline" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {!isPostMode && suggestedHole && (
        <Pressable
          style={[styles.suggestionBanner, centeredContainerStyle]}
          onPress={() => setHoleNumber(suggestedHole)}
        >
          <Ionicons name="location" size={18} color="#FFFFFF" />
          <Text style={styles.suggestionText}>
            You are near Hole {suggestedHole}. Tap to switch.
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </Pressable>
      )}

      <ScrollView contentContainerStyle={[styles.content, centeredContainerStyle]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerStats}>
          {isPostMode ? null : (
            <View style={styles.gpsCard}>
              <Ionicons name="location" size={20} color={colors.primaryDark} />
              <Text style={styles.gpsText}>
                {distanceToPin ? `${Math.round(distanceToPin)}m TO PIN` : 'GPS SIGNAL...'}
              </Text>
            </View>
          )}
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Round Progress</Text>
              <Text style={styles.progressValue}>{holeNumber} of {totalHoles}</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.scoringSection}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL STROKES</Text>
            <View style={styles.counterRow}>
              <Pressable
                style={[styles.counterButton, { width: counterButtonSize, height: counterButtonSize }]}
                onPress={() => setStrokes((value) => Math.max(1, value - 1))}
              >
                <Ionicons name="remove" size={counterButtonSymbolSize} color={colors.text} />
              </Pressable>
              <Text style={[styles.counterValue, { fontSize: counterFontSize }]}>{strokes}</Text>
              <Pressable
                style={[
                  styles.counterButton,
                  styles.counterButtonActive,
                  { width: counterButtonSize, height: counterButtonSize },
                ]}
                onPress={() => setStrokes((value) => value + 1)}
              >
                <Ionicons name="add" size={counterButtonSymbolSize} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>PUTTS</Text>
            <View style={styles.counterRow}>
              <Pressable
                style={[styles.counterButton, { width: counterButtonSize, height: counterButtonSize }]}
                onPress={() => setPutts((value) => Math.max(0, value - 1))}
              >
                <Ionicons name="remove" size={counterButtonSymbolSize} color={colors.text} />
              </Pressable>
              <Text style={[styles.counterValue, { fontSize: counterFontSize }]}>{putts}</Text>
              <Pressable
                style={[
                  styles.counterButton,
                  styles.counterButtonActive,
                  { width: counterButtonSize, height: counterButtonSize },
                ]}
                onPress={() => setPutts((value) => value + 1)}
              >
                <Ionicons name="add" size={counterButtonSymbolSize} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Text style={styles.sectionTitle}>FAIRWAY HIT</Text>
            <View style={styles.optionRow}>
              {(['LEFT', 'CENTER', 'RIGHT'] as Fairway[]).map((value) => {
                const selected = fairwayHit === value;
                return (
                  <Pressable
                    key={value}
                    style={[styles.segmentOption, selected && styles.segmentOptionActive]}
                    onPress={() => setFairwayHit(value)}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.sectionTitle}>GIR (GREEN IN REGULATION)</Text>
            <View style={styles.optionRow}>
              <Pressable
                style={[styles.segmentOption, gir && styles.segmentOptionActive]}
                onPress={() => setGir(true)}
              >
                <Text style={[styles.segmentText, gir && styles.segmentTextActive]}>YES</Text>
              </Pressable>
              <Pressable
                style={[styles.segmentOption, !gir && styles.segmentOptionActive]}
                onPress={() => setGir(false)}
              >
                <Text style={[styles.segmentText, !gir && styles.segmentTextActive]}>NO</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {currentHoleScore && (
          <View style={styles.savedDataCard}>
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primaryDark} />
              <Text style={styles.savedDataTitle}>Saved for this hole</Text>
            </View>
            <Text style={styles.savedDataText}>
              {currentHoleScore.strokes} strokes, {currentHoleScore.putts} putts
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isPostMode ? null : (
          <Pressable
            style={[styles.footerButton, styles.mapButton]}
            onPress={() => navigation.navigate('HoleMap', { roundId, holeNumber })}
          >
            <Ionicons name="map-outline" size={20} color="#FFFFFF" />
            <Text style={styles.mapButtonText}>Map</Text>
          </Pressable>
        )}
        
        <View style={styles.navButtons}>
          <Pressable
            style={[styles.navButton, styles.prevButton]}
            onPress={() => void saveAndMove('prev')}
            disabled={updateScore.isPending || holeNumber === 1}
          >
            <Ionicons name="chevron-back" size={24} color={holeNumber === 1 ? colors.textMuted : colors.text} />
          </Pressable>
          
          <Pressable
            style={[styles.navButton, styles.nextButton]}
            onPress={() => void saveAndMove('next')}
            disabled={updateScore.isPending}
          >
            <Text style={styles.nextButtonText}>
              {holeNumber === totalHoles ? 'FINISH' : 'NEXT HOLE'}
            </Text>
            <Ionicons 
              name={holeNumber === totalHoles ? "checkmark" : "chevron-forward"} 
              size={20} 
              color="#000000" 
            />
          </Pressable>
        </View>
      </View>
      <HelpModal 
        visible={helpVisible} 
        onClose={() => setHelpVisible(false)} 
        title="Scoring Help" 
        items={helpItems} 
      />
      <Modal animationType="fade" transparent={true} visible={holePickerVisible} onRequestClose={() => setHolePickerVisible(false)}>
        <TouchableOpacity style={styles.holePickerOverlay} activeOpacity={1} onPress={() => setHolePickerVisible(false)}>
          <View style={styles.holePickerContainer}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.holePickerContent}>
              <View style={styles.holePickerHeader}>
                <Text style={styles.holePickerTitle}>Pilih Hole</Text>
                <Pressable onPress={() => setHolePickerVisible(false)} hitSlop={14}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </Pressable>
              </View>
              <View style={styles.holeGrid}>
                {Array.from({ length: totalHoles }).map((_, idx) => {
                  const value = idx + 1;
                  const selected = value === holeNumber;
                  return (
                    <Pressable
                      key={value}
                      style={[styles.holeChip, selected && styles.holeChipSelected]}
                      onPress={() => {
                        setHoleNumber(value);
                        setHolePickerVisible(false);
                      }}
                    >
                      <Text style={[styles.holeChipText, selected && styles.holeChipTextSelected]}>{value}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  compassIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorecardButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionBanner: {
    backgroundColor: colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  suggestionText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    paddingBottom: spacing.xl,
  },
  headerStats: {
    padding: spacing.md,
    gap: spacing.md,
  },
  gpsCard: {
    backgroundColor: '#F0F4F2',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gpsText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  progressContainer: {
    gap: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F0F4F2',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  scoringSection: {
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  counterButton: {
    borderRadius: 20,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  counterValue: {
    fontWeight: '900',
    color: colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  detailsSection: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  detailItem: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    paddingLeft: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentOption: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F0F4F2',
    paddingVertical: 12,
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
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.primaryDark,
  },
  savedDataCard: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: '#F0FBF5',
    borderWidth: 1,
    borderColor: '#E0F2E9',
    alignItems: 'center',
    gap: 4,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedDataTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  savedDataText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    paddingVertical: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  mapButton: {
    width: 100,
    backgroundColor: '#1A1F1C',
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  navButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navButton: {
    borderRadius: 16,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  prevButton: {
    width: 60,
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  holePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  holePickerContainer: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  holePickerContent: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  holePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  holePickerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  holeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  holeChip: {
    width: '18%',
    minWidth: 52,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  holeChipText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  holeChipTextSelected: {
    color: '#000000',
  },
});
