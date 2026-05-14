import { localBudgetAppDataService } from "@/services/local-data-service";
import type { CreateBudgetInput, EntityId, UpdateBudgetInput } from "@/types";

export function getBudgets() {
  return localBudgetAppDataService.listBudgets();
}

export function getBudgetById(budgetId: EntityId) {
  return localBudgetAppDataService.getBudgetById(budgetId);
}

export function createBudget(input: CreateBudgetInput) {
  return localBudgetAppDataService.createBudget(input);
}

export function updateBudget(budgetId: EntityId, input: UpdateBudgetInput) {
  return localBudgetAppDataService.updateBudget(budgetId, input);
}
