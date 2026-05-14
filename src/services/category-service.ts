import { localBudgetAppDataService } from "@/services/local-data-service";
import type { CreateCategoryInput, EntityId, UpdateCategoryInput } from "@/types";

export function getCategories(budgetId?: EntityId) {
  return localBudgetAppDataService.listCategories(budgetId);
}

export function createCategory(input: CreateCategoryInput) {
  return localBudgetAppDataService.createCategory(input);
}

export function updateCategory(categoryId: EntityId, input: UpdateCategoryInput) {
  return localBudgetAppDataService.updateCategory(categoryId, input);
}

export function deleteCategory(categoryId: EntityId) {
  return localBudgetAppDataService.deleteCategory(categoryId);
}
