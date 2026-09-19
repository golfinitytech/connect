import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useBlurOnModal(visible: boolean) {
  useEffect(() => {
    if (visible && Platform.OS === 'web') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && typeof activeElement.blur === 'function') {
        activeElement.blur();
      }
    }
  }, [visible]);
}
