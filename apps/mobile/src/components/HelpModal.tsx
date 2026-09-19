import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { useBlurOnModal } from '../hooks/useBlurOnModal';

const { width } = Dimensions.get('window');

export type HelpItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

type HelpModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: HelpItem[];
  showCallProShop?: boolean;
};

export function HelpModal({ visible, onClose, title, items, showCallProShop = true }: HelpModalProps) {
  useBlurOnModal(visible);
  
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
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="help-circle" size={32} color={colors.primaryDark} />
              </View>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeIconButton}
                hitSlop={15}
              >
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={styles.body}>
              {items.map((item, index) => (
                <View key={index} style={styles.helpItem}>
                  <View style={styles.itemIconContainer}>
                    <Ionicons name={item.icon} size={22} color={colors.primaryDark} />
                  </View>
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              {showCallProShop && (
                <SecondaryButton
                  label="Call Pro Shop for Assistance"
                  onPress={() => Linking.openURL('tel:+15550101188')}
                  style={styles.callButton}
                  textStyle={styles.callButtonText}
                />
              )}
              <PrimaryButton 
                label="Got it" 
                onPress={onClose} 
                style={styles.button}
              />
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
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 20px 0px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F0FAF3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  closeIconButton: {
    padding: 4,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0FAF3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.sm,
  },
  callButton: {
    borderColor: '#E3EDE8',
    backgroundColor: '#F0FAF3',
    marginBottom: spacing.xs,
  },
  callButtonText: {
    color: colors.primaryDark,
  },
  button: {
    width: '100%',
  },
});
