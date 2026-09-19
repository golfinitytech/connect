import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { PrimaryButton } from '../components/PrimaryButton';
import { Logo } from '../components/Logo';
import { RootStackParamList } from '../navigation/types';
import { apiClient } from '../api/client';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useLanguage } from '../context/LanguageContext';

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetRequest = async () => {
    if (!email) {
      Alert.alert('Error', t.forgotPassword.errorEmail);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post<{ message: string; token?: string }>('/auth/forgot-password', {
        email,
      });
      setIsSent(true);
      Alert.alert('Success', t.forgotPassword.sentSubtitle);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.bgContainer} pointerEvents="none">
        <LinearGradient
          colors={['#0B2A18', '#071E12', '#06160E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.bgOrbOne} />
        <View style={styles.bgOrbTwo} />
        <LinearGradient
          colors={['rgba(255,255,255,0.06)', 'rgba(0,0,0,0.0)', 'rgba(7, 32, 22, 0.75)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Logo size={40} />
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{t.forgotPassword.title}</Text>
              <Text style={styles.subtitle}>
                {isSent 
                  ? t.forgotPassword.sentSubtitle
                  : t.forgotPassword.subtitle}
              </Text>
            </View>

            {!isSent ? (
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t.forgotPassword.email}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="name@example.com"
                      placeholderTextColor={colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <PrimaryButton
                  label={t.forgotPassword.sendResetLink}
                  onPress={handleResetRequest}
                  loading={loading}
                  size="large"
                  style={styles.resetButton}
                />
              </View>
            ) : (
              <PrimaryButton
                label={t.forgotPassword.backToLogin}
                onPress={() => navigation.navigate('Login')}
                size="large"
                style={styles.resetButton}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06160E',
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#06160E',
    overflow: 'hidden',
  },
  bgOrbOne: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(22, 216, 78, 0.14)',
    top: -120,
    left: -140,
  },
  bgOrbTwo: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -180,
    right: -160,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xl * 2,
  },
  header: {
    marginBottom: spacing.xl * 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 24,
    fontWeight: '500',
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    height: 56,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  resetButton: {
    marginTop: spacing.md,
  },
});
