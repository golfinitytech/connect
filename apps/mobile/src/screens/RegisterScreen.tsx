import React, { useState, useEffect, memo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
 
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { PrimaryButton } from '../components/PrimaryButton';
import { Logo } from '../components/Logo';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { User } from '../api/types';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { CircleSkeleton } from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';
import { LanguagePicker } from '../components/LanguagePicker';

 

interface RegisterResponse {
  access_token: string;
  user: User;
}

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const AuthBackground = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.bgContainer}>
      <LinearGradient
        colors={['#0B2A18', '#071E12', '#06160E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.bgOrbOne} />
      <View style={styles.bgOrbTwo} />
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'rgba(0,0,0,0.0)', 'rgba(7, 32, 22, 0.85)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
});

// Memoized Header for performance - same as LoginScreen
const AuthHeader = memo(({ isSmall, title, subtitle }: { isSmall: boolean, title: string, subtitle: string }) => (
  <View style={styles.header}>
    <View style={styles.logoWrapper}>
      <Logo size={isSmall ? 70 : 90} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
));

export function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [memberId, setMemberId] = useState('');
  const [handicapIndex, setHandicapIndex] = useState('0');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = React.useRef<CameraView | null>(null);
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [faceHint, setFaceHint] = useState('Align your face inside the frame');
  const lastFaceEventAtRef = useRef(0);
  const goodSinceRef = useRef<number | null>(null);
  const CameraViewWithFaces = CameraView as unknown as React.ComponentType<any>;

 

 

 



  const openFaceModal = async () => {
    try {
      const res = await requestCameraPermission();
      if (!res?.granted) {
        Alert.alert('Permission Required', 'Enable camera access to use Face Recognition.');
        return;
      }
      goodSinceRef.current = null;
      setIsFaceAligned(false);
      setFaceHint('Align your face inside the frame');
      setCameraReady(false);
      setFaceModalVisible(true);
    } catch (e) {
      Alert.alert('Camera Error', (e as Error).message);
    }
  };

  const handleFaceCapture = async () => {
    if (!cameraRef.current || !cameraReady) return;
    if (!isFaceAligned) {
      Alert.alert('Face Not Ready', 'Align your face inside the frame first.');
      return;
    }
    setFaceLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
        skipProcessing: false,
      });
      if (!photo?.uri) {
        throw new Error('Failed to capture image');
      }

      const imgW = photo.width ?? 0;
      const imgH = photo.height ?? 0;
      const cropW = Math.max(1, Math.floor((imgW || 1080) * 0.72));
      const cropH = Math.max(1, Math.floor(cropW * 1.25));
      const originX = Math.max(0, Math.floor(((imgW || cropW) - cropW) / 2));
      const originY = Math.max(0, Math.floor(((imgH || cropH) - cropH) / 2 - cropH * 0.06));
      const width = imgW ? Math.min(imgW - originX, cropW) : cropW;
      const height = imgH ? Math.min(imgH - originY, cropH) : cropH;

      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          { crop: { originX, originY, width: Math.max(1, width), height: Math.max(1, height) } },
          { resize: { width: 520 } },
        ],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      );
      if (!cropped.base64) {
        throw new Error('Failed to process image');
      }

      setFaceImageBase64(`data:image/jpeg;base64,${cropped.base64}`);
      setFaceModalVisible(false);
    } catch (e) {
      Alert.alert('Face Capture Failed', (e as Error).message);
    } finally {
      setFaceLoading(false);
    }
  };

  const handleFacesDetected = (event: any) => {
    const now = Date.now();
    if (now - lastFaceEventAtRef.current < 120) return;
    lastFaceEventAtRef.current = now;

    const faces = event?.faces ?? event?.nativeEvent?.faces ?? [];
    if (!previewSize.width || !previewSize.height) {
      setIsFaceAligned(false);
      setFaceHint('Align your face inside the frame');
      return;
    }
    if (!faces.length) {
      goodSinceRef.current = null;
      setIsFaceAligned(false);
      setFaceHint('No face detected');
      return;
    }
    if (faces.length > 1) {
      goodSinceRef.current = null;
      setIsFaceAligned(false);
      setFaceHint('Only one face allowed');
      return;
    }

    const face = faces[0];
    const bounds = face?.bounds;
    if (!bounds?.origin || !bounds?.size) {
      goodSinceRef.current = null;
      setIsFaceAligned(false);
      setFaceHint('Align your face inside the frame');
      return;
    }

    const frameW = previewSize.width * 0.72;
    const frameH = frameW * 1.25;
    const frameX = (previewSize.width - frameW) / 2;
    const frameY = (previewSize.height - frameH) / 2;

    const normalizedCoords =
      bounds.origin.x >= 0 &&
      bounds.origin.y >= 0 &&
      bounds.size.width > 0 &&
      bounds.size.height > 0 &&
      bounds.origin.x <= 1 &&
      bounds.origin.y <= 1 &&
      bounds.size.width <= 1 &&
      bounds.size.height <= 1;

    const fx = normalizedCoords ? bounds.origin.x * previewSize.width : bounds.origin.x;
    const fy = normalizedCoords ? bounds.origin.y * previewSize.height : bounds.origin.y;
    const fw = normalizedCoords ? bounds.size.width * previewSize.width : bounds.size.width;
    const fh = normalizedCoords ? bounds.size.height * previewSize.height : bounds.size.height;
    const faceCx = fx + fw / 2;
    const faceCy = fy + fh / 2;

    const within =
      faceCx > frameX + frameW * 0.14 &&
      faceCx < frameX + frameW * 0.86 &&
      faceCy > frameY + frameH * 0.18 &&
      faceCy < frameY + frameH * 0.82;

    const sizeOk = fw > frameW * 0.34 && fw < frameW * 0.92;
    const roll = typeof face.rollAngle === 'number' ? Math.abs(face.rollAngle) : 0;
    const yaw = typeof face.yawAngle === 'number' ? Math.abs(face.yawAngle) : 0;
    const angleOk = roll < 14 && yaw < 14;

    const okNow = within && sizeOk && angleOk;
    if (!okNow) {
      goodSinceRef.current = null;
      setIsFaceAligned(false);
      if (!within) setFaceHint('Center your face');
      else if (!sizeOk) setFaceHint('Move closer or farther');
      else setFaceHint('Look straight at the camera');
      return;
    }

    if (!goodSinceRef.current) goodSinceRef.current = now;
    const stable = now - goodSinceRef.current > 350;
    setIsFaceAligned(stable);
    setFaceHint(stable ? 'Perfect. You can capture now.' : 'Hold still…');
  };

  const handleRegister = async () => {
    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMemberId = memberId.trim();

    if (
      !normalizedFullName ||
      !normalizedEmail ||
      !password ||
      !confirmPassword ||
      !normalizedMemberId
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', {
        fullName: normalizedFullName,
        email: normalizedEmail,
        password,
        memberId: normalizedMemberId,
        handicapIndex: parseFloat(handicapIndex) || 0,
      });
      await login(response.access_token, response.user);
      if (faceImageBase64) {
        try {
          await apiClient.post('/auth/face-enroll', { imageBase64: faceImageBase64 });
        } catch (err) {
          Alert.alert('Face Enrollment Failed', (err as Error).message);
        }
      }
    } catch (error) {
      Alert.alert('Registration Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <>
    <ScreenWrapper style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <AuthBackground>
        <View style={styles.absoluteTopActions}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.floatingBackButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <LanguagePicker />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentWrapper}>
              <AuthHeader 
                isSmall={isSmallDevice} 
                title={t.register.title} 
                subtitle={t.register.subtitle}
              />

              <View style={styles.glassCard}>
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.register.fullName}</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Your full name"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={fullName}
                        onChangeText={setFullName}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.register.email}</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="name@example.com"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                      <Text style={styles.label}>{t.register.memberId}</Text>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="card-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="ID"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          value={memberId}
                          onChangeText={setMemberId}
                        />
                      </View>
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>{t.register.handicap}</Text>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="trending-up-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="0.0"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          value={handicapIndex}
                          onChangeText={setHandicapIndex}
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.register.password}</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255,255,255,0.6)" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.register.confirmPassword}</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="shield-checkmark-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="rgba(255,255,255,0.6)" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.faceEnrollRow}>
                    <TouchableOpacity 
                      style={[styles.googleButton, faceLoading && styles.buttonDisabled, styles.faceEnrollButton]}
                      onPress={openFaceModal}
                      disabled={faceLoading}
                    >
                      <View style={styles.googleIconWrapper}>
                        <Ionicons name="happy-outline" size={20} color="#16D84E" />
                      </View>
                      <Text style={styles.googleButtonText}>
                        {faceLoading ? t.register.connecting : t.login.faceRecognition}
                      </Text>
                    </TouchableOpacity>
                    {faceImageBase64 ? (
                      <TouchableOpacity
                        style={styles.facePreviewWrap}
                        onPress={openFaceModal}
                        disabled={faceLoading}
                      >
                        <Image source={{ uri: faceImageBase64 }} style={styles.facePreviewImg} />
                        <TouchableOpacity
                          style={styles.facePreviewClear}
                          onPress={() => setFaceImageBase64(null)}
                        >
                          <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.92)" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <PrimaryButton
                    label={t.register.createAccount}
                    onPress={handleRegister}
                    loading={loading}
                    size="large"
                    style={styles.registerButton}
                    textStyle={styles.registerButtonText}
                  />

                  
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>{t.register.alreadyHaveAccount} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>{t.register.signIn}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </AuthBackground>
    </ScreenWrapper>
    {faceModalVisible && (
      <View style={styles.faceModalOverlay}>
        <View style={styles.faceModal}>
          <View style={styles.faceModalHeader}>
            <Text style={styles.faceModalTitle}>{t.login.faceRecognition}</Text>
            <TouchableOpacity onPress={() => setFaceModalVisible(false)}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View
            style={styles.cameraWrap}
            onLayout={(e) =>
              setPreviewSize({
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height,
              })
            }
          >
            {cameraPermission?.granted ? (
              <CameraViewWithFaces
                ref={(r: any) => { cameraRef.current = r; }}
                onCameraReady={() => setCameraReady(true)}
                style={styles.camera}
                facing="front"
                ratio="4:3"
                pointerEvents={Platform.OS === 'web' ? 'none' : 'auto'}
                onFacesDetected={handleFacesDetected}
                onFaceDetectionError={() => {
                  setIsFaceAligned(false);
                  setFaceHint('Face detection unavailable');
                }}
              />
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Text style={styles.cameraPlaceholderText}>Camera permission required</Text>
              </View>
            )}
            <View style={styles.faceGuideOverlay} pointerEvents="none">
              <View
                style={[
                  styles.faceFrame,
                  isFaceAligned ? styles.faceFrameOk : styles.faceFrameIdle,
                ]}
              />
              <Text style={styles.faceHintText}>{faceHint}</Text>
            </View>
          </View>
          <View style={styles.faceActions}>
            <PrimaryButton
              label={faceLoading ? t.register.connecting : 'Capture'}
              onPress={handleFaceCapture}
              loading={faceLoading}
            />
          </View>
        </View>
      </View>
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06160E',
  },
  bgContainer: {
    flex: 1,
    minHeight: '100%',
    overflow: 'hidden',
    backgroundColor: '#06160E',
  },
  bgOrbOne: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(22, 216, 78, 0.16)',
    top: -120,
    left: -140,
  },
  bgOrbTwo: {
    position: 'absolute',
    width: 440,
    height: 440,
    borderRadius: 220,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -180,
    right: -160,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
    width: '100%',
    paddingHorizontal: isSmallDevice ? spacing.lg : spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: Platform.OS === 'web' ? spacing.xl * 2 : spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
    position: 'relative',
  },
  absoluteTopActions: {
    position: 'absolute',
    top: Platform.OS === 'web' ? spacing.xl : spacing.md,
    left: isSmallDevice ? spacing.md : spacing.xl,
    right: isSmallDevice ? spacing.md : spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
  },
  floatingBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.md,
    borderRadius: 30,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  title: {
    fontSize: isSmallDevice ? 28 : 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 32,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
        boxShadow: '0px 20px 40px 0px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    fontWeight: '500',
  },
  registerButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
  },
  registerButtonText: {
    color: '#072016',
    fontWeight: '900',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    height: 56,
    width: '100%',
  },
  googleIconWrapper: {
    marginRight: spacing.sm,
  },
  googleButtonText: {
    color: '#1C2A22',
    fontSize: 16,
    fontWeight: '700',
  },
  faceEnrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  faceEnrollButton: {
    flex: 1,
  },
  facePreviewWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    position: 'relative',
  },
  facePreviewImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  facePreviewClear: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  faceModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  faceModal: {
    width: '90%',
    maxWidth: 520,
    backgroundColor: '#072016',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: spacing.lg,
    zIndex: 10000,
  },
  faceModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  faceModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  cameraWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    position: 'relative',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  faceGuideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: '72%',
    aspectRatio: 0.8,
    borderRadius: 26,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  faceFrameIdle: {
    borderColor: 'rgba(255,255,255,0.28)',
  },
  faceFrameOk: {
    borderColor: 'rgba(22,216,78,0.75)',
  },
  faceHintText: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    textAlign: 'center',
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholderText: {
    color: 'rgba(255,255,255,0.8)',
  },
  faceActions: {
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl * 1.5,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontWeight: '500',
  },
  loginLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
});
