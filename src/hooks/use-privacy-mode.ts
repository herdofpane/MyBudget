import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatEuro, formatEuroRound } from '@/constants/formatters';

const PRIVACY_STORAGE_KEY = '@klyro_privacy_mode';
const MASKED_AMOUNT = '•••• €';

export interface UsePrivacyModeReturn {
  readonly isPrivate: boolean;
  readonly togglePrivate: () => void;
  readonly setPrivate: (value: boolean) => void;
  readonly renderMoney: (amount: number) => string;
  readonly renderMoneyRound: (amount: number) => string;
}

/**
 * Domain custom hook managing application-wide privacy mode.
 * Persists user preference and formats sensitive financial values.
 */
export function usePrivacyMode(): UsePrivacyModeReturn {
  const [isPrivate, setIsPrivateState] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(PRIVACY_STORAGE_KEY)
      .then((saved) => {
        if (isMounted && saved !== null) {
          setIsPrivateState(saved === 'true');
        }
      })
      .catch(() => {
        // Fallback safely to non-private state
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setPrivate = useCallback((value: boolean) => {
    setIsPrivateState(value);
    AsyncStorage.setItem(PRIVACY_STORAGE_KEY, String(value)).catch(() => {});
  }, []);

  const togglePrivate = useCallback(() => {
    setIsPrivateState((prev) => {
      const next = !prev;
      AsyncStorage.setItem(PRIVACY_STORAGE_KEY, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const renderMoney = useCallback(
    (amount: number): string => (isPrivate ? MASKED_AMOUNT : formatEuro(amount)),
    [isPrivate]
  );

  const renderMoneyRound = useCallback(
    (amount: number): string => (isPrivate ? MASKED_AMOUNT : formatEuroRound(amount)),
    [isPrivate]
  );

  return {
    isPrivate,
    togglePrivate,
    setPrivate,
    renderMoney,
    renderMoneyRound,
  };
}
