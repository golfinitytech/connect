import { Pressable, StyleSheet, Text, ViewStyle, TextStyle, StyleProp, Platform } from 'react-native';
import { colors } from '../theme/colors';
import spacing from '../theme/spacing';
import { RectSkeleton } from './Skeleton';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  size?: 'default' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function PrimaryButton({ 
  label, 
  onPress, 
  size = 'default', 
  loading, 
  disabled,
  style,
  textStyle
}: PrimaryButtonProps) {
  return (
    <Pressable 
      style={[
        styles.button, 
        size === 'large' && styles.buttonLarge,
        (disabled || loading) && styles.buttonDisabled,
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <RectSkeleton width={80} height={20} borderRadius={4} />
      ) : (
        <Text style={[styles.label, size === 'large' && styles.labelLarge, textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 8px 14px 0px rgba(32, 217, 90, 0.18)',
      },
    }),
    minHeight: 56, // Ensure consistent height for loading state
    justifyContent: 'center',
  },
  buttonLarge: {
    borderRadius: 20,
    paddingVertical: 18,
    minHeight: 64,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    color: '#06210E',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  labelLarge: {
    fontSize: 24,
    letterSpacing: 0.6,
  },
});
