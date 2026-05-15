import { Router } from "express";

import { createRepositoryBundle } from "../repositories/factory";
import { BudgetController } from "../modules/budgets/budget.controller";
import { createBudgetRouter } from "../modules/budgets/budget.routes";
import { BudgetService } from "../modules/budgets/budget.service";
import { CategoryController } from "../modules/categories/category.controller";
import { createCategoryRouter } from "../modules/categories/category.routes";
import { CategoryService } from "../modules/categories/category.service";
import { GoalController } from "../modules/goals/goal.controller";
import { createGoalRouter } from "../modules/goals/goal.routes";
import { GoalService } from "../modules/goals/goal.service";
import { TransactionController } from "../modules/transactions/transaction.controller";
import { createTransactionRouter } from "../modules/transactions/transaction.routes";
import { TransactionService } from "../modules/transactions/transaction.service";
import { UserController } from "../modules/users/user.controller";
import { createUserRouter } from "../modules/users/user.routes";
import { UserService } from "../modules/users/user.service";

export function createApiRouter() {
  const repositories = createRepositoryBundle();
  const router = Router();

  router.get("/health", (_request, response) => {
    response.json({
      status: "ok",
      repositoryMode: process.env.BUDGETAPP_REPOSITORY_MODE ?? "file",
    });
  });

  router.use(
    "/transactions",
    createTransactionRouter(new TransactionController(new TransactionService(repositories.transactions))),
  );
  router.use(
    "/categories",
    createCategoryRouter(new CategoryController(new CategoryService(repositories.categories))),
  );
  router.use("/goals", createGoalRouter(new GoalController(new GoalService(repositories.goals))));
  router.use("/budgets", createBudgetRouter(new BudgetController(new BudgetService(repositories.budgets))));
  router.use("/users", createUserRouter(new UserController(new UserService(repositories.users))));

  return router;
}
