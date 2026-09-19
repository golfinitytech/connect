import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();
  }, [animatedValue]);

  const widthVal = typeof width === 'number' ? width : 300; // Fallback for animation range if % is used

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-widthVal, widthVal],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: '#E1E9EE',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

export const CircleSkeleton: React.FC<Omit<SkeletonProps, 'borderRadius'>> = (props) => (
  <Skeleton {...props} borderRadius={(props.height as number) / 2 || 20} />
);

export const RectSkeleton: React.FC<SkeletonProps> = (props) => (
  <Skeleton {...props} />
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
});
