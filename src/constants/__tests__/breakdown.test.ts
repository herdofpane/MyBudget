import { describe, it, expect } from 'vitest';
import {
  computeSavings,
  computeNecessaryBreakdown,
  computeFacultativeBreakdown,
} from '../breakdown';

describe('Financial Math - Savings & Breakdown Calculations', () => {
  describe('computeSavings Formula: sqrt(R * N)', () => {
    it('returns 0 when reste à vivre or total nécessaire is zero or negative', () => {
      expect(computeSavings(0, 500)).toBe(0);
      expect(computeSavings(1000, 0)).toBe(0);
      expect(computeSavings(-200, 500)).toBe(0);
    });

    it('returns 0 when reste à vivre is less than or equal to total nécessaire', () => {
      expect(computeSavings(500, 500)).toBe(0);
      expect(computeSavings(400, 500)).toBe(0);
    });

    it('calculates savings accurately with progressive square root formula', () => {
      // Example: R = 1500, N = 600
      // sqrt(1500 * 600) = sqrt(900000) = 948.683298
      // raw = 1500 - 948.683298 = 551.32
      const savings = computeSavings(1500, 600);
      expect(savings).toBe(551.32);
    });
  });

  describe('computeNecessaryBreakdown Percentages', () => {
    it('splits total into groceries (49%), transport (37%) and hygiene (14%)', () => {
      const breakdown = computeNecessaryBreakdown(1000);
      expect(breakdown.groceries).toBe(490);
      expect(breakdown.transport).toBe(370);
      expect(breakdown.hygiene).toBe(140);
      expect(breakdown.total).toBe(1000);
    });

    it('handles zero or negative amounts safely', () => {
      const breakdown = computeNecessaryBreakdown(0);
      expect(breakdown.groceries).toBe(0);
      expect(breakdown.transport).toBe(0);
      expect(breakdown.hygiene).toBe(0);
      expect(breakdown.total).toBe(0);
    });
  });

  describe('computeFacultativeBreakdown Percentages', () => {
    it('splits total into leisure (37%), restaurants (26%), clothing (21%), misc (16%)', () => {
      const breakdown = computeFacultativeBreakdown(500);
      expect(breakdown.leisure).toBe(185);
      expect(breakdown.restaurants).toBe(130);
      expect(breakdown.clothing).toBe(105);
      expect(breakdown.misc).toBe(80);
      expect(breakdown.total).toBe(500);
    });
  });
});
