import { describe, it, expect, vi, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { budgetStorageService } from '../budget-storage.service';
import { STORAGE_KEY } from '@/constants';
import { DEFAULT_BUDGET } from '@/data';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('BudgetStorageService - Offline Persistence & Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a unique collision-resistant ID', () => {
    const id1 = budgetStorageService.generateId();
    const id2 = budgetStorageService.generateId();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
  });

  it('returns default budget state when storage is empty', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);

    const state = await budgetStorageService.loadState();
    expect(state.budget.income).toBe(DEFAULT_BUDGET.income);
    expect(state.fixedExpensesList).toBeDefined();
    expect(Array.isArray(state.variableCategories)).toBe(true);
  });

  it('recovers gracefully with fallback defaults when JSON is corrupted', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce('invalid{json');

    const state = await budgetStorageService.loadState();
    expect(state.budget).toBeDefined();
    expect(state.budget.income).toBe(DEFAULT_BUDGET.income);
  });

  it('serializes writes safely through saveState', async () => {
    vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce();

    const mockPayload = {
      budget: DEFAULT_BUDGET,
      fixedExpensesList: [],
      variableCategories: [],
      expenseHistory: [],
    };

    await budgetStorageService.saveState(mockPayload);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining('"budget"')
    );
  });
});
