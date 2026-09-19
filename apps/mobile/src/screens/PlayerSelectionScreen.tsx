import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useCourses, useCreateRound, useUsers } from '../api/hooks';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { useRoundStore } from '../store/roundStore';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const PlayerSelectionSkeleton = () => (
  <View style={{ flex: 1, padding: spacing.lg }}>
    <View style={styles.searchRow}>
      <RectSkeleton width="85%" height={48} borderRadius={12} />
      <CircleSkeleton width={48} height={48} />
    </View>

    <View style={styles.sectionHeader}>
      <RectSkeleton width={120} height={18} />
      <RectSkeleton width={60} height={18} />
    </View>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedList}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.selectedItem}>
          <CircleSkeleton width={60} height={60} />
          <RectSkeleton width={50} height={12} style={{ marginTop: 8 }} />
        </View>
      ))}
    </ScrollView>

    <View style={styles.sectionHeader}>
      <RectSkeleton width={100} height={18} />
    </View>

    <View style={styles.playerList}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.playerItem}>
          <CircleSkeleton width={44} height={44} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <RectSkeleton width={150} height={16} style={{ marginBottom: 4 }} />
            <RectSkeleton width={100} height={12} />
          </View>
          <CircleSkeleton width={24} height={24} />
        </View>
      ))}
    </View>
  </View>
);

type Props = NativeStackScreenProps<RootStackParamList, 'PlayerSelection'>;

export function PlayerSelectionScreen({ navigation, route }: Props) {
  const { centeredContainerStyle } = useResponsiveLayout({ maxWidth: 980 });
  const recordMode = route.params?.recordMode ?? 'LIVE';
  const [search, setSearch] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { data: users, isLoading: usersLoading } = useUsers(search);
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const createRound = useCreateRound();
  
  const {
    selectedCourseId,
    selectedTeeBoxId,
    gameMode,
    selectedPlayerIds,
    togglePlayer,
    reset,
  } = useRoundStore();

  const selectedCourse = useMemo(
    () => courses?.find(c => c.id === selectedCourseId),
    [courses, selectedCourseId]
  );

  const isLoading = usersLoading || coursesLoading;

  const selectedCount = selectedPlayerIds.length;

  const selectedUsers = useMemo(
    () => (users ?? []).filter((user) => selectedPlayerIds.includes(user.id)),
    [users, selectedPlayerIds],
  );

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera access required', 'Enable camera permission to scan player QR codes.');
        return;
      }
    }
    setScanned(false);
    setScannerVisible(true);
  };

  const resolveUser = (payload: string) => {
    if (!users) return null;
    const cleaned = payload.replace(/^(memberId|userId):/i, '').trim();
    let candidateIds = [payload, cleaned];
    try {
      const parsed = JSON.parse(payload);
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.memberId === 'string') candidateIds.push(parsed.memberId);
        if (typeof parsed.userId === 'string') candidateIds.push(parsed.userId);
        if (typeof parsed.id === 'string') candidateIds.push(parsed.id);
      }
    } catch (error) {
      candidateIds = candidateIds;
    }
    return users.find((user) => candidateIds.includes(user.memberId) || candidateIds.includes(user.id)) ?? null;
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    const matchedUser = resolveUser(result.data);
    if (!matchedUser) {
      Alert.alert('Player not found', 'No matching member was found for this QR code.');
      setScannerVisible(false);
      return;
    }
    const isSelected = selectedPlayerIds.includes(matchedUser.id);
    if (!isSelected && selectedPlayerIds.length >= 4) {
      Alert.alert('Flight is full', 'You already have 4 players selected.');
      setScannerVisible(false);
      return;
    }
    if (!isSelected) {
      togglePlayer(matchedUser.id);
    }
    setScannerVisible(false);
  };

  const onStartRound = async () => {
    if (!selectedCourseId || !selectedTeeBoxId) {
      Alert.alert('Missing setup', 'Please choose a course and tee box first.');
      navigation.navigate('NewRound');
      return;
    }

    if (selectedPlayerIds.length === 0) {
      Alert.alert('No players selected', 'Select at least one player.');
      return;
    }

    try {
      const createdRound = await createRound.mutateAsync({
        courseId: selectedCourseId,
        teeBoxId: selectedTeeBoxId,
        gameMode,
        playerIds: selectedPlayerIds,
      });

      reset();
      Alert.alert('Round started', 'Your round has started successfully.');
      navigation.replace('RoundScoring', { roundId: createdRound.id, recordMode });
    } catch (error) {
      Alert.alert('Failed to start round', String(error));
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={32} color="#101814" />
          </Pressable>
          <Text style={styles.topTitle}>Add Players</Text>
          <View style={{ width: 32 }} />
        </View>
        <PlayerSelectionSkeleton />
      </ScreenWrapper>
    );
  }

  if (scannerVisible) {
    return (
      <View style={styles.scannerScreen}>
        <CameraView
          style={styles.scannerCamera}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerHeader}>
            <Pressable onPress={() => setScannerVisible(false)} style={styles.scannerBack}>
              <Ionicons name="close" size={28} color="#F5FAF7" />
            </Pressable>
            <Text style={styles.scannerTitle}>Scan Player QR</Text>
            <View style={styles.scannerBack} />
          </View>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerHint}>Align the QR code within the frame</Text>
        </View>
      </View>
    );
  }

  return (
    <ScreenWrapper style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={32} color="#101814" />
        </Pressable>
        <Text style={styles.topTitle}>Player Selection</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{selectedCount} / 4 PLAYERS</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, centeredContainerStyle]}>
        <Text style={styles.buildText}>Build your flight</Text>
        <TextInput
          placeholder="Search by name or member ID"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#83958E"
        />
        <Pressable
          style={styles.scanButton}
          onPress={() => void openScanner()}
        >
          <Ionicons name="qr-code" size={22} color="#0A1F13" />
          <Text style={styles.scanText}>Scan Player QR</Text>
        </Pressable>

        <Text style={styles.sectionHeading}>Flight Members</Text>
        {selectedUsers.map((user) => (
          <View key={user.id} style={[styles.userCard, styles.userCardSelected]}>
            <View style={styles.avatarWrap}>
              {user.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatar} /> : null}
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userSub}>ID {user.memberId}</Text>
            </View>
            <Text style={styles.userHcp}>HCP {user.handicapIndex}</Text>
          </View>
        ))}
        {Array.from({ length: Math.max(0, 4 - selectedCount) }).map((_, index) => (
          <View key={`slot-${index}`} style={styles.emptySlot}>
            <View style={styles.emptyIcon}>
              <Ionicons name="person-add" size={22} color="#97A7A0" />
            </View>
            <View>
              <Text style={styles.emptyTitle}>Add Flight Member</Text>
              <Text style={styles.emptySub}>Slot Available</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionHeading}>Recent Partners</Text>
        {(users ?? []).map((user) => {
          const selected = selectedPlayerIds.includes(user.id);
          const full = selectedCount >= 4;
          const isCoreUser = user.id === 'user_alex';

          return (
            <Pressable
              key={user.id}
              style={[styles.userCard, selected && styles.userCardSelected]}
              onPress={() => {
                if (!selected && full) {
                  return;
                }
                togglePlayer(user.id);
              }}
            >
              <View style={styles.avatarWrap}>
                {user.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatar} /> : null}
              </View>
              <View style={styles.userMeta}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userSub}>
                  HCP {user.handicapIndex} • {user.memberId}
                  {isCoreUser ? ' (You)' : ''}
                </Text>
              </View>
              <View style={[styles.plusButton, selected && styles.plusButtonSelected]}>
                <Text style={styles.plusText}>{isCoreUser ? '•' : selected ? '✓' : '+'}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.courseHint}>ACTIVE COURSE</Text>
        <Text style={styles.courseHintSub}>
          {selectedCourse?.name ?? 'Loading...'} • {selectedCourse?.holes?.length ?? 18} Holes
        </Text>
        <PrimaryButton
          label={createRound.isPending ? 'Starting...' : 'Start Round'}
          onPress={onStartRound}
          size="large"
        />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scannerCamera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scannerBack: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTitle: {
    color: '#F2FBF7',
    fontSize: 20,
    fontWeight: '800',
  },
  scannerFrame: {
    alignSelf: 'center',
    width: 240,
    height: 240,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E7F4EC',
    backgroundColor: 'rgba(12, 24, 18, 0.2)',
  },
  scannerHint: {
    textAlign: 'center',
    color: '#E7F4EC',
    fontSize: 16,
    fontWeight: '600',
  },
  topBar: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topAction: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  topTitle: {
    fontSize: 20,
    color: colors.text,
    fontWeight: '800',
  },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#DDF4E3',
  },
  countText: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  content: {
    padding: spacing.md,
    gap: 12,
    paddingBottom: spacing.xl,
  },
  buildText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: '#E8EFEB',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 18,
    color: colors.text,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  scanText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A1F13',
  },
  sectionHeading: {
    marginTop: spacing.md,
    fontSize: 20,
    color: colors.text,
    fontWeight: '800',
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userCardSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: '#EFFAF2',
  },
  emptySlot: {
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D3DDD7',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F6FAF8',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#E6EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMuted,
  },
  emptySub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#97A7A0',
  },
  userMeta: {
    flex: 1,
    gap: 4,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#DDE9E3',
    marginRight: spacing.sm,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '800',
  },
  userSub: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  userHcp: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 18,
  },
  plusButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2EE',
  },
  plusButtonSelected: {
    backgroundColor: colors.primary,
  },
  plusText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D2314',
    lineHeight: 24,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#F7FBF9',
    padding: spacing.md,
    paddingBottom: spacing.md,
    gap: 6,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  selectedList: {
    marginBottom: spacing.lg,
  },
  selectedItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  playerList: {
    gap: 12,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  courseHint: {
    color: '#98A59E',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  courseHintSub: {
    color: '#1B231E',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
