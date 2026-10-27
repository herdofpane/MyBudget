import { useCallback } from 'react';
import { Platform, Vibration } from 'react-native';

const HAPTIC_PATTERNS = {
  selection: [0, 8],
  light: [0, 15],
  medium: [0, 25],
  heavy: [0, 40],
  success: [0, 20, 40, 20],
  warning: [0, 30, 50, 30],
  error: [0, 50, 60, 50],
} as const;

export interface UseHapticsReturn {
  readonly selection: () => void;
  readonly impactLight: () => void;
  readonly impactMedium: () => void;
  readonly impactHeavy: () => void;
  readonly notificationSuccess: () => void;
  readonly notificationWarning: () => void;
  readonly notificationError: () => void;
}

/**
 * Ergonomic sensory feedback hook following Apple HIG touch response guidelines.
 * Gracefully adapts to Web, Android, and iOS environments without crashes.
 */
export function useHaptics(): UseHapticsReturn {
  const triggerVibration = useCallback((pattern: readonly number[]) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([...pattern]);
        } catch {
          // Web vibration permission might be blocked
        }
      }
      return;
    }

    try {
      Vibration.vibrate([...pattern], false);
    } catch {
      // Ignore vibration error on unsupported simulators
    }
  }, []);

  const selection = useCallback(() => {
    triggerVibration(HAPTIC_PATTERNS.selection);
  }, [triggerVibration]);

  const impactLight = useCallback(() => {
    triggerVibration(HAPTIC_PATTERNS.light);
  }, [triggerVibration]);

  const impactMedium = useCallback(() => {
    triggerVibration(HAPTIC_PATTERNS.medium);
  }, [triggerVibration]);

  const impactHeavy = useCallback(() => {
    triggerVibration(HAPTIC_PATTERNS.heavy);
  }, [triggerVibration]);

  const notificationSuccess = useCallback(() => {
    triggerVibration(HAPTIC_PATTERNS.success);
  }, [triggerVibration]);

  const notificationWarning = useCallback(() => {
    triggerVibration(HAPTIC_PATTERNS.warning);
  }, [triggerVibration]);

  const notificationError = useCallback(() => {
    triggerVibration(HAPTIC_PATTERNS.error);
  }, [triggerVibration]);

  return {
    selection,
    impactLight,
    impactMedium,
    impactHeavy,
    notificationSuccess,
    notificationWarning,
    notificationError,
  };
}
