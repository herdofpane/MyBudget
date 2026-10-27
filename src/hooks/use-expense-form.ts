import { useState, useCallback, useMemo } from 'react';
import { FixedExpenseItem, FixedCategoryType, FixedExpenseActivationType } from '@/types';
import { autoDetectExpenseMeta } from '@/utils/auto-icon';
import { getCurrentMonthStr } from '@/utils/fixed-expenses';

const DEFAULT_CATEGORY: FixedCategoryType = 'autre';
const DEFAULT_ICON = 'receipt-outline';

export interface UseExpenseFormOptions {
  readonly initialData?: Partial<FixedExpenseItem> | null;
}

export interface UseExpenseFormReturn {
  readonly label: string;
  readonly amountInput: string;
  readonly parsedAmount: number;
  readonly category: FixedCategoryType;
  readonly icon: string;
  readonly dueDay: number | undefined;
  readonly isCredit: boolean;
  readonly durationMonths: number;
  readonly paidMonthsCount: number;
  readonly startMonth: string;
  readonly activationType: FixedExpenseActivationType;
  readonly targetMonth: string;
  readonly errorMessage: string | null;
  readonly setLabel: (value: string) => void;
  readonly handleLabelChange: (value: string) => void;
  readonly setAmountInput: (value: string) => void;
  readonly setCategory: (value: FixedCategoryType) => void;
  readonly setIcon: (value: string) => void;
  readonly setDueDay: (value: number | undefined) => void;
  readonly setIsCredit: (value: boolean) => void;
  readonly setDurationMonths: (value: number) => void;
  readonly setPaidMonthsCount: (value: number) => void;
  readonly setStartMonth: (value: string) => void;
  readonly setActivationType: (value: FixedExpenseActivationType) => void;
  readonly setTargetMonth: (value: string) => void;
  readonly validate: () => boolean;
  readonly resetForm: (data?: Partial<FixedExpenseItem> | null) => void;
  readonly getPayload: () => Omit<FixedExpenseItem, 'id'>;
}

/**
 * Domain custom hook managing expense form lifecycle, inputs, auto-detection, and validation.
 */
export function useExpenseForm(options: UseExpenseFormOptions = {}): UseExpenseFormReturn {
  const currentMonth = useMemo(() => getCurrentMonthStr(), []);

  const [label, setLabel] = useState(options.initialData?.label ?? '');
  const [amountInput, setAmountInput] = useState(
    options.initialData?.amount !== undefined ? String(options.initialData.amount) : ''
  );
  const [category, setCategory] = useState<FixedCategoryType>(
    options.initialData?.category ?? DEFAULT_CATEGORY
  );
  const [icon, setIcon] = useState(options.initialData?.icon ?? DEFAULT_ICON);
  const [dueDay, setDueDay] = useState<number | undefined>(options.initialData?.dueDay);
  const [isCredit, setIsCredit] = useState(options.initialData?.isCredit ?? false);
  const [durationMonths, setDurationMonths] = useState(options.initialData?.durationMonths ?? 12);
  const [paidMonthsCount, setPaidMonthsCount] = useState(options.initialData?.paidMonthsCount ?? 0);
  const [startMonth, setStartMonth] = useState(options.initialData?.startMonth ?? currentMonth);
  const [activationType, setActivationType] = useState<FixedExpenseActivationType>(
    options.initialData?.activationType ?? 'all'
  );
  const [targetMonth, setTargetMonth] = useState(options.initialData?.targetMonth ?? currentMonth);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedAmount = useMemo(() => {
    const sanitized = amountInput.replace(',', '.').trim();
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [amountInput]);

  const handleLabelChange = useCallback((text: string) => {
    setLabel(text);
    if (!text.trim()) return;

    const detected = autoDetectExpenseMeta(text);
    if (detected.icon) setIcon(detected.icon);
    if (detected.category) setCategory(detected.category);
  }, []);

  const validate = useCallback((): boolean => {
    if (!label.trim()) {
      setErrorMessage('Veuillez renseigner un intitulé valide.');
      return false;
    }
    if (parsedAmount <= 0) {
      setErrorMessage('Veuillez renseigner un montant supérieur à 0 €.');
      return false;
    }
    setErrorMessage(null);
    return true;
  }, [label, parsedAmount]);

  const resetForm = useCallback((data?: Partial<FixedExpenseItem> | null) => {
    setLabel(data?.label ?? '');
    setAmountInput(data?.amount !== undefined ? String(data.amount) : '');
    setCategory(data?.category ?? DEFAULT_CATEGORY);
    setIcon(data?.icon ?? DEFAULT_ICON);
    setDueDay(data?.dueDay);
    setIsCredit(data?.isCredit ?? false);
    setDurationMonths(data?.durationMonths ?? 12);
    setPaidMonthsCount(data?.paidMonthsCount ?? 0);
    setStartMonth(data?.startMonth ?? getCurrentMonthStr());
    setActivationType(data?.activationType ?? 'all');
    setTargetMonth(data?.targetMonth ?? getCurrentMonthStr());
    setErrorMessage(null);
  }, []);

  const getPayload = useCallback((): Omit<FixedExpenseItem, 'id'> => ({
    label: label.trim(),
    amount: parsedAmount,
    category,
    icon,
    dueDay,
    isCredit,
    durationMonths: isCredit ? durationMonths : undefined,
    paidMonthsCount: isCredit ? paidMonthsCount : undefined,
    startMonth: isCredit ? startMonth : undefined,
    activationType,
    targetMonth: activationType !== 'all' ? targetMonth : undefined,
  }), [
    label,
    parsedAmount,
    category,
    icon,
    dueDay,
    isCredit,
    durationMonths,
    paidMonthsCount,
    startMonth,
    activationType,
    targetMonth,
  ]);

  return {
    label,
    amountInput,
    parsedAmount,
    category,
    icon,
    dueDay,
    isCredit,
    durationMonths,
    paidMonthsCount,
    startMonth,
    activationType,
    targetMonth,
    errorMessage,
    setLabel,
    handleLabelChange,
    setAmountInput,
    setCategory,
    setIcon,
    setDueDay,
    setIsCredit,
    setDurationMonths,
    setPaidMonthsCount,
    setStartMonth,
    setActivationType,
    setTargetMonth,
    validate,
    resetForm,
    getPayload,
  };
}
