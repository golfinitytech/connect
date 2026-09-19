import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { User } from '../api/types';
import { CircleSkeleton } from '../components/Skeleton';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useLanguage } from '../context/LanguageContext';
import { LanguagePicker } from '../components/LanguagePicker';

WebBrowser.maybeCompleteAuthSession();

interface LoginResponse {
  access_token: string;
  user: User;
}

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const BRAND_LOGO = require('../../assets/brand/logo.jpeg');

// Memoized Background and Overlay for performance
const AuthBackground = memo(({ children, bgUrl }: { children: React.ReactNode, bgUrl: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (isLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoaded]);

  return (
    <View style={styles.bgContainer}>
      <Animated.Image
        source={{ uri: bgUrl }}
        style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}
        onLoad={() => setIsLoaded(true)}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(7, 32, 22, 0.95)']}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </View>
  );
});

// Memoized Header for performance
const AuthHeader = memo(({ compactLevel, logoSize, t }: { compactLevel: 0 | 1 | 2; logoSize: number; t: any }) => (
  <View style={[styles.header, compactLevel > 0 && styles.headerCompact, compactLevel === 2 && styles.headerTight]}>
    <View style={[styles.logoWrapper, compactLevel > 0 && styles.logoWrapperCompact, compactLevel === 2 && styles.logoWrapperTight]}>
      <Image source={BRAND_LOGO} style={[styles.brandLogoImage, { width: logoSize, height: logoSize }]} resizeMode="contain" />
    </View>
    <Text style={styles.title} numberOfLines={1}>{t.login.title}</Text>
    {compactLevel === 0 ? <Text style={styles.subtitle} numberOfLines={2}>{t.login.subtitle}</Text> : null}
  </View>
));

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = React.useRef<CameraView | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [faceHint, setFaceHint] = useState('Align your face inside the frame');
  const [faceProgress, setFaceProgress] = useState(0);
  const lastFaceEventAtRef = useRef(0);
  const goodSinceRef = useRef<number | null>(null);
  const autoCaptureInFlightRef = useRef(false);
  const lastAutoAttemptAtRef = useRef(0);
  const CameraViewWithFaces = CameraView as unknown as React.ComponentType<any>;

  // High-performance image URL (w=800 instead of w=1200/2070)
  const GOLF_BG = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop';

  const openFaceModal = async () => {
    try {
      const result = await requestCameraPermission();
      if (!result?.granted) {
        Alert.alert('Permission Required', 'Enable camera access to use Face Recognition.');
        return;
      }
      goodSinceRef.current = null;
      setIsFaceAligned(false);
      setFaceHint('Align your face inside the frame');
      setCameraReady(false);
      autoCaptureInFlightRef.current = false;
      lastAutoAttemptAtRef.current = Date.now();
      setFaceProgress(0);
      setFaceModalVisible(true);
    } catch (e) {
      Alert.alert('Camera Error', (e as Error).message);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleFacesDetected = (event: any) => {
    const now = Date.now();
    if (now - lastFaceEventAtRef.current < 120) return;
    lastFaceEventAtRef.current = now;

    const faces = event?.faces ?? event?.nativeEvent?.faces ?? [];
    if (!previewSize.width || !previewSize.height) {
      setIsFaceAligned(false);
      setFaceHint('Align your face inside the frame');
      setFaceProgress(0);
      return;
    }
    if (!faces.length) {
      goodSinceRef.current = null;
      setIsFaceAligned(false);
      setFaceHint('No face detected');
      setFaceProgress(0);
      return;
    }
    if (faces.length > 1) {
      goodSinceRef.current = null;
      setIsFaceAligned(false);
      setFaceHint('Only one face allowed');
      setFaceProgress(0);
      return;
    }

    const face = faces[0];
    const bounds = face?.bounds;
    if (!bounds?.origin || !bounds?.size) {
      goodSinceRef.current = null;
      setIsFaceAligned(false);
      setFaceHint('Align your face inside the frame');
      setFaceProgress(0);
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
      setFaceProgress(0);
      if (!within) setFaceHint('Center your face');
      else if (!sizeOk) setFaceHint('Move closer or farther');
      else setFaceHint('Look straight at the camera');
      return;
    }

    if (!goodSinceRef.current) goodSinceRef.current = now;
    const elapsed = now - goodSinceRef.current;
    const stable = elapsed > 350;
    const pct = Math.min(100, Math.max(0, Math.round((elapsed / 350) * 100)));
    setFaceProgress(pct);
    setIsFaceAligned(stable);
    setFaceHint(stable ? 'Perfect. You can capture now.' : 'Hold still…');
  };

  useEffect(() => {
    if (!faceModalVisible) return;
    if (Platform.OS !== 'web') return;
    if (!cameraReady) return;
    if (faceLoading) return;

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - lastAutoAttemptAtRef.current;
      const pct = Math.min(100, Math.max(0, Math.round((elapsed / 2200) * 100)));
      setFaceProgress(pct);
    }, 120);

    return () => clearInterval(intervalId);
  }, [cameraReady, faceLoading, faceModalVisible]);

  const attemptFaceLogin = async (opts?: { skipAlignment?: boolean; silent?: boolean }) => {
    if (!cameraRef.current || !cameraReady) return;
    if (!opts?.skipAlignment && !isFaceAligned) {
      if (!opts?.silent) {
        Alert.alert('Face Not Ready', 'Align your face inside the frame first.');
      }
      return;
    }
    setFaceLoading(true);
    setFaceProgress(100);
    setFaceHint('Scanning…');
    try {
      if (Platform.OS === 'web') {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          base64: true,
          skipProcessing: true,
        });
        const imageBase64 = photo?.base64
          ? `data:image/jpeg;base64,${photo.base64}`
          : String(photo?.uri || '');
        if (!imageBase64) {
          throw new Error('Failed to capture image');
        }
        const res = await apiClient.post<LoginResponse>('/auth/face-login', { imageBase64 });
        await login(res.access_token, res.user);
        setFaceModalVisible(false);
        return;
      }

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

      const payload = { imageBase64: `data:image/jpeg;base64,${cropped.base64}` };
      const res = await apiClient.post<LoginResponse>('/auth/face-login', payload);
      await login(res.access_token, res.user);
      setFaceModalVisible(false);
    } catch (error) {
      const msg = (error as Error).message || String(error);
      goodSinceRef.current = null;
      setIsFaceAligned(false);
      setFaceHint('Face not match. Try again.');
      if (!opts?.silent) {
        Alert.alert('Face Recognition Failed', msg);
      }
    } finally {
      setFaceLoading(false);
    }
  };

  useEffect(() => {
    if (!faceModalVisible) return;
    if (!cameraReady) return;
    if (faceLoading) return;
    if (autoCaptureInFlightRef.current) return;

    const now = Date.now();
    const minIntervalMs = Platform.OS === 'web' ? 2200 : 1600;
    if (now - lastAutoAttemptAtRef.current < minIntervalMs) return;

    const canAuto =
      Platform.OS === 'web' ? true : isFaceAligned;
    if (!canAuto) return;

    autoCaptureInFlightRef.current = true;
    lastAutoAttemptAtRef.current = now;
    setFaceProgress(0);
    void attemptFaceLogin({
      skipAlignment: Platform.OS === 'web',
      silent: Platform.OS === 'web',
    }).finally(() => {
      autoCaptureInFlightRef.current = false;
    });
  }, [cameraReady, faceLoading, faceModalVisible, isFaceAligned]);

  const handleFaceCaptureAndLogin = async () => {
    await attemptFaceLogin({ skipAlignment: false, silent: false });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      await login(response.access_token, response.user);
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {};

  const availableHeight = screenHeight - insets.top - insets.bottom;
  const compactLevel: 0 | 1 | 2 =
    keyboardVisible || availableHeight < 700 ? 2 : availableHeight < 820 ? 1 : 0;
  const compact = compactLevel > 0;
  const logoSize =
    compactLevel === 2
      ? screenWidth < 375
        ? 52
        : 58
      : compactLevel === 1
        ? screenWidth < 375
          ? 58
          : 64
        : screenWidth < 375
          ? 70
          : 86;
  const cardPadding = compactLevel === 2 ? spacing.md : compact ? spacing.lg : spacing.xl;
  const fieldHeight = compactLevel === 2 ? 48 : compact ? 52 : 60;
  const fieldRadius = compactLevel === 2 ? 12 : compact ? 14 : 16;
  const iconSize = compactLevel === 2 ? 16 : compact ? 18 : 20;
  const formGap = compactLevel === 2 ? spacing.md : compact ? spacing.lg : spacing.xl;
  const dividerMargin = compactLevel === 2 ? spacing.xs : compact ? spacing.md : spacing.xl;
  const footerMarginTop = compactLevel === 2 ? spacing.sm : compact ? spacing.lg : spacing.xl;
  const safeBottomBase = Platform.OS === 'web' ? spacing.xl : Math.max(insets.bottom, spacing.lg);
  const scrollBottomPad = safeBottomBase + (compactLevel === 2 ? spacing.xl : spacing.xl * 2);
  const faceRingSize = previewSize.width
    ? Math.max(170, Math.min(previewSize.width * 0.72, 260))
    : 220;
  const faceRingStroke = 7;
  const faceRingRadius = (faceRingSize - faceRingStroke) / 2;
  const faceRingCircumference = 2 * Math.PI * faceRingRadius;
  const faceRingOffset = faceRingCircumference * (1 - Math.min(100, Math.max(0, faceProgress)) / 100);

  return (
    <ScreenWrapper style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <AuthBackground bgUrl={GOLF_BG}>
        <View style={styles.absoluteTopActions}>
          <LanguagePicker />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
          style={styles.keyboardView}
        >
          <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                compact && styles.scrollContentCompact,
                { paddingBottom: scrollBottomPad },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={true}
            >
            <View style={[styles.contentWrapper, compact && styles.contentWrapperCompact]}>
              <AuthHeader compactLevel={compactLevel} logoSize={logoSize} t={t} />

              <View style={[styles.glassCard, { padding: cardPadding }]}>
                <View style={[styles.form, { gap: formGap }]}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t.login.email}</Text>
                    <View style={[styles.inputWrapper, { height: fieldHeight, borderRadius: fieldRadius }]}>
                      <Ionicons name="mail-outline" size={iconSize} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
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

                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>{t.login.password}</Text>
                      <TouchableOpacity 
                        style={styles.forgotPassword}
                        onPress={() => navigation.navigate('ForgotPassword')}
                      >
                        <Text style={styles.forgotPasswordText}>{t.login.forgotPassword}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.inputWrapper, { height: fieldHeight, borderRadius: fieldRadius }]}>
                      <Ionicons name="lock-closed-outline" size={iconSize} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="rgba(255,255,255,0.6)"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <PrimaryButton
                    label={t.login.signIn}
                    onPress={handleLogin}
                    loading={loading}
                    size="large"
                    style={styles.loginButton}
                    textStyle={styles.loginButtonText}
                  />

                  <View style={[styles.divider, { marginVertical: dividerMargin }]}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>{t.login.or}</Text>
                    <View style={styles.line} />
                  </View>

                  <TouchableOpacity 
                    style={[styles.faceButton, faceLoading && styles.buttonDisabled]}
                    onPress={openFaceModal}
                    disabled={faceLoading}
                  >
                    <View style={styles.faceIconWrapper}>
                      <Ionicons name="happy-outline" size={20} color="#16D84E" />
                    </View>
                    <Text style={styles.faceButtonText}>
                      {faceLoading ? t.login.connecting : t.login.faceRecognition}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.footer, { marginTop: footerMarginTop }]}>
                <Text style={styles.footerText}>{t.login.newToGolfinity} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.signUpLink}>{t.login.createAccount}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </AuthBackground>
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
              <View style={[styles.faceRingWrap, { width: faceRingSize, height: faceRingSize }]}>
                <Svg width={faceRingSize} height={faceRingSize}>
                  <Circle
                    cx={faceRingSize / 2}
                    cy={faceRingSize / 2}
                    r={faceRingRadius}
                    stroke={isFaceAligned ? 'rgba(22,216,78,0.35)' : 'rgba(255,255,255,0.18)'}
                    strokeWidth={faceRingStroke}
                    fill="transparent"
                  />
                  <Circle
                    cx={faceRingSize / 2}
                    cy={faceRingSize / 2}
                    r={faceRingRadius}
                    stroke={isFaceAligned ? 'rgba(22,216,78,0.95)' : 'rgba(255,255,255,0.85)'}
                    strokeWidth={faceRingStroke}
                    strokeLinecap="round"
                    strokeDasharray={`${faceRingCircumference} ${faceRingCircumference}`}
                    strokeDashoffset={faceRingOffset}
                    fill="transparent"
                    transform={`rotate(-90 ${faceRingSize / 2} ${faceRingSize / 2})`}
                  />
                </Svg>
                <Text style={styles.faceRingPct}>{Math.round(faceProgress)}%</Text>
              </View>
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
                label={faceLoading ? t.login.connecting : 'Capture'}
                onPress={handleFaceCaptureAndLogin}
                loading={faceLoading}
              />
            </View>
          </View>
        </View>
      )}
    </ScreenWrapper>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: isSmallDevice ? spacing.lg : spacing.xl,
    paddingTop: Platform.OS === 'web' ? spacing.xl * 2 : spacing.lg,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scrollContentCompact: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: 'flex-start',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
  },
  contentWrapperCompact: {
    alignItems: 'center',
  },
  absoluteTopActions: {
    position: 'absolute',
    top: Platform.OS === 'web' ? spacing.xl : spacing.md,
    right: isSmallDevice ? spacing.md : spacing.xl,
    zIndex: 1000,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerCompact: {
    marginBottom: spacing.lg,
  },
  headerTight: {
    marginBottom: spacing.md,
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
  logoWrapperCompact: {
    padding: spacing.sm,
    borderRadius: 24,
    marginBottom: spacing.sm,
  },
  logoWrapperTight: {
    padding: spacing.xs,
    borderRadius: 22,
    marginBottom: spacing.xs,
  },
  brandLogoImage: {
    borderRadius: 14,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Increased opacity for better visibility without blur
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
        // Removed heavy backdropFilter for performance
      },
    }),
  },
  form: {
    width: '100%',
    gap: spacing.xl,
  },
  inputGroup: {
    marginBottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
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
    height: 60,
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
    paddingVertical: 14,
    lineHeight: 20,
    textAlignVertical: 'center',
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  loginButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
  },
  loginButtonText: {
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
  faceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    height: 56,
    width: '100%',
  },
  faceIconWrapper: {
    marginRight: spacing.sm,
  },
  faceButtonText: {
    color: '#06210E',
    fontSize: 16,
    fontWeight: '800',
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
  signUpLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
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
  faceRingWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceRingPct: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
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
});
