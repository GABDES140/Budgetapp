"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarRange,
  Eye,
  EyeOff,
  Filter,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SUPPORTED_CURRENCIES } from "@/lib/constants/currencies";
import { formatCurrencyAmount } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  getAnalyticsSummary,
  type AnalyticsFilters,
  type AnalyticsIndicatorKey,
  type AnalyticsKpiCard,
  type AnalyticsSummary,
} from "@/services/analytics-service";
import { localBudgetAppDataService } from "@/services/local-data-service";
import type { Budget, Category, FinancialIndicatorPreference } from "@/types";

type IndicatorDefinition = {
  key: AnalyticsIndicatorKey;
  label: string;
  description: string;
};

const indicatorDefinitions: IndicatorDefinition[] = [
  {
    key: "net-balance",
    label: "Solde net",
    description: "Lecture rapide du mois actif",
  },
  {
    key: "savings-rate",
    label: "Taux d'epargne",
    description: "Part des revenus conserves",
  },
  {
    key: "expense-income-ratio",
    label: "Ratio depenses / revenus",
    description: "Equilibre mensuel",
  },
  {
    key: "budget-used",
    label: "Budget utilise",
    description: "Progression sur la limite",
  },
  {
    key: "expense-change-monthly",
    label: "Variation mensuelle",
    description: "Evolution des depenses",
  },
];

const emptyFilters: AnalyticsFilters = {
  budgetId: "",
  userId: "",
  currency: "all",
  type: "all",
  categoryId: "all",
  dateFrom: "",
  dateTo: "",
};

export function AnalyticsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<AnalyticsFilters>(emptyFilters);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [preferences, setPreferences] = useState<FinancialIndicatorPreference[]>([]);
  const [isReady, setIsReady] = useState(false);

  const activeBudget = useMemo(() => budgets.find((budget) => budget.id === filters.budgetId), [budgets, filters.budgetId]);

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => category.budgetId === null || category.budgetId === filters.budgetId);
  }, [categories, filters.budgetId]);

  async function buildAnalyticsState(nextFilters?: Partial<AnalyticsFilters>) {
    let data = await localBudgetAppDataService.getData();
    const user = data.users.find((item) => item.id === nextFilters?.userId) ?? data.users[0];
    const budget =
      data.budgets.find((item) => item.id === nextFilters?.budgetId) ??
      data.budgets.find((item) => item.ownerId === user?.id) ??
      data.budgets[0];

    if (!user || !budget) {
      return null;
    }

    const mergedFilters: AnalyticsFilters = {
      ...emptyFilters,
      ...filters,
      ...nextFilters,
      userId: (nextFilters?.userId ?? filters.userId) || user.id,
      budgetId: (nextFilters?.budgetId ?? filters.budgetId) || budget.id,
    };

    const missingPreferences = indicatorDefinitions.filter((definition) => {
      return !data.financialIndicatorPreferences.some((preference) => {
        return (
          preference.userId === mergedFilters.userId &&
          preference.budgetId === mergedFilters.budgetId &&
          preference.indicatorKey === definition.key
        );
      });
    });

    for (const definition of missingPreferences) {
      await localBudgetAppDataService.createFinancialIndicatorPreference({
        userId: mergedFilters.userId,
        budgetId: mergedFilters.budgetId,
        indicatorKey: definition.key,
        isEnabled: definition.key !== "expense-change-monthly",
        config: {},
      });
    }

    if (missingPreferences.length > 0) {
      data = await localBudgetAppDataService.getData();
    }

    const nextSummary = getAnalyticsSummary(data, {
      filters: mergedFilters,
      currentDate: new Date("2026-05-14T12:00:00.000Z"),
    });

    return {
      budgets: data.budgets,
      categories: data.categories,
      filters: mergedFilters,
      summary: nextSummary,
      preferences: nextSummary.indicatorPreferences,
    };
  }

  async function loadAnalytics(nextFilters?: Partial<AnalyticsFilters>) {
    const nextState = await buildAnalyticsState(nextFilters);

    if (!nextState) {
      setIsReady(true);
      return;
    }

    setBudgets(nextState.budgets);
    setCategories(nextState.categories);
    setFilters(nextState.filters);
    setSummary(nextState.summary);
    setPreferences(nextState.preferences);
    setIsReady(true);
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const nextState = await buildAnalyticsState();

      if (!isMounted) {
        return;
      }

      if (!nextState) {
        setIsReady(true);
        return;
      }

      setBudgets(nextState.budgets);
      setCategories(nextState.categories);
      setFilters(nextState.filters);
      setSummary(nextState.summary);
      setPreferences(nextState.preferences);
      setIsReady(true);
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFiltersChange(nextValues: Partial<AnalyticsFilters>) {
    await loadAnalytics({ ...filters, ...nextValues });
  }

  async function toggleIndicator(indicatorKey: AnalyticsIndicatorKey) {
    const preference = preferences.find((item) => item.indicatorKey === indicatorKey);

    if (!preference) {
      return;
    }

    await localBudgetAppDataService.updateFinancialIndicatorPreference(preference.id, {
      isEnabled: !preference.isEnabled,
    });
    await loadAnalytics();
  }

  if (!isReady) {
    return (
      <PageTransition>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Chargement des analytics...</CardContent>
        </Card>
      </PageTransition>
    );
  }

  if (!summary) {
    return (
      <PageTransition>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Aucune donnee analytique disponible.</CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.85fr)]">
          <AnalyticsHeroCard budget={summary.budget} transactionCount={summary.filteredTransactionCount} />
          <IndicatorSettingsCard preferences={preferences} onToggle={toggleIndicator} />
        </section>

        <AnalyticsFiltersCard
          activeBudget={activeBudget}
          budgets={budgets}
          categories={visibleCategories}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summary.visibleIndicators.map((indicator) => (
            <IndicatorCard key={indicator.key} indicator={indicator} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <TrendChartCard currency={displayCurrency(filters.currency, activeBudget?.defaultCurrency)} summary={summary} />
          <MonthComparisonCard currency={displayCurrency(filters.currency, activeBudget?.defaultCurrency)} summary={summary} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <CategoryBreakdownCard currency={displayCurrency(filters.currency, activeBudget?.defaultCurrency)} summary={summary} />
          <YearComparisonCard currency={displayCurrency(filters.currency, activeBudget?.defaultCurrency)} summary={summary} />
        </section>
      </div>
    </PageTransition>
  );
}

function AnalyticsHeroCard({ budget, transactionCount }: { budget: Budget; transactionCount: number }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">Analytics</CardTitle>
            <CardDescription>Vue analytique du budget actif, avec comparaisons et indicateurs configurables.</CardDescription>
          </div>
          <Badge variant="outline">{budget.name}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <HeroStat icon={LineChartIcon} label="Tendance" value="6 mois" />
        <HeroStat icon={BarChart3} label="Comparaison" value="Mois / annee" />
        <HeroStat icon={PieChartIcon} label="Perimetre" value={`${transactionCount} lignes`} />
      </CardContent>
    </Card>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LineChartIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border bg-background text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function IndicatorSettingsCard({
  preferences,
  onToggle,
}: {
  preferences: FinancialIndicatorPreference[];
  onToggle: (indicatorKey: AnalyticsIndicatorKey) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Indicateurs</CardTitle>
        <CardDescription>Choisis les cartes visibles dans cette vue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {indicatorDefinitions.map((definition) => {
          const preference = preferences.find((item) => item.indicatorKey === definition.key);
          const isEnabled = preference?.isEnabled ?? true;

          return (
            <button
              key={definition.key}
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              onClick={() => onToggle(definition.key)}
              disabled={!preference}
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

function AnalyticsFiltersCard({
  activeBudget,
  budgets,
  categories,
  filters,
  onFiltersChange,
}: {
  activeBudget?: Budget;
  budgets: Budget[];
  categories: Category[];
  filters: AnalyticsFilters;
  onFiltersChange: (nextValues: Partial<AnalyticsFilters>) => Promise<void>;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-3 xl:grid-cols-[13rem_10rem_10rem_10rem_10rem_1fr_auto]">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              className={cn(selectClassName, "pl-9")}
              value={filters.budgetId}
              onChange={(event) => void onFiltersChange({ budgetId: event.target.value, categoryId: "all", currency: "all" })}
            >
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>
          </div>
          <select
            className={selectClassName}
            value={filters.type}
            onChange={(event) => void onFiltersChange({ type: event.target.value as AnalyticsFilters["type"] })}
          >
            <option value="all">Toutes lignes</option>
            <option value="expense">Depenses</option>
            <option value="income">Revenus</option>
          </select>
          <select
            className={selectClassName}
            value={filters.categoryId}
            onChange={(event) => void onFiltersChange({ categoryId: event.target.value })}
          >
            <option value="all">Toutes categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className={selectClassName}
            value={filters.currency}
            onChange={(event) => void onFiltersChange({ currency: event.target.value })}
          >
            <option value="all">Devise principale</option>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <QuickRangeSelect
            activeBudget={activeBudget}
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs text-muted-foreground">
              <span>Date debut</span>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(event) => void onFiltersChange({ dateFrom: event.target.value })}
              />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              <span>Date fin</span>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(event) => void onFiltersChange({ dateTo: event.target.value })}
              />
            </label>
          </div>
          <Button type="button" variant="outline" onClick={() => void onFiltersChange(emptyFilters)}>
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Reinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickRangeSelect({
  activeBudget,
  filters,
  onFiltersChange,
}: {
  activeBudget?: Budget;
  filters: AnalyticsFilters;
  onFiltersChange: (nextValues: Partial<AnalyticsFilters>) => Promise<void>;
}) {
  return (
    <label className="grid gap-1 text-xs text-muted-foreground">
      <span>Periode</span>
      <select
        className={selectClassName}
        value={getQuickRangeValue(filters)}
        onChange={(event) => {
          const value = event.target.value;
          const nextRange = resolveQuickRange(value);

          void onFiltersChange({
            budgetId: activeBudget?.id ?? filters.budgetId,
            dateFrom: nextRange.dateFrom,
            dateTo: nextRange.dateTo,
          });
        }}
      >
        <option value="custom">Personnalisee</option>
        <option value="current-month">Mois courant</option>
        <option value="last-90-days">90 derniers jours</option>
        <option value="year-to-date">Annee en cours</option>
      </select>
    </label>
  );
}

function IndicatorCard({ indicator }: { indicator: AnalyticsKpiCard }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{indicator.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-normal">
              {indicator.format === "currency"
                ? formatCurrencyAmount(indicator.value, indicator.currency)
                : `${Math.round(indicator.value)}%`}
            </p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md border",
              indicator.tone === "positive" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
              indicator.tone === "neutral" && "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
              indicator.tone === "warning" && "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
              indicator.tone === "critical" && "bg-destructive/10 text-destructive",
            )}
          >
            {indicator.value >= 0 ? (
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{indicator.detail}</p>
      </CardContent>
    </Card>
  );
}

function TrendChartCard({ currency, summary }: { currency: string; summary: AnalyticsSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Tendance mensuelle</CardTitle>
        <CardDescription>Line chart sur six mois pour revenus, depenses et solde.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={(value) => formatCurrencyAmount(Number(value ?? 0), currency)} />
              <Legend />
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

function MonthComparisonCard({ currency, summary }: { currency: string; summary: AnalyticsSummary }) {
  const data = [
    {
      period: summary.monthComparison.previousMonthLabel,
      revenus: summary.monthComparison.incomePrevious,
      depenses: summary.monthComparison.expensePrevious,
      solde: summary.monthComparison.balancePrevious,
    },
    {
      period: summary.monthComparison.currentMonthLabel,
      revenus: summary.monthComparison.incomeCurrent,
      depenses: summary.monthComparison.expenseCurrent,
      solde: summary.monthComparison.balanceCurrent,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Comparaison mois / mois</CardTitle>
            <CardDescription>Bar chart sur les deux derniers mois pertinents.</CardDescription>
          </div>
          <Badge variant="outline">
            {summary.monthComparison.expenseDeltaPercent === null
              ? "Nouveau"
              : `${Math.round(summary.monthComparison.expenseDeltaPercent)}%`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="period" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={(value) => formatCurrencyAmount(Number(value ?? 0), currency)} />
              <Legend />
              <Bar dataKey="revenus" fill="#16a34a" radius={[6, 6, 0, 0]} name="Revenus" />
              <Bar dataKey="depenses" fill="#2563eb" radius={[6, 6, 0, 0]} name="Depenses" />
              <Bar dataKey="solde" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Solde" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ComparisonStat label="Revenus" current={summary.monthComparison.incomeCurrent} previous={summary.monthComparison.incomePrevious} currency={currency} favorableWhen="higher" />
          <ComparisonStat label="Depenses" current={summary.monthComparison.expenseCurrent} previous={summary.monthComparison.expensePrevious} currency={currency} favorableWhen="lower" />
          <ComparisonStat label="Solde" current={summary.monthComparison.balanceCurrent} previous={summary.monthComparison.balancePrevious} currency={currency} favorableWhen="higher" />
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonStat({
  currency,
  current,
  favorableWhen,
  label,
  previous,
}: {
  currency: string;
  current: number;
  favorableWhen: "higher" | "lower";
  label: string;
  previous: number;
}) {
  const delta = current - previous;
  const isPositiveSignal = favorableWhen === "higher" ? delta >= 0 : delta <= 0;

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{formatCurrencyAmount(current, currency)}</p>
      <p className={cn("mt-1 text-xs", isPositiveSignal ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
        {delta >= 0 ? "+" : ""}
        {formatCurrencyAmount(delta, currency)} vs mois precedent
      </p>
    </div>
  );
}

function CategoryBreakdownCard({ currency, summary }: { currency: string; summary: AnalyticsSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Depenses par categorie</CardTitle>
        <CardDescription>Pie chart sur la selection active.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={summary.categoryBreakdown} dataKey="amount" nameKey="name" innerRadius={48} outerRadius={84}>
                {summary.categoryBreakdown.map((category) => (
                  <Cell key={category.categoryId} fill={category.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrencyAmount(Number(value ?? 0), currency)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {summary.categoryBreakdown.length > 0 ? (
            summary.categoryBreakdown.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="truncate">{category.name}</span>
                </span>
                <span className="font-medium">{formatCurrencyAmount(category.amount, currency)}</span>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Aucun poste de depense ne correspond aux filtres actifs.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function YearComparisonCard({ currency, summary }: { currency: string; summary: AnalyticsSummary }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Comparaison annee / mois</CardTitle>
            <CardDescription>Lecture par mois entre l&apos;annee active et l&apos;annee precedente.</CardDescription>
          </div>
          <Badge variant="outline">
            <CalendarRange className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            12 mois
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.yearComparison} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={48} />
              <Tooltip formatter={(value) => formatCurrencyAmount(Number(value ?? 0), currency)} />
              <Legend />
              <Bar dataKey="previousYear" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Annee precedente" />
              <Bar dataKey="currentYear" fill="#0f766e" radius={[6, 6, 0, 0]} name="Annee active" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function getQuickRangeValue(filters: AnalyticsFilters) {
  if (filters.dateFrom === "2026-05-01" && filters.dateTo === "2026-05-31") {
    return "current-month";
  }

  if (filters.dateFrom === "2026-02-13" && filters.dateTo === "2026-05-14") {
    return "last-90-days";
  }

  if (filters.dateFrom === "2026-01-01" && filters.dateTo === "2026-05-14") {
    return "year-to-date";
  }

  return "custom";
}

function resolveQuickRange(value: string) {
  switch (value) {
    case "current-month":
      return {
        dateFrom: "2026-05-01",
        dateTo: "2026-05-31",
      };
    case "last-90-days":
      return {
        dateFrom: "2026-02-13",
        dateTo: "2026-05-14",
      };
    case "year-to-date":
      return {
        dateFrom: "2026-01-01",
        dateTo: "2026-05-14",
      };
    default:
      return {
        dateFrom: "",
        dateTo: "",
      };
  }
}

function displayCurrency(currency: AnalyticsFilters["currency"], fallbackCurrency?: string) {
  return currency === "all" ? fallbackCurrency ?? "CAD" : currency;
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
