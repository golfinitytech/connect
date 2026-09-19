import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { colors } from '../theme/colors';

const LANGUAGES: { code: Language; label: string; shortLabel: string }[] = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'id', label: 'Bahasa Indonesia', shortLabel: 'ID' },
  { code: 'zh', label: '中文 (Chinese)', shortLabel: 'ZH' },
  { code: 'ko', label: '한국어 (Korean)', shortLabel: 'KO' },
  { code: 'ja', label: '日本語 (Japanese)', shortLabel: 'JA' },
];

export const LanguagePicker: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = React.useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.trigger} 
        onPress={() => setVisible(true)}
      >
        <Text style={styles.label}>{currentLang.label}</Text>
        <Ionicons name="chevron-down" size={14} color="rgba(255, 255, 255, 0.7)" style={styles.chevron} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setVisible(false)}
        >
          <View style={[
            styles.modalContent, 
            { 
              marginTop: insets.top + 50, // Position below the trigger
              marginRight: 16 
            }
          ]}>
            {LANGUAGES.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.langItem,
                  item.code === language && styles.langItemActive
                ]}
                onPress={() => handleSelect(item.code)}
              >
                <Text style={[
                  styles.itemLabel,
                  item.code === language && styles.itemLabelActive
                ]}>
                  {item.label}
                </Text>
                {item.code === language && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  chevron: {
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'flex-end',
  },
  modalContent: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  langItemActive: {
    backgroundColor: 'rgba(7, 32, 22, 0.05)',
  },
  itemLabel: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  itemLabelActive: {
    color: '#072016',
    fontWeight: '700',
  },
});
