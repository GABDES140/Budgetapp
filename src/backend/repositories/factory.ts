import { getRepositoryMode } from "../config/env";
import { BudgetPostgresRepository } from "../modules/budgets/budget.postgres-repository";
import { BudgetRepository } from "../modules/budgets/budget.repository";
import { CategoryPostgresRepository } from "../modules/categories/category.postgres-repository";
import { CategoryRepository } from "../modules/categories/category.repository";
import { GoalPostgresRepository } from "../modules/goals/goal.postgres-repository";
import { GoalRepository } from "../modules/goals/goal.repository";
import { TransactionPostgresRepository } from "../modules/transactions/transaction.postgres-repository";
import { TransactionRepository } from "../modules/transactions/transaction.repository";
import { UserPostgresRepository } from "../modules/users/user.postgres-repository";
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
    return {
      users: new UserPostgresRepository() as unknown as UserRepository,
      budgets: new BudgetPostgresRepository() as unknown as BudgetRepository,
      categories: new CategoryPostgresRepository() as unknown as CategoryRepository,
      goals: new GoalPostgresRepository() as unknown as GoalRepository,
      transactions: new TransactionPostgresRepository() as unknown as TransactionRepository,
    };
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
