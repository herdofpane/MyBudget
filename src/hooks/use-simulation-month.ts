import { useMemo, useCallback } from 'react';
import { useBudget } from '@/hooks/use-budget';
import {
  getCurrentMonthStr,
  getMonthsDifference,
  addMonthsToMonthStr,
  getSimulationMonthPresets,
  formatMonthYear,
  formatMonthYearFull,
  SimulationMonthPreset,
} from '@/utils/fixed-expenses';

const MAX_PRESET_MONTHS = 13;

export type SimulationPreset = SimulationMonthPreset;

export interface UseSimulationMonthReturn {
  readonly currentMonthStr: string;
  readonly selectedMonthStr: string;
  readonly selectedMonthOffset: number;
  readonly isSimulating: boolean;
  readonly selectedMonthFormatted: string;
  readonly selectedMonthShort: string;
  readonly presets: readonly SimulationPreset[];
  readonly goToNextMonth: () => void;
  readonly goToPrevMonth: () => void;
  readonly resetToCurrentMonth: () => void;
  readonly selectMonth: (monthStr: string) => void;
}

/**
 * Domain custom hook encapsulating timeline simulation state.
 * Deduplicates calendar math across Home, Fixed Expenses, and Details screens.
 */
export function useSimulationMonth(): UseSimulationMonthReturn {
  const {
    selectedSimulationMonth: selectedMonthStr,
    setSelectedSimulationMonth: setSelectedMonthStr,
  } = useBudget();

  const currentMonthStr = useMemo(() => getCurrentMonthStr(), []);

  const selectedMonthOffset = useMemo(
    () => getMonthsDifference(currentMonthStr, selectedMonthStr),
    [currentMonthStr, selectedMonthStr]
  );

  const isSimulating = selectedMonthOffset > 0;

  const presets = useMemo(
    () => getSimulationMonthPresets(currentMonthStr, MAX_PRESET_MONTHS),
    [currentMonthStr]
  );

  const selectedMonthFormatted = useMemo(
    () => formatMonthYearFull(selectedMonthStr),
    [selectedMonthStr]
  );

  const selectedMonthShort = useMemo(
    () => formatMonthYear(selectedMonthStr),
    [selectedMonthStr]
  );

  const goToNextMonth = useCallback(() => {
    setSelectedMonthStr(addMonthsToMonthStr(selectedMonthStr, 1));
  }, [selectedMonthStr, setSelectedMonthStr]);

  const goToPrevMonth = useCallback(() => {
    const nextMonthStr = addMonthsToMonthStr(selectedMonthStr, -1);
    if (nextMonthStr >= currentMonthStr) {
      setSelectedMonthStr(nextMonthStr);
    }
  }, [selectedMonthStr, currentMonthStr, setSelectedMonthStr]);

  const resetToCurrentMonth = useCallback(() => {
    setSelectedMonthStr(currentMonthStr);
  }, [currentMonthStr, setSelectedMonthStr]);

  const selectMonth = useCallback(
    (monthStr: string) => {
      setSelectedMonthStr(monthStr);
    },
    [setSelectedMonthStr]
  );

  return {
    currentMonthStr,
    selectedMonthStr,
    selectedMonthOffset,
    isSimulating,
    selectedMonthFormatted,
    selectedMonthShort,
    presets,
    goToNextMonth,
    goToPrevMonth,
    resetToCurrentMonth,
    selectMonth,
  };
}
