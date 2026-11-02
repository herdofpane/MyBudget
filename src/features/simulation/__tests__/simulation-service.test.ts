import { describe, it, expect } from 'vitest';
import { SimulationService } from '../services/simulation-service';

describe('SimulationService - Budget Simulator & Projections', () => {
  const service = new SimulationService();

  it('calculates disposable income and emergency fund safety buffer', () => {
    const res = service.evaluate(3000, 1000, 500, 4000);

    expect(res.disposableIncome).toBe(1500);
    expect(res.savingsRate).toBe(50);
    expect(res.targetEmergencyFund).toBe(4500);
    expect(res.projectFeasible).toBe(true);
  });
});
