import { localBudgetAppDataService } from "@/services/local-data-service";
import type { CreateGoalInput, EntityId, UpdateGoalInput } from "@/types";

export function getGoals(budgetId?: EntityId) {
  return localBudgetAppDataService.listGoals(budgetId);
}

export function createGoal(input: CreateGoalInput) {
  return localBudgetAppDataService.createGoal(input);
}

export function updateGoal(goalId: EntityId, input: UpdateGoalInput) {
  return localBudgetAppDataService.updateGoal(goalId, input);
}

export function deleteGoal(goalId: EntityId) {
  return localBudgetAppDataService.deleteGoal(goalId);
}
