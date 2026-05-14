import type { Budget, BudgetAppData, Category, EntityId, Goal, Transaction, WidgetConfig } from "@/types";

export type FinancialHealthStatus = "Excellent" | "Stable" | "A surveiller" | "Critique";

export type KpiSummary = {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  budgetRemaining: number;
  budgetUsedPercent: number;
  currency: string;
};

export type CategoryExpenseSummary = {
  categoryId: EntityId;
  name: string;
  amount: number;
  color: string;
};

export type MonthlyTrendPoint = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

export type GoalProgressSummary = Goal & {
  progressPercent: number;
};

export type FinancialHealthSummary = {
  status: FinancialHealthStatus;
  savingsRate: number;
  expenseIncomeRatio: number;
  budgetUsedPercent: number;
  monthlyBalance: number;
};

export type DashboardSummary = {
  budget: Budget;
  widgets: WidgetConfig[];
  kpis: KpiSummary;
  categoryExpenses: CategoryExpenseSummary[];
  monthlyTrend: MonthlyTrendPoint[];
  recentTransactions: Transaction[];
  goalProgress: GoalProgressSummary[];
  health: FinancialHealthSummary;
};

type DashboardSummaryInput = {
  budgetId: EntityId;
  userId: EntityId;
  currentDate?: Date;
};

export function getDashboardSummary(data: BudgetAppData, input: DashboardSummaryInput): DashboardSummary {
  const budget = findBudget(data.budgets, input.budgetId);
  const currentDate = input.currentDate ?? new Date();
  const currency = budget.defaultCurrency;
  const monthKey = getMonthKey(currentDate);

  const budgetTransactions = data.transactions.filter((transaction) => transaction.budgetId === budget.id);
  const currentMonthTransactions = budgetTransactions.filter((transaction) => {
    return transaction.currency === currency && transaction.date.startsWith(monthKey);
  });

  const monthlyIncome = sumTransactions(currentMonthTransactions, "income");
  const monthlyExpense = sumTransactions(currentMonthTransactions, "expense");
  const monthlyBalance = monthlyIncome - monthlyExpense;
  const budgetRemaining = budget.monthlyLimit - monthlyExpense;
  const budgetUsedPercent = budget.monthlyLimit > 0 ? (monthlyExpense / budget.monthlyLimit) * 100 : 0;

  return {
    budget,
    widgets: data.widgetConfigs
      .filter((widget) => widget.budgetId === budget.id && widget.userId === input.userId)
      .sort((first, second) => first.position - second.position),
    kpis: {
      monthlyIncome,
      monthlyExpense,
      monthlyBalance,
      budgetRemaining,
      budgetUsedPercent,
      currency,
    },
    categoryExpenses: calculateCategoryExpenses(currentMonthTransactions, data.categories),
    monthlyTrend: calculateMonthlyTrend(budgetTransactions, currency, currentDate),
    recentTransactions: budgetTransactions.sort((first, second) => second.date.localeCompare(first.date)).slice(0, 6),
    goalProgress: data.goals
      .filter((goal) => goal.budgetId === budget.id)
      .map((goal) => ({
        ...goal,
        progressPercent: goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0,
      })),
    health: calculateFinancialHealth({
      monthlyIncome,
      monthlyExpense,
      monthlyBalance,
      budgetUsedPercent,
    }),
  };
}

function findBudget(budgets: Budget[], budgetId: EntityId) {
  const budget = budgets.find((item) => item.id === budgetId) ?? budgets[0];

  if (!budget) {
    throw new Error("Aucun budget disponible pour le dashboard.");
  }

  return budget;
}

function sumTransactions(transactions: Transaction[], type: "income" | "expense") {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

function calculateCategoryExpenses(transactions: Transaction[], categories: Category[]) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const totals = new Map<EntityId, CategoryExpenseSummary>();

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      const category = categoryById.get(transaction.categoryId);
      const existing = totals.get(transaction.categoryId);

      totals.set(transaction.categoryId, {
        categoryId: transaction.categoryId,
        name: category?.name ?? "Autres",
        amount: (existing?.amount ?? 0) + transaction.amount,
        color: category?.color ?? "#64748b",
      });
    });

  return Array.from(totals.values()).sort((first, second) => second.amount - first.amount);
}

function calculateMonthlyTrend(transactions: Transaction[], currency: string, currentDate: Date) {
  const months = getLastMonths(currentDate, 6);

  return months.map((month) => {
    const monthTransactions = transactions.filter((transaction) => {
      return transaction.currency === currency && transaction.date.startsWith(month.key);
    });
    const income = sumTransactions(monthTransactions, "income");
    const expense = sumTransactions(monthTransactions, "expense");

    return {
      month: month.label,
      income,
      expense,
      balance: income - expense,
    };
  });
}

function calculateFinancialHealth(input: {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  budgetUsedPercent: number;
}): FinancialHealthSummary {
  const savingsRate = input.monthlyIncome > 0 ? (input.monthlyBalance / input.monthlyIncome) * 100 : 0;
  const expenseIncomeRatio = input.monthlyIncome > 0 ? (input.monthlyExpense / input.monthlyIncome) * 100 : 0;
  let status: FinancialHealthStatus = "Stable";

  if (input.monthlyBalance < 0 || input.budgetUsedPercent > 100) {
    status = "Critique";
  } else if (input.budgetUsedPercent >= 90 || savingsRate < 5) {
    status = "A surveiller";
  } else if (savingsRate >= 20 && input.budgetUsedPercent <= 80) {
    status = "Excellent";
  }

  return {
    status,
    savingsRate,
    expenseIncomeRatio,
    budgetUsedPercent: input.budgetUsedPercent,
    monthlyBalance: input.monthlyBalance,
  };
}

function getLastMonths(currentDate: Date, count: number) {
  return Array.from({ length: count })
    .map((_, index) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - index, 1);

      return {
        key: getMonthKey(date),
        label: new Intl.DateTimeFormat("fr-CA", { month: "short" }).format(date).replace(".", ""),
      };
    })
    .reverse();
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
