import { HttpError } from "../lib/http-error";
import { getRepositoryMode } from "../config/env";
import { BudgetRepository } from "../modules/budgets/budget.repository";
import { CategoryRepository } from "../modules/categories/category.repository";
import { GoalRepository } from "../modules/goals/goal.repository";
import { TransactionRepository } from "../modules/transactions/transaction.repository";
import { UserRepository } from "../modules/users/user.repository";

import { FileBudgetAppStore, type BudgetAppStore } from "./store";

export type RepositoryBundle = {
  budgets: BudgetRepository;
  categories: CategoryRepository;
  goals: GoalRepository;
  transactions: TransactionRepository;
  users: UserRepository;
};

export function createRepositoryBundle(): RepositoryBundle {
  const mode = getRepositoryMode();

  if (mode === "postgres") {
    throw new HttpError(501, "Le mode PostgreSQL est prepare mais pas encore implemente.");
  }

  const store: BudgetAppStore = new FileBudgetAppStore();

  return {
    users: new UserRepository(store),
    budgets: new BudgetRepository(store),
    categories: new CategoryRepository(store),
    goals: new GoalRepository(store),
    transactions: new TransactionRepository(store),
  };
}
