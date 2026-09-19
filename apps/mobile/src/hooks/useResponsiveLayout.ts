import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

type ResponsiveLayoutOptions = {
  maxWidth?: number;
  widePadding?: number;
  xlPadding?: number;
};

export function useResponsiveLayout(options: ResponsiveLayoutOptions = {}) {
  const { width } = useWindowDimensions();

  const maxWidth = options.maxWidth ?? 1120;
  const widePadding = options.widePadding ?? 0;
  const xlPadding = options.xlPadding ?? 0;

  const isWeb = Platform.OS === 'web';
  const isWide = width >= 768;
  const isXL = width >= 1024;

  const centeredContainerStyle = useMemo(() => {
    if (!isWeb && !isWide) return undefined;
    return {
      width: '100%' as const,
      maxWidth,
      alignSelf: 'center' as const,
      paddingHorizontal: isXL ? xlPadding : widePadding,
    };
  }, [isWeb, isWide, isXL, maxWidth, widePadding, xlPadding]);

  return {
    width,
    isWeb,
    isWide,
    isXL,
    centeredContainerStyle,
  };
}
