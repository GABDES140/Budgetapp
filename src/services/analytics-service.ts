import type {
  Budget,
  BudgetAppData,
  Category,
  EntityId,
  FinancialIndicatorPreference,
  Goal,
  Transaction,
  TransactionType,
  WidgetConfig,
} from "@/types";

export type FinancialHealthStatus = "Excellent" | "Stable" | "A surveiller" | "Critique";
export type AnalyticsIndicatorKey =
  | "net-balance"
  | "savings-rate"
  | "expense-income-ratio"
  | "budget-used"
  | "expense-change-monthly";

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

export type AnalyticsFilters = {
  budgetId: EntityId;
  userId: EntityId;
  currency: "all" | string;
  type: "all" | TransactionType;
  categoryId: "all" | EntityId;
  dateFrom: string;
  dateTo: string;
};

export type AnalyticsKpiCard = {
  key: AnalyticsIndicatorKey;
  label: string;
  value: number;
  format: "currency" | "percent";
  detail: string;
  tone: "positive" | "neutral" | "warning" | "critical";
  currency: string;
};

export type MonthComparisonSummary = {
  currentMonthLabel: string;
  previousMonthLabel: string;
  incomeCurrent: number;
  incomePrevious: number;
  expenseCurrent: number;
  expensePrevious: number;
  balanceCurrent: number;
  balancePrevious: number;
  expenseDeltaPercent: number | null;
};

export type YearComparisonPoint = {
  month: string;
  currentYear: number;
  previousYear: number;
};

export type AnalyticsSummary = {
  budget: Budget;
  availableCurrencies: string[];
  categoryBreakdown: CategoryExpenseSummary[];
  monthlyTrend: MonthlyTrendPoint[];
  monthComparison: MonthComparisonSummary;
  yearComparison: YearComparisonPoint[];
  visibleIndicators: AnalyticsKpiCard[];
  allIndicators: AnalyticsKpiCard[];
  indicatorPreferences: FinancialIndicatorPreference[];
  filteredTransactionCount: number;
};

type DashboardSummaryInput = {
  budgetId: EntityId;
  userId: EntityId;
  currentDate?: Date;
};

type AnalyticsSummaryInput = {
  filters: AnalyticsFilters;
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
    recentTransactions: [...budgetTransactions].sort((first, second) => second.date.localeCompare(first.date)).slice(0, 6),
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

export function getAnalyticsSummary(data: BudgetAppData, input: AnalyticsSummaryInput): AnalyticsSummary {
  const currentDate = input.currentDate ?? new Date();
  const budget = findBudget(data.budgets, input.filters.budgetId);
  const allBudgetTransactions = data.transactions.filter((transaction) => transaction.budgetId === budget.id);
  const comparisonCurrency = input.filters.currency === "all" ? budget.defaultCurrency : input.filters.currency;
  const scopedFilters = {
    ...input.filters,
    currency: comparisonCurrency,
  } satisfies AnalyticsFilters;
  const filteredTransactions = filterTransactions(allBudgetTransactions, scopedFilters);
  const categoryBreakdown = calculateCategoryExpenses(
    filteredTransactions.filter((transaction) => transaction.type === "expense"),
    data.categories,
  );
  const comparisonReferenceDate = resolveReferenceDate(input.filters.dateTo, currentDate);
  const monthComparison = calculateMonthComparison(allBudgetTransactions, budget, scopedFilters, comparisonReferenceDate);
  const yearComparison = calculateYearComparison(allBudgetTransactions, scopedFilters, comparisonReferenceDate);
  const visibleCurrency = comparisonCurrency;
  const allIndicators = calculateAnalyticsIndicators({
    budget,
    filteredTransactions,
    currentDate: comparisonReferenceDate,
    comparison: monthComparison,
    currency: visibleCurrency,
  });
  const indicatorPreferences = getIndicatorPreferences(data, budget.id, input.filters.userId);
  const visibleIndicators = allIndicators.filter((indicator) => {
    const preference = indicatorPreferences.find((item) => item.indicatorKey === indicator.key);
    return preference?.isEnabled ?? true;
  });

  return {
    budget,
    availableCurrencies: getAvailableCurrencies(allBudgetTransactions),
    categoryBreakdown,
    monthlyTrend: calculateMonthlyTrend(
      filteredTransactions.length > 0 ? filteredTransactions : allBudgetTransactions,
      comparisonCurrency,
      comparisonReferenceDate,
    ),
    monthComparison,
    yearComparison,
    visibleIndicators,
    allIndicators,
    indicatorPreferences,
    filteredTransactionCount: filteredTransactions.length,
  };
}

function findBudget(budgets: Budget[], budgetId: EntityId) {
  const budget = budgets.find((item) => item.id === budgetId) ?? budgets[0];

  if (!budget) {
    throw new Error("Aucun budget disponible pour le dashboard.");
  }

  return budget;
}

function filterTransactions(transactions: Transaction[], filters: AnalyticsFilters) {
  return transactions.filter((transaction) => {
    return (
      (filters.currency === "all" || transaction.currency === filters.currency) &&
      (filters.type === "all" || transaction.type === filters.type) &&
      (filters.categoryId === "all" || transaction.categoryId === filters.categoryId) &&
      (!filters.dateFrom || transaction.date >= filters.dateFrom) &&
      (!filters.dateTo || transaction.date <= filters.dateTo)
    );
  });
}

function sumTransactions(transactions: Transaction[], type: "income" | "expense") {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

function calculateCategoryExpenses(transactions: Transaction[], categories: Category[]) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const totals = new Map<EntityId, CategoryExpenseSummary>();

  transactions.forEach((transaction) => {
    const category = categoryById.get(transaction.categoryId);
    const key = transaction.categoryId || "uncategorized";
    const existing = totals.get(key);

    totals.set(key, {
      categoryId: key,
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

function calculateMonthComparison(
  transactions: Transaction[],
  budget: Budget,
  filters: AnalyticsFilters,
  referenceDate: Date,
): MonthComparisonSummary {
  const currentMonthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const previousMonthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
  const currency = filters.currency === "all" ? budget.defaultCurrency : filters.currency;
  const normalizedFilters = { ...filters, currency };

  const currentMonthTransactions = filterTransactions(
    transactions.filter((transaction) => transaction.date.startsWith(getMonthKey(currentMonthDate))),
    normalizedFilters,
  );
  const previousMonthTransactions = filterTransactions(
    transactions.filter((transaction) => transaction.date.startsWith(getMonthKey(previousMonthDate))),
    normalizedFilters,
  );

  const expenseCurrent = sumTransactions(currentMonthTransactions, "expense");
  const expensePrevious = sumTransactions(previousMonthTransactions, "expense");
  const incomeCurrent = sumTransactions(currentMonthTransactions, "income");
  const incomePrevious = sumTransactions(previousMonthTransactions, "income");
  const balanceCurrent = incomeCurrent - expenseCurrent;
  const balancePrevious = incomePrevious - expensePrevious;

  return {
    currentMonthLabel: formatMonthLabel(currentMonthDate),
    previousMonthLabel: formatMonthLabel(previousMonthDate),
    incomeCurrent,
    incomePrevious,
    expenseCurrent,
    expensePrevious,
    balanceCurrent,
    balancePrevious,
    expenseDeltaPercent:
      expensePrevious > 0 ? ((expenseCurrent - expensePrevious) / expensePrevious) * 100 : expenseCurrent > 0 ? 100 : 0,
  };
}

function calculateYearComparison(transactions: Transaction[], filters: AnalyticsFilters, referenceDate: Date) {
  const currentYear = referenceDate.getFullYear();
  const previousYear = currentYear - 1;

  return Array.from({ length: 12 }).map((_, monthIndex) => {
    const currentMonthKey = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}`;
    const previousMonthKey = `${previousYear}-${String(monthIndex + 1).padStart(2, "0")}`;
    const currentMonthTransactions = filterTransactions(
      transactions.filter((transaction) => transaction.date.startsWith(currentMonthKey)),
      filters,
    );
    const previousMonthTransactions = filterTransactions(
      transactions.filter((transaction) => transaction.date.startsWith(previousMonthKey)),
      filters,
    );

    return {
      month: new Intl.DateTimeFormat("fr-CA", { month: "short" })
        .format(new Date(currentYear, monthIndex, 1))
        .replace(".", ""),
      currentYear: sumTransactionsBySelectedType(currentMonthTransactions, filters.type),
      previousYear: sumTransactionsBySelectedType(previousMonthTransactions, filters.type),
    };
  });
}

function calculateAnalyticsIndicators(input: {
  budget: Budget;
  filteredTransactions: Transaction[];
  currentDate: Date;
  comparison: MonthComparisonSummary;
  currency: string;
}) {
  const monthKey = getMonthKey(input.currentDate);
  const currentMonthTransactions = input.filteredTransactions.filter((transaction) => {
    return transaction.currency === input.currency && transaction.date.startsWith(monthKey);
  });
  const monthlyIncome = sumTransactions(currentMonthTransactions, "income");
  const monthlyExpense = sumTransactions(currentMonthTransactions, "expense");
  const netBalance = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? (netBalance / monthlyIncome) * 100 : 0;
  const expenseIncomeRatio = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;
  const budgetUsed = input.budget.monthlyLimit > 0 ? (monthlyExpense / input.budget.monthlyLimit) * 100 : 0;
  const expenseChangeMonthly = input.comparison.expenseDeltaPercent ?? 0;

  return [
    {
      key: "net-balance",
      label: "Solde net",
      value: netBalance,
      format: "currency",
      detail: "Mois actif",
      tone: netBalance >= 0 ? "positive" : "critical",
      currency: input.currency,
    },
    {
      key: "savings-rate",
      label: "Taux d'epargne",
      value: savingsRate,
      format: "percent",
      detail: "Revenus conserves",
      tone: savingsRate >= 20 ? "positive" : savingsRate >= 5 ? "neutral" : "warning",
      currency: input.currency,
    },
    {
      key: "expense-income-ratio",
      label: "Ratio depenses / revenus",
      value: expenseIncomeRatio,
      format: "percent",
      detail: "Mois actif",
      tone: expenseIncomeRatio <= 65 ? "positive" : expenseIncomeRatio <= 85 ? "neutral" : "warning",
      currency: input.currency,
    },
    {
      key: "budget-used",
      label: "Budget utilise",
      value: budgetUsed,
      format: "percent",
      detail: "Sur limite mensuelle",
      tone: budgetUsed <= 80 ? "positive" : budgetUsed <= 100 ? "warning" : "critical",
      currency: input.currency,
    },
    {
      key: "expense-change-monthly",
      label: "Variation des depenses",
      value: expenseChangeMonthly,
      format: "percent",
      detail: `${input.comparison.previousMonthLabel} -> ${input.comparison.currentMonthLabel}`,
      tone: expenseChangeMonthly <= 0 ? "positive" : expenseChangeMonthly <= 10 ? "neutral" : "warning",
      currency: input.currency,
    },
  ] satisfies AnalyticsKpiCard[];
}

function getIndicatorPreferences(data: BudgetAppData, budgetId: EntityId, userId: EntityId) {
  return data.financialIndicatorPreferences.filter((item) => item.budgetId === budgetId && item.userId === userId);
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

function getAvailableCurrencies(transactions: Transaction[]) {
  return Array.from(new Set(transactions.map((transaction) => transaction.currency))).sort();
}

function resolveReferenceDate(dateString: string, fallbackDate: Date) {
  if (!dateString) {
    return fallbackDate;
  }

  return new Date(`${dateString}T12:00:00.000Z`);
}

function sumTransactionsBySelectedType(transactions: Transaction[], type: AnalyticsFilters["type"]) {
  if (type === "all") {
    return sumTransactions(transactions, "expense");
  }

  return sumTransactions(transactions, type);
}

function getLastMonths(currentDate: Date, count: number) {
  return Array.from({ length: count })
    .map((_, index) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - index, 1);

      return {
        key: getMonthKey(date),
        label: formatMonthLabel(date),
      };
    })
    .reverse();
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-CA", { month: "short" }).format(date).replace(".", "");
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
