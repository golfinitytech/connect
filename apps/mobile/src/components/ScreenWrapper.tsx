import React from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useBlurOnBlur } from '../hooks/useBlurOnBlur';

interface ScreenWrapperProps extends SafeAreaViewProps {
  children: React.ReactNode;
}

export function ScreenWrapper({ children, ...props }: ScreenWrapperProps) {
  useBlurOnBlur();
  
  return (
    <SafeAreaView {...props}>
      {children}
    </SafeAreaView>
  );
}
