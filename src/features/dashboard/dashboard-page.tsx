"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Gauge,
  PiggyBank,
  Target,
  Wallet,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageTransition } from "@/components/layout/page-transition";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/features/auth/auth-provider";
import { formatCurrencyAmount, formatTransactionDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getDashboardSummary, type DashboardSummary } from "@/services/analytics-service";
import { localBudgetAppDataService } from "@/services/local-data-service";
import { getAccessibleBudgets } from "@/services/shared-budget-service";
import { createWidgetConfig, updateWidgetConfig } from "@/services/widget-service";
import type { Budget, EntityId, User, WidgetConfig, WidgetKey } from "@/types";

type WidgetDefinition = {
  key: WidgetKey;
  label: string;
  description: string;
};

const widgetDefinitions: WidgetDefinition[] = [
  {
    key: "income-expense-summary",
    label: "Revenus et depenses",
    description: "KPI du mois",
  },
  {
    key: "budget-progress",
    label: "Budget restant",
    description: "Suivi mensuel",
  },
  {
    key: "expense-category-breakdown",
    label: "Categories",
    description: "Depenses du mois",
  },
  {
    key: "recent-transactions",
    label: "Transactions recentes",
    description: "Derniers mouvements",
  },
  {
    key: "monthly-balance",
    label: "Tendance mensuelle",
    description: "Revenus vs depenses",
  },
  {
    key: "goals-progress",
    label: "Objectifs",
    description: "Progression",
  },
  {
    key: "financial-health",
    label: "Sante financiere",
    description: "Statut global",
  },
];

export function DashboardPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeUserId, setActiveUserId] = useState<EntityId>("");
  const [activeBudgetId, setActiveBudgetId] = useState<EntityId>("");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeUser = users.find((user) => user.id === activeUserId);

  const enabledWidgets = useMemo(() => {
    return new Set(
      widgetDefinitions
        .filter((definition) => {
          const config = widgetConfigs.find((widget) => widget.widgetKey === definition.key);
          return config?.isEnabled ?? true;
        })
        .map((definition) => definition.key),
    );
  }, [widgetConfigs]);

  async function loadDashboard(nextBudgetId?: EntityId, nextUserId?: EntityId) {
    let data = await localBudgetAppDataService.getData();
    const preferredUserId = nextUserId ?? activeUserId ?? session?.userId;
    const user = data.users.find((item) => item.id === preferredUserId) ?? data.users[0];
    const accessibleBudgets = user ? await getAccessibleBudgets(user.id) : [];
    const budget =
      accessibleBudgets.find((item) => item.id === nextBudgetId) ??
      accessibleBudgets.find((item) => item.id === activeBudgetId) ??
      accessibleBudgets[0];

    if (!user || !budget) {
      setIsReady(true);
      return;
    }

    const missingWidgets = widgetDefinitions.filter((definition) => {
      return !data.widgetConfigs.some((widget) => {
        return widget.budgetId === budget.id && widget.userId === user.id && widget.widgetKey === definition.key;
      });
    });

    for (const [index, definition] of missingWidgets.entries()) {
      await createWidgetConfig({
        userId: user.id,
        budgetId: budget.id,
        widgetKey: definition.key,
        isEnabled: true,
        position: data.widgetConfigs.length + index + 1,
        config: {},
      });
    }

    if (missingWidgets.length > 0) {
      data = await localBudgetAppDataService.getData();
    }

    const nextSummary = getDashboardSummary(data, {
      budgetId: budget.id,
      userId: user.id,
      currentDate: new Date("2026-05-14T12:00:00.000Z"),
    });

    setUsers(data.users);
    setBudgets(accessibleBudgets);
    setActiveUserId(user.id);
    setActiveBudgetId(budget.id);
    setSummary(nextSummary);
    setWidgetConfigs(nextSummary.widgets);
    setIsReady(true);
  }

  async function toggleWidget(widgetKey: WidgetKey) {
    const existingConfig = widgetConfigs.find((widget) => widget.widgetKey === widgetKey);

    if (!existingConfig) {
      return;
    }

    await updateWidgetConfig(existingConfig.id, {
      isEnabled: !existingConfig.isEnabled,
    });
    await loadDashboard(activeBudgetId, activeUserId);
  }

  if (!isReady) {
    return (
      <PageTransition>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Chargement du dashboard...</CardContent>
        </Card>
      </PageTransition>
    );
  }

  if (!summary) {
    return (
      <PageTransition>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Aucune donnee disponible.</CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {enabledWidgets.has("income-expense-summary") ? (
              <>
                <KpiCard
                  label="Solde du mois"
                  value={formatCurrencyAmount(summary.kpis.monthlyBalance, summary.kpis.currency)}
                  detail="Revenus moins depenses"
                  icon={Wallet}
                  tone={summary.kpis.monthlyBalance >= 0 ? "positive" : "critical"}
                />
                <KpiCard
                  label="Revenus totaux"
                  value={formatCurrencyAmount(summary.kpis.monthlyIncome, summary.kpis.currency)}
                  detail="Devise principale"
                  icon={ArrowDownRight}
                  tone="positive"
                />
                <KpiCard
                  label="Depenses totales"
                  value={formatCurrencyAmount(summary.kpis.monthlyExpense, summary.kpis.currency)}
                  detail="Mois courant"
                  icon={ArrowUpRight}
                  tone="neutral"
                />
              </>
            ) : null}
            {enabledWidgets.has("budget-progress") ? (
              <KpiCard
                label="Budget restant"
                value={formatCurrencyAmount(summary.kpis.budgetRemaining, summary.kpis.currency)}
                detail={`${Math.round(summary.kpis.budgetUsedPercent)}% utilise`}
                icon={PiggyBank}
                tone={summary.kpis.budgetRemaining >= 0 ? "positive" : "critical"}
              />
            ) : null}
          </div>
          <WidgetSettingsCard configs={widgetConfigs} onToggle={toggleWidget} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
          {enabledWidgets.has("monthly-balance") ? <TrendCard summary={summary} /> : null}
          {enabledWidgets.has("financial-health") ? <FinancialHealthCard summary={summary} /> : null}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {enabledWidgets.has("expense-category-breakdown") ? <CategoryBreakdownCard summary={summary} /> : null}
          {enabledWidgets.has("recent-transactions") ? <RecentTransactionsCard summary={summary} /> : null}
        </section>

        {enabledWidgets.has("goals-progress") ? <GoalsProgressCard summary={summary} /> : null}

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Budget actif: {summary.budget.name} - {activeUser?.name ?? "Utilisateur local"}
          </span>
          <label className="flex items-center gap-2">
            <span>Changer de budget</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              value={activeBudgetId}
              onChange={(event) => void loadDashboard(event.target.value, activeUserId)}
            >
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </PageTransition>
  );
}

function KpiCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: typeof Wallet;
  label: string;
  tone: "positive" | "critical" | "neutral";
  value: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border",
              tone === "positive" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
              tone === "critical" && "bg-destructive/10 text-destructive",
              tone === "neutral" && "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-normal">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function WidgetSettingsCard({
  configs,
  onToggle,
}: {
  configs: WidgetConfig[];
  onToggle: (widgetKey: WidgetKey) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Widgets</CardTitle>
        <CardDescription>Affichage configurable localement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {widgetDefinitions.map((definition) => {
          const config = configs.find((widget) => widget.widgetKey === definition.key);
          const isEnabled = config?.isEnabled ?? true;

          return (
            <button
              key={definition.key}
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              onClick={() => onToggle(definition.key)}
              disabled={!config}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{definition.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{definition.description}</span>
              </span>
              {isEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TrendCard({ summary }: { summary: DashboardSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Tendance mensuelle</CardTitle>
        <CardDescription>Revenus, depenses et solde sur six mois.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={44} />
              <Tooltip formatter={(value) => formatCurrencyAmount(Number(value ?? 0), summary.kpis.currency)} />
              <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={2} dot={false} name="Revenus" />
              <Line type="monotone" dataKey="expense" stroke="#2563eb" strokeWidth={2} dot={false} name="Depenses" />
              <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={2} dot={false} name="Solde" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryBreakdownCard({ summary }: { summary: DashboardSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Depenses par categorie</CardTitle>
        <CardDescription>Mois courant, devise principale.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={summary.categoryExpenses} dataKey="amount" nameKey="name" innerRadius={48} outerRadius={78}>
                {summary.categoryExpenses.map((category) => (
                  <Cell key={category.categoryId} fill={category.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrencyAmount(Number(value ?? 0), summary.kpis.currency)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {summary.categoryExpenses.length > 0 ? (
            summary.categoryExpenses.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="truncate">{category.name}</span>
                </span>
                <span className="font-medium">{formatCurrencyAmount(category.amount, summary.kpis.currency)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Aucune depense pour ce mois.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentTransactionsCard({ summary }: { summary: DashboardSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Transactions recentes</CardTitle>
        <CardDescription>Derniers mouvements du budget actif.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary.recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">{formatTransactionDate(transaction.date)}</p>
            </div>
            <div className={cn("shrink-0 text-sm font-semibold", transaction.type === "income" && "text-emerald-600")}>
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrencyAmount(transaction.amount, transaction.currency)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function GoalsProgressCard({ summary }: { summary: DashboardSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Progression des objectifs</CardTitle>
        <CardDescription>Objectifs financiers lies au budget actif.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {summary.goalProgress.length > 0 ? (
          summary.goalProgress.map((goal) => (
            <div key={goal.id} className="rounded-lg border p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{goal.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrencyAmount(goal.currentAmount, goal.currency)} /{" "}
                    {formatCurrencyAmount(goal.targetAmount, goal.currency)}
                  </p>
                </div>
                <Target className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </div>
              <Progress value={goal.progressPercent} />
              <p className="mt-2 text-xs text-muted-foreground">{Math.round(goal.progressPercent)}% atteint</p>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground md:col-span-2">
            Aucun objectif actif pour ce budget.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FinancialHealthCard({ summary }: { summary: DashboardSummary }) {
  const statusTone =
    summary.health.status === "Excellent"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      : summary.health.status === "Stable"
        ? "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
        : summary.health.status === "A surveiller"
          ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          : "bg-destructive/10 text-destructive";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Sante financiere</CardTitle>
            <CardDescription>Lecture rapide du mois courant.</CardDescription>
          </div>
          <Badge className={statusTone} variant="outline">
            {summary.health.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background">
            <Gauge className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-normal">
              {Math.round(summary.health.savingsRate)}%
            </p>
            <p className="text-sm text-muted-foreground">Taux d&apos;epargne estime</p>
          </div>
        </div>
        <HealthMetric label="Budget utilise" value={summary.health.budgetUsedPercent} />
        <HealthMetric label="Ratio depenses / revenus" value={summary.health.expenseIncomeRatio} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Solde net: {formatCurrencyAmount(summary.health.monthlyBalance, summary.kpis.currency)}
        </div>
      </CardContent>
    </Card>
  );
}

function HealthMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(value)}%</span>
      </div>
      <Progress value={Math.min(Math.max(value, 0), 100)} />
    </div>
  );
}
