import { localBudgetAppDataService } from "@/services/local-data-service";
import type { CreateWidgetConfigInput, EntityId, UpdateWidgetConfigInput } from "@/types";

export function getWidgetConfigs(budgetId?: EntityId, userId?: EntityId) {
  return localBudgetAppDataService.listWidgetConfigs(budgetId, userId);
}

export function createWidgetConfig(input: CreateWidgetConfigInput) {
  return localBudgetAppDataService.createWidgetConfig(input);
}

export function updateWidgetConfig(widgetConfigId: EntityId, input: UpdateWidgetConfigInput) {
  return localBudgetAppDataService.updateWidgetConfig(widgetConfigId, input);
}
