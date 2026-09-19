import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { useBlurOnModal } from '../hooks/useBlurOnModal';

type Props = {
  visible: boolean;
  onClose: () => void;
  showResume?: boolean;
  onResume?: () => void;
  onStartNew?: () => void;
  onLive: () => void;
  onPost: () => void;
};

export function RecordScoreModal({
  visible,
  onClose,
  showResume = false,
  onResume,
  onStartNew,
  onLive,
  onPost,
}: Props) {
  useBlurOnModal(visible);

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.content} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="create" size={28} color={colors.primaryDark} />
              </View>
              <Text style={styles.title}>Record Your Score</Text>
              <Text style={styles.subtitle}>Pilih metode input score:</Text>
            </View>

            <View style={styles.body}>
              {showResume ? (
                <Pressable
                  style={({ pressed }) => [styles.option, styles.optionPrimary, pressed && styles.optionPressed]}
                  onPress={() => {
                    onResume?.();
                    onClose();
                  }}
                >
                  <Ionicons name="play" size={18} color="#000000" />
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitlePrimary}>Lanjutkan round</Text>
                    <Text style={styles.optionSubPrimary}>Kembali ke scoring round yang sedang berjalan</Text>
                  </View>
                </Pressable>
              ) : null}

              {showResume ? (
                <Pressable
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  onPress={() => {
                    onStartNew?.();
                    onClose();
                  }}
                >
                  <Ionicons name="add-circle" size={18} color={colors.primaryDark} />
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitle}>Mulai round baru</Text>
                    <Text style={styles.optionSub}>Start round baru dari awal</Text>
                  </View>
                </Pressable>
              ) : null}

              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => {
                  onLive();
                  onClose();
                }}
              >
                <Ionicons name="walk" size={18} color={colors.primaryDark} />
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>Sambil bermain</Text>
                  <Text style={styles.optionSub}>Input per hole, dengan bantuan GPS</Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => {
                  onPost();
                  onClose();
                }}
              >
                <Ionicons name="document-text" size={18} color={colors.primaryDark} />
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>Setelah bermain</Text>
                  <Text style={styles.optionSub}>Input setelah selesai bermain (manual pilih hole)</Text>
                </View>
              </Pressable>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Batal</Text>
            </Pressable>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  header: {
    gap: 6,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4EE',
    borderWidth: 1,
    borderColor: 'rgba(19,95,60,0.25)',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  body: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  optionPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  optionTextWrap: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  optionSub: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    lineHeight: 16,
  },
  optionTitlePrimary: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
  },
  optionSubPrimary: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.72)',
    lineHeight: 16,
  },
  closeBtn: {
    marginTop: spacing.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textMuted,
  },
});
