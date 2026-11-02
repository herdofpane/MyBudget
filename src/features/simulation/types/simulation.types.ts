export type SimulationMode = 'recurring' | 'one_off';

export interface SimulationResult {
  readonly disposableIncome: number;
  readonly savingsRate: number;
  readonly targetEmergencyFund: number;
  readonly projectFeasible: boolean;
}
