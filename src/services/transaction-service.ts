import { localBudgetAppDataService } from "@/services/local-data-service";
import type { CreateTransactionInput, EntityId, UpdateTransactionInput } from "@/types";

export function getTransactions(filters?: { budgetId?: EntityId; userId?: EntityId }) {
  return localBudgetAppDataService.listTransactions(filters);
}

export function getTransactionById(transactionId: EntityId) {
  return localBudgetAppDataService.getTransactionById(transactionId);
}

export function createTransaction(input: CreateTransactionInput) {
  return localBudgetAppDataService.createTransaction(input);
}

export function updateTransaction(transactionId: EntityId, input: UpdateTransactionInput) {
  return localBudgetAppDataService.updateTransaction(transactionId, input);
}

export function deleteTransaction(transactionId: EntityId) {
  return localBudgetAppDataService.deleteTransaction(transactionId);
}
