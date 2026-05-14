import {
  createEntityId,
  nowIsoString,
  readLocalBudgetAppData,
  resetLocalBudgetAppData,
  writeLocalBudgetAppData,
} from "@/data/local-store";
import type {
  Budget,
  BudgetAppData,
  Category,
  CreateBudgetInput,
  CreateCategoryInput,
  CreateGoalInput,
  CreateTransactionInput,
  CreateWidgetConfigInput,
  EntityId,
  Goal,
  Transaction,
  UpdateBudgetInput,
  UpdateCategoryInput,
  UpdateGoalInput,
  UpdateTransactionInput,
  UpdateWidgetConfigInput,
  User,
  WidgetConfig,
} from "@/types";

type TransactionQuery = {
  budgetId?: EntityId;
  userId?: EntityId;
};

type BudgetAppDataUpdater<T> = (data: BudgetAppData) => T;

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export interface BudgetAppDataRepository {
  getData(): Promise<BudgetAppData>;
  replaceData(data: BudgetAppData): Promise<void>;
  resetData(): Promise<BudgetAppData>;
}

class LocalBudgetAppDataService implements BudgetAppDataRepository {
  async getData() {
    return readLocalBudgetAppData();
  }

  async replaceData(data: BudgetAppData) {
    writeLocalBudgetAppData(data);
  }

  async resetData() {
    return resetLocalBudgetAppData();
  }

  async listUsers() {
    const data = await this.getData();
    return data.users;
  }

  async getUserById(userId: EntityId) {
    const data = await this.getData();
    return data.users.find((user) => user.id === userId) ?? null;
  }

  async updateUser(userId: EntityId, input: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>) {
    return this.mutate((data) => {
      const user = findRequired(data.users, userId, "Utilisateur introuvable");
      Object.assign(user, input, { updatedAt: nowIsoString() });
      return user;
    });
  }

  async listBudgets() {
    const data = await this.getData();
    return data.budgets;
  }

  async getBudgetById(budgetId: EntityId) {
    const data = await this.getData();
    return data.budgets.find((budget) => budget.id === budgetId) ?? null;
  }

  async createBudget(input: CreateBudgetInput) {
    validateBudget(input);

    return this.mutate((data) => {
      const budget: Budget = {
        ...input,
        id: createEntityId("budget"),
        createdAt: nowIsoString(),
        updatedAt: nowIsoString(),
      };

      data.budgets.push(budget);
      return budget;
    });
  }

  async updateBudget(budgetId: EntityId, input: UpdateBudgetInput) {
    return this.mutate((data) => {
      const budget = findRequired(data.budgets, budgetId, "Budget introuvable");
      const nextBudget = { ...budget, ...input };
      validateBudget(nextBudget);
      Object.assign(budget, input, { updatedAt: nowIsoString() });
      return budget;
    });
  }

  async listTransactions(query: TransactionQuery = {}) {
    const data = await this.getData();

    return data.transactions.filter((transaction) => {
      return (
        (!query.budgetId || transaction.budgetId === query.budgetId) &&
        (!query.userId || transaction.userId === query.userId)
      );
    });
  }

  async getTransactionById(transactionId: EntityId) {
    const data = await this.getData();
    return data.transactions.find((transaction) => transaction.id === transactionId) ?? null;
  }

  async createTransaction(input: CreateTransactionInput) {
    validateTransaction(input);

    return this.mutate((data) => {
      const transaction: Transaction = {
        ...input,
        id: createEntityId("tx"),
        createdAt: nowIsoString(),
        updatedAt: nowIsoString(),
      };

      data.transactions.push(transaction);
      return transaction;
    });
  }

  async updateTransaction(transactionId: EntityId, input: UpdateTransactionInput) {
    return this.mutate((data) => {
      const transaction = findRequired(data.transactions, transactionId, "Transaction introuvable");
      const nextTransaction = { ...transaction, ...input };
      validateTransaction(nextTransaction);
      Object.assign(transaction, input, { updatedAt: nowIsoString() });
      return transaction;
    });
  }

  async deleteTransaction(transactionId: EntityId) {
    return this.mutate((data) => {
      data.transactions = data.transactions.filter((transaction) => transaction.id !== transactionId);
    });
  }

  async listCategories(budgetId?: EntityId) {
    const data = await this.getData();

    return data.categories.filter((category) => category.budgetId === null || !budgetId || category.budgetId === budgetId);
  }

  async listSubcategories(categoryId?: EntityId) {
    const data = await this.getData();

    return data.subcategories.filter((subcategory) => !categoryId || subcategory.categoryId === categoryId);
  }

  async createCategory(input: CreateCategoryInput) {
    validateCategory(input);

    return this.mutate((data) => {
      const category: Category = {
        ...input,
        id: createEntityId("cat"),
        createdAt: nowIsoString(),
        updatedAt: nowIsoString(),
      };

      data.categories.push(category);
      return category;
    });
  }

  async updateCategory(categoryId: EntityId, input: UpdateCategoryInput) {
    return this.mutate((data) => {
      const category = findRequired(data.categories, categoryId, "Categorie introuvable");
      const nextCategory = { ...category, ...input };
      validateCategory(nextCategory);
      Object.assign(category, input, { updatedAt: nowIsoString() });
      return category;
    });
  }

  async deleteCategory(categoryId: EntityId) {
    return this.mutate((data) => {
      const category = findRequired(data.categories, categoryId, "Categorie introuvable");

      if (category.isDefault) {
        throw new Error("Une categorie par defaut ne peut pas etre supprimee localement.");
      }

      const isUsed = data.transactions.some((transaction) => transaction.categoryId === categoryId);

      if (isUsed) {
        throw new Error("Cette categorie est utilisee par des transactions.");
      }

      data.categories = data.categories.filter((item) => item.id !== categoryId);
    });
  }

  async listGoals(budgetId?: EntityId) {
    const data = await this.getData();
    return data.goals.filter((goal) => !budgetId || goal.budgetId === budgetId);
  }

  async createGoal(input: CreateGoalInput) {
    validateGoal(input);

    return this.mutate((data) => {
      const goal: Goal = {
        ...input,
        id: createEntityId("goal"),
        createdAt: nowIsoString(),
        updatedAt: nowIsoString(),
      };

      data.goals.push(goal);
      return goal;
    });
  }

  async updateGoal(goalId: EntityId, input: UpdateGoalInput) {
    return this.mutate((data) => {
      const goal = findRequired(data.goals, goalId, "Objectif introuvable");
      const nextGoal = { ...goal, ...input };
      validateGoal(nextGoal);
      Object.assign(goal, input, { updatedAt: nowIsoString() });
      return goal;
    });
  }

  async deleteGoal(goalId: EntityId) {
    return this.mutate((data) => {
      data.goals = data.goals.filter((goal) => goal.id !== goalId);
    });
  }

  async listWidgetConfigs(budgetId?: EntityId, userId?: EntityId) {
    const data = await this.getData();

    return data.widgetConfigs
      .filter((widget) => (!budgetId || widget.budgetId === budgetId) && (!userId || widget.userId === userId))
      .sort((first, second) => first.position - second.position);
  }

  async createWidgetConfig(input: CreateWidgetConfigInput) {
    return this.mutate((data) => {
      const widgetConfig: WidgetConfig = {
        ...input,
        id: createEntityId("widget"),
        createdAt: nowIsoString(),
        updatedAt: nowIsoString(),
      };

      data.widgetConfigs.push(widgetConfig);
      return widgetConfig;
    });
  }

  async updateWidgetConfig(widgetConfigId: EntityId, input: UpdateWidgetConfigInput) {
    return this.mutate((data) => {
      const widgetConfig = findRequired(data.widgetConfigs, widgetConfigId, "Configuration de widget introuvable");
      Object.assign(widgetConfig, input, { updatedAt: nowIsoString() });
      return widgetConfig;
    });
  }

  private async mutate<T>(updater: BudgetAppDataUpdater<T>) {
    const data = await this.getData();
    const result = updater(data);
    await this.replaceData(data);
    return result;
  }
}

function findRequired<T extends { id: EntityId }>(items: T[], id: EntityId, message: string) {
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    throw new Error(message);
  }

  return item;
}

function validateBudget(input: Pick<Budget, "monthlyLimit" | "defaultCurrency" | "ownerId">) {
  assertPositiveNumber(input.monthlyLimit, "Le budget mensuel doit etre positif.");
  assertCurrency(input.defaultCurrency);
  assertRequired(input.ownerId, "Un budget doit avoir un proprietaire.");
}

function validateTransaction(
  input: Pick<Transaction, "amount" | "currency" | "date" | "type" | "budgetId" | "userId" | "categoryId">,
) {
  assertPositiveNumber(input.amount, "Le montant d'une transaction doit etre positif.");
  assertCurrency(input.currency);
  assertRequired(input.date, "Une transaction doit avoir une date.");
  assertRequired(input.budgetId, "Une transaction doit etre associee a un budget.");
  assertRequired(input.userId, "Une transaction doit etre associee a un utilisateur.");
  if (input.type === "expense") {
    assertRequired(input.categoryId, "Une depense doit etre associee a une categorie.");
  }

  if (input.type !== "income" && input.type !== "expense") {
    throw new Error("Une transaction doit etre de type income ou expense.");
  }
}

function validateCategory(input: Pick<Category, "name" | "type" | "color" | "icon">) {
  assertRequired(input.name, "Une categorie doit avoir un nom.");
  assertRequired(input.color, "Une categorie doit avoir une couleur.");
  assertRequired(input.icon, "Une categorie doit avoir une icone.");

  if (!["income", "expense", "both"].includes(input.type)) {
    throw new Error("Une categorie doit etre de type income, expense ou both.");
  }
}

function validateGoal(input: Pick<Goal, "targetAmount" | "currentAmount" | "currency" | "name">) {
  assertRequired(input.name, "Un objectif doit avoir un nom.");
  assertPositiveNumber(input.targetAmount, "Le montant cible doit etre positif.");

  if (input.currentAmount < 0) {
    throw new Error("Le montant actuel ne doit pas etre negatif.");
  }

  assertCurrency(input.currency);
}

function assertCurrency(currency: string) {
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error("La devise doit respecter le format ISO a trois lettres, ex: CAD, USD, EUR.");
  }
}

function assertPositiveNumber(value: number, message: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(message);
  }
}

function assertRequired(value: string | null | undefined, message: string) {
  if (!value) {
    throw new Error(message);
  }
}

export const localBudgetAppDataService = new LocalBudgetAppDataService();
