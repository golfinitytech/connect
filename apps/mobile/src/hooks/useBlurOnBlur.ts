import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Platform } from 'react-native';

/**
 * Hook to blur the currently focused element when the screen loses focus.
 * This helps resolve accessibility errors on web like:
 * "Blocked aria-hidden on an element because its descendant retained focus."
 */
export function useBlurOnBlur() {
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (Platform.OS === 'web') {
          // @ts-ignore: activeElement might not be a focusable element but we try to blur it anyway
          if (document.activeElement && typeof document.activeElement.blur === 'function') {
            // @ts-ignore
            document.activeElement.blur();
          }
        }
      };
    }, [])
  );
}
