import React from 'react';
import { View, StyleSheet, ViewStyle, Text, Platform } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

interface LogoProps {
  size?: number;
  style?: ViewStyle;
  showText?: boolean;
  horizontal?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 120, 
  style, 
  showText = false,
  horizontal = false
}) => {
  const iconSize = size;
  
  return (
    <View style={[
      styles.container, 
      horizontal ? styles.containerHorizontal : styles.containerVertical,
      style
    ]}>
      <Svg
        width={iconSize}
        height={iconSize * 0.7}
        viewBox="0 0 160 110"
        fill="none"
      >
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="160" y2="100">
            <Stop offset="0" stopColor="#12B340" stopOpacity="1" />
            <Stop offset="0.5" stopColor={colors.primary} stopOpacity="1" />
            <Stop offset="1" stopColor="#12B340" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="shineGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="ballGrad" x1="0.3" y1="0.3" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="1" stopColor="#D8E2DC" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Shadow for depth */}
        <Path
          d="M40 55 C 40 30, 75 30, 80 55 C 85 80, 120 80, 120 55 C 120 30, 85 30, 80 55 C 75 80, 40 80, 40 55 Z"
          stroke="#000000"
          strokeWidth="14"
          strokeOpacity="0.1"
          transform="translate(2, 5)"
          strokeLinecap="round"
        />

        {/* Main Infinity Path */}
        <Path
          d="M40 55 C 40 30, 75 30, 80 55 C 85 80, 120 80, 120 55 C 120 30, 85 30, 80 55 C 75 80, 40 80, 40 55 Z"
          stroke="url(#grad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Shine on the loop */}
        <Path
          d="M40 55 C 40 30, 75 30, 80 55"
          stroke="url(#shineGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          transform="translate(0, -3)"
        />

        {/* Golf Ball Integrated into the Loop */}
        <Circle
          cx="120"
          cy="42"
          r="12"
          fill="url(#ballGrad)"
          stroke={colors.primaryDark}
          strokeWidth="0.5"
        />
        
        {/* Realistic Dimples */}
        <Circle cx="116" cy="38" r="1.2" fill="#C0D0C0" fillOpacity="0.6" />
        <Circle cx="124" cy="38" r="1.2" fill="#C0D0C0" fillOpacity="0.6" />
        <Circle cx="120" cy="42" r="1.2" fill="#C0D0C0" fillOpacity="0.6" />
        <Circle cx="116" cy="46" r="1.2" fill="#C0D0C0" fillOpacity="0.6" />
        <Circle cx="124" cy="46" r="1.2" fill="#C0D0C0" fillOpacity="0.6" />
        <Circle cx="120" cy="35" r="1" fill="#C0D0C0" fillOpacity="0.4" />
        <Circle cx="120" cy="49" r="1" fill="#C0D0C0" fillOpacity="0.4" />
      </Svg>
      
      {showText && (
        <Text style={[
          styles.logoText, 
          { fontSize: size * 0.22 },
          horizontal && styles.logoTextHorizontal
        ]}>
          GOLFINITY
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // base styles
  },
  containerVertical: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontWeight: '900',
    color: '#06210E',
    letterSpacing: 4,
    fontFamily: 'System', 
    ...Platform.select({
      web: { textShadow: '1px 1px 1px rgba(0, 0, 0, 0.05)' },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.05)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
      },
    }),
  },
  logoTextHorizontal: {
    marginTop: 0,
    letterSpacing: 3,
  },
});
