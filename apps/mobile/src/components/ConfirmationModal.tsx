import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { useBlurOnModal } from '../hooks/useBlurOnModal';

const { width } = Dimensions.get('window');

type ConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'default' | 'danger' | 'info';
  icon?: keyof typeof Ionicons.glyphMap;
  showCancel?: boolean;
};

export function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'default',
  icon,
  showCancel = true,
}: ConfirmationModalProps) {
  useBlurOnModal(visible);
  
  const iconName = icon || (type === 'danger' ? 'warning' : type === 'info' ? 'information-circle' : 'help-circle');
  const iconColor = type === 'danger' ? colors.danger : type === 'info' ? '#3B82F6' : colors.primaryDark;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()} 
            style={styles.content}
          >
            {/* Icon & Title */}
            <View style={styles.header}>
              <View style={[
                styles.iconContainer, 
                type === 'danger' && styles.iconContainerDanger,
                type === 'info' && styles.iconContainerInfo,
              ]}>
                <Ionicons name={iconName} size={36} color={iconColor} />
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            {/* Actions */}
            <View style={styles.footer}>
              <PrimaryButton 
                label={confirmLabel} 
                onPress={() => {
                  onConfirm();
                  onClose();
                }} 
                style={[
                  styles.button, 
                  type === 'danger' && { 
                    backgroundColor: colors.danger,
                    ...Platform.select({
                      ios: {
                        shadowOpacity: 0,
                      },
                      android: {
                        elevation: 0,
                      },
                      web: {
                        boxShadow: 'none',
                      },
                    }),
                  }
                ]}
                textStyle={type === 'danger' ? { color: '#FFFFFF' } : undefined}
              />
              {showCancel && (
                <SecondaryButton 
                  label={cancelLabel} 
                  onPress={onClose} 
                  style={styles.secondaryButton}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 20px 0px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainerDanger: {
    backgroundColor: '#FEF2F2',
  },
  iconContainerInfo: {
    backgroundColor: '#EFF6FF',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
    borderWidth: 0, // Making it look more like a text button but keeping the secondary button feel
  },
});
