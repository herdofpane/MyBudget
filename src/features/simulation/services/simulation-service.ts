import { SimulationResult } from '../types/simulation.types';

export class SimulationService {
  /**
   * Evaluates disposable income and emergency fund safety buffer.
   */
  evaluate(
    simulatedIncome: number,
    simulatedFixed: number,
    simulatedVariable: number,
    currentSavings: number
  ): SimulationResult {
    const disposableIncome = simulatedIncome - simulatedFixed - simulatedVariable;
    const savingsRate = simulatedIncome > 0 ? Math.max(0, (disposableIncome / simulatedIncome) * 100) : 0;
    // 3 months of subsistence buffer as recommended target
    const targetEmergencyFund = (simulatedFixed + simulatedVariable) * 3;
    const projectFeasible = disposableIncome >= 0 && currentSavings >= 0;

    return {
      disposableIncome: Math.round(disposableIncome * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      targetEmergencyFund: Math.round(targetEmergencyFund),
      projectFeasible,
    };
  }
}

export const simulationService = new SimulationService();
