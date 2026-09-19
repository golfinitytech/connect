import { Pressable, StyleSheet, Text, View, ScrollView, Platform, Linking, Image, Modal, FlatList, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useMe, useUpdateUser, useUpdateUserPreferences, useUserPreferences } from '../api/hooks';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { Logo } from '../components/Logo';
import { CircleSkeleton, RectSkeleton } from '../components/Skeleton';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useState } from 'react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useBlurOnModal } from '../hooks/useBlurOnModal';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const ProfileSkeleton = () => (
  <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
    <View style={styles.headerRow}>
      <RectSkeleton width={120} height={32} />
      <CircleSkeleton width={44} height={44} />
    </View>

    <View style={styles.profileHeaderSection}>
      <View style={styles.avatarContainer}>
        <CircleSkeleton width={100} height={100} />
        <RectSkeleton width={150} height={24} style={{ marginTop: spacing.md, marginBottom: spacing.xs }} />
        <RectSkeleton width={80} height={16} />
      </View>
    </View>

    <View style={styles.section}>
      <RectSkeleton width={100} height={13} style={{ marginBottom: spacing.sm, marginLeft: spacing.xs }} />
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <RectSkeleton width={44} height={44} borderRadius={12} style={{ marginRight: spacing.md }} />
          <View>
            <RectSkeleton width={80} height={12} style={{ marginBottom: 4 }} />
            <RectSkeleton width={120} height={18} />
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <RectSkeleton width={44} height={44} borderRadius={12} style={{ marginRight: spacing.md }} />
          <View>
            <RectSkeleton width={80} height={12} style={{ marginBottom: 4 }} />
            <RectSkeleton width={120} height={18} />
          </View>
        </View>
      </View>
    </View>
  </ScrollView>
);

const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/7.x/rings/png?seed=Felix',
  'https://api.dicebear.com/7.x/rings/png?seed=Aneka',
  'https://api.dicebear.com/7.x/rings/png?seed=Jude',
  'https://api.dicebear.com/7.x/rings/png?seed=Kelly',
  'https://api.dicebear.com/7.x/rings/png?seed=Charlie',
  'https://api.dicebear.com/7.x/rings/png?seed=Garrett',
  'https://api.dicebear.com/7.x/rings/png?seed=Sasha',
  'https://api.dicebear.com/7.x/rings/png?seed=Eden',
  'https://api.dicebear.com/7.x/rings/png?seed=Jordan',
];

export function ProfileScreen() {
  const { centeredContainerStyle } = useResponsiveLayout({ maxWidth: 980 });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [editName, setEditName] = useState('');
  
  const { data: me, isLoading } = useMe();
  const { data: preferences, isLoading: preferencesLoading, refetch } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const updateUser = useUpdateUser();
  const { logout } = useAuth();
  
  useBlurOnModal(showLogoutConfirm || showAvatarOptions || showAvatarSelection || showNameEdit);

  const isLoadingAny = isLoading || preferencesLoading;

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleOpenNameEdit = () => {
    setEditName(me?.fullName || '');
    setShowNameEdit(true);
  };

  const handleSaveName = () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    updateUser.mutate({ fullName: editName.trim() }, {
      onSuccess: () => {
        setShowNameEdit(false);
      },
      onError: () => {
        Alert.alert('Error', 'Failed to update name');
      }
    });
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateUser.mutate({ avatarUrl: result.assets[0].uri });
      setShowAvatarOptions(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateUser.mutate({ avatarUrl: result.assets[0].uri });
      setShowAvatarOptions(false);
    }
  };

  const handleSelectAvatar = (url: string) => {
    updateUser.mutate({ avatarUrl: url });
    setShowAvatarSelection(false);
    setShowAvatarOptions(false);
  };

  const notificationsEnabled = preferences?.notificationsEnabled ?? true;
  const marketingEmails = preferences?.marketingEmails ?? false;
  const privacyMode = preferences?.privacyMode ?? 'MEMBERS_ONLY';

  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      {isLoadingAny ? (
        <ProfileSkeleton />
      ) : (
        <ScrollView contentContainerStyle={[styles.scrollContent, centeredContainerStyle]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Settings</Text>
          <Pressable 
            style={styles.refreshButton}
            onPress={() => void refetch()}
          >
            <Ionicons name="refresh" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.profileHeaderSection}>
          <View style={styles.avatarContainer}>
            <Pressable style={styles.avatarWrapper} onPress={() => setShowAvatarOptions(true)}>
              {me?.avatarUrl ? (
                <Image source={{ uri: me.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={44} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </View>
            </Pressable>
            <View style={styles.profileTextWrapper}>
              <Text style={styles.profileName}>{me?.fullName}</Text>
              <View style={styles.memberBadge}>
                <Text style={styles.memberBadgeText}>{me?.memberId}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account Info</Text>
          <View style={styles.card}>
            <Pressable 
              style={({ pressed }) => [
                styles.infoRow,
                pressed && { backgroundColor: '#F8FBF9' }
              ]} 
              onPress={handleOpenNameEdit}
            >
              <View style={styles.infoIcon}>
                <Ionicons name="person-circle-outline" size={24} color={colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Member Name</Text>
                <Text style={styles.value}>{me?.fullName || 'N/A'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="id-card-outline" size={24} color={colors.primaryDark} />
              </View>
              <View>
                <Text style={styles.label}>Member ID</Text>
                <Text style={styles.value}>{me?.memberId || '#0000'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Golf Profile</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="golf-outline" size={24} color={colors.primaryDark} />
              </View>
              <View>
                <Text style={styles.label}>Handicap Index</Text>
                <Text style={styles.value}>{me?.handicapIndex ?? '--'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.preferenceHeaderRow}>
            <Text style={styles.sectionLabel}>Preferences</Text>
            {preferencesLoading && <RectSkeleton width={40} height={14} borderRadius={4} />}
          </View>
          
          <View style={styles.card}>
            <View style={styles.preferenceRow}>
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Notifications</Text>
                <Text style={styles.preferenceSub}>Score updates and alerts</Text>
              </View>
              <Pressable
                style={[styles.toggle, notificationsEnabled && styles.toggleActive]}
                onPress={() =>
                  updatePreferences.mutate({ notificationsEnabled: !notificationsEnabled })
                }
              >
                <View style={[styles.toggleKnob, notificationsEnabled && styles.toggleKnobActive]} />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Marketing emails</Text>
                <Text style={styles.preferenceSub}>Club news and offers</Text>
              </View>
              <Pressable
                style={[styles.toggle, marketingEmails && styles.toggleActive]}
                onPress={() => updatePreferences.mutate({ marketingEmails: !marketingEmails })}
              >
                <View style={[styles.toggleKnob, marketingEmails && styles.toggleKnobActive]} />
              </Pressable>
            </View>

            <View style={styles.divider} />

            <View style={styles.preferenceBlock}>
              <Text style={styles.preferenceTitle}>Privacy Mode</Text>
              <View style={styles.privacyRow}>
                {(['PUBLIC', 'MEMBERS_ONLY', 'PRIVATE'] as const).map((mode) => {
                  const active = privacyMode === mode;
                  return (
                    <Pressable
                      key={mode}
                      style={[styles.privacyPill, active && styles.privacyPillActive]}
                      onPress={() => updatePreferences.mutate({ privacyMode: mode })}
                    >
                      <Text style={[styles.privacyText, active && styles.privacyTextActive]}>
                        {mode === 'MEMBERS_ONLY' ? 'Members' : mode === 'PUBLIC' ? 'Public' : 'Private'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support</Text>
          <Pressable 
            style={styles.card}
            onPress={() => Linking.openURL('tel:+15550101188')}
          >
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="call-outline" size={24} color={colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.preferenceTitle}>Call Pro Shop</Text>
                <Text style={styles.preferenceSub}>For immediate assistance on the course</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </Pressable>
        </View>
        
        <View style={styles.footer}>
          <Logo size={48} showText />
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <SecondaryButton 
            label="Logout" 
            onPress={handleLogout} 
            style={styles.logoutButton}
            textStyle={styles.logoutText}
          />
        </View>
      </ScrollView>
    )}

    <Modal
          visible={showNameEdit}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNameEdit(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Member Name</Text>
                <Pressable onPress={() => setShowNameEdit(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  autoCapitalize="words"
                />
              </View>

              <PrimaryButton 
                label="Save Changes" 
                onPress={handleSaveName}
                loading={updateUser.isPending}
                style={{ marginTop: spacing.lg }}
              />
            </View>
          </View>
        </Modal>

        <ConfirmationModal
          visible={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          void logout();
          setShowLogoutConfirm(false);
        }}
        title="Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your account."
        confirmLabel="Logout"
        cancelLabel="Stay logged in"
        type="danger"
        icon="log-out"
      />

      {/* Avatar Options Modal */}
      <Modal
        visible={showAvatarOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarOptions(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowAvatarOptions(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Profile Photo</Text>
              <Pressable onPress={() => setShowAvatarOptions(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            
            <View style={styles.optionList}>
              <Pressable style={styles.optionItem} onPress={handleTakePhoto}>
                <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="camera" size={24} color="#1976D2" />
                </View>
                <Text style={styles.optionText}>Take Photo</Text>
              </Pressable>
              
              <Pressable style={styles.optionItem} onPress={handlePickImage}>
                <View style={[styles.optionIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Ionicons name="image" size={24} color="#7B1FA2" />
                </View>
                <Text style={styles.optionText}>Choose from Gallery</Text>
              </Pressable>
              
              <Pressable style={styles.optionItem} onPress={() => setShowAvatarSelection(true)}>
                <View style={[styles.optionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="happy" size={24} color="#388E3C" />
                </View>
                <Text style={styles.optionText}>Select Avatar</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Avatar Selection Modal */}
      <Modal
        visible={showAvatarSelection}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAvatarSelection(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose an Avatar</Text>
              <Pressable onPress={() => setShowAvatarSelection(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            
            <FlatList
              data={PREDEFINED_AVATARS}
              numColumns={3}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.avatarItem} 
                  onPress={() => handleSelectAvatar(item)}
                >
                  <View style={styles.avatarItemInner}>
                    <Image source={{ uri: item }} style={styles.avatarSelectionImage} />
                  </View>
                </Pressable>
              )}
              contentContainerStyle={styles.avatarList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  preferenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    opacity: 0.6,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  preferenceText: {
    flex: 1,
    marginRight: spacing.md,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  preferenceSub: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  preferenceBlock: {
    paddingVertical: spacing.xs,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5EDE9',
    padding: 3,
  },
  toggleActive: {
    backgroundColor: colors.primaryDark,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 2px 2px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  privacyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  privacyPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  privacyPillActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  privacyText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  privacyTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    width: '100%',
    zIndex: 1,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    width: '100%',
    alignSelf: 'stretch',
    borderColor: '#FFEDED',
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    color: '#E24B4B',
  },
  profileHeaderSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primaryDark,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  profileTextWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  memberBadge: {
    backgroundColor: '#F0F4F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2EAE5',
  },
  memberBadgeText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl * 2 : spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  optionList: {
    gap: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: '#F8FBF9',
    borderWidth: 1,
    borderColor: '#EEF4F1',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F7F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarList: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  avatarItem: {
    flex: 1/3,
    aspectRatio: 1,
    padding: spacing.xs,
  },
  avatarItemInner: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#F8FBF9',
    borderWidth: 1.5,
    borderColor: '#EEF4F1',
    overflow: 'hidden',
    padding: 2,
  },
  avatarSelectionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: '#F8FBF9',
    borderWidth: 1,
    borderColor: '#EEF4F1',
    borderRadius: 16,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
});
