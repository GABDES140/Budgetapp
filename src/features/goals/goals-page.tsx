"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Edit3, Plus, RotateCcw, Target, Trash2, Trophy } from "lucide-react";

import { PageTransition } from "@/components/layout/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORTED_CURRENCIES } from "@/lib/constants/currencies";
import { formatCurrencyAmount } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { createGoal, deleteGoal, getGoals, updateGoal } from "@/services/goal-service";
import { localBudgetAppDataService } from "@/services/local-data-service";
import type { Budget, EntityId, Goal, GoalStatus, User } from "@/types";

type GoalFormState = {
  name: string;
  targetAmount: string;
  currentAmount: string;
  currency: string;
  targetDate: string;
  description: string;
  status: GoalStatus;
};

function createEmptyForm(defaultCurrency = "CAD"): GoalFormState {
  return {
    name: "",
    targetAmount: "",
    currentAmount: "0",
    currency: defaultCurrency,
    targetDate: "",
    description: "",
    status: "active",
  };
}

export function GoalsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeBudgetId, setActiveBudgetId] = useState<EntityId>("");
  const [activeUserId, setActiveUserId] = useState<EntityId>("");
  const [editingGoalId, setEditingGoalId] = useState<EntityId | null>(null);
  const [form, setForm] = useState<GoalFormState>(createEmptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeBudget = budgets.find((budget) => budget.id === activeBudgetId);
  const activeUser = users.find((user) => user.id === activeUserId);

  const budgetGoals = useMemo(() => {
    return goals
      .filter((goal) => goal.budgetId === activeBudgetId)
      .sort((first, second) => {
        const firstProgress = getGoalProgress(first);
        const secondProgress = getGoalProgress(second);

        if (first.status !== second.status) {
          if (first.status === "active") {
            return -1;
          }

          if (second.status === "active") {
            return 1;
          }
        }

        return secondProgress - firstProgress;
      });
  }, [activeBudgetId, goals]);

  const groupedTotals = useMemo(() => {
    return budgetGoals.reduce<Record<string, { target: number; current: number }>>((totals, goal) => {
      totals[goal.currency] ??= { target: 0, current: 0 };
      totals[goal.currency].target += goal.targetAmount;
      totals[goal.currency].current += goal.currentAmount;
      return totals;
    }, {});
  }, [budgetGoals]);

  const completedGoalsCount = budgetGoals.filter((goal) => getGoalProgress(goal) >= 100 || goal.status === "completed").length;

  async function loadData(nextBudgetId?: EntityId) {
    const data = await localBudgetAppDataService.getData();
    const user = data.users.find((item) => item.id === activeUserId) ?? data.users[0];
    const budget =
      data.budgets.find((item) => item.id === nextBudgetId) ??
      data.budgets.find((item) => item.id === activeBudgetId) ??
      data.budgets.find((item) => item.ownerId === user?.id) ??
      data.budgets[0];

    if (!user || !budget) {
      setIsReady(true);
      return;
    }

    setUsers(data.users);
    setBudgets(data.budgets);
    setGoals(await getGoals());
    setActiveUserId(user.id);
    setActiveBudgetId(budget.id);
    setForm((current) => (editingGoalId ? current : createEmptyForm(budget.defaultCurrency ?? user.defaultCurrency)));
    setIsReady(true);
  }

  function updateForm(nextValues: Partial<GoalFormState>) {
    setForm((current) => ({ ...current, ...nextValues }));
    setFormError(null);
  }

  function resetForm() {
    setForm(createEmptyForm(activeBudget?.defaultCurrency ?? activeUser?.defaultCurrency ?? "CAD"));
    setEditingGoalId(null);
    setFormError(null);
  }

  function startEditing(goal: Goal) {
    setEditingGoalId(goal.id);
    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      currency: goal.currency,
      targetDate: goal.targetDate ?? "",
      description: goal.description ?? "",
      status: goal.status,
    });
    setFormError(null);
    setStatusMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setStatusMessage(null);

    if (!activeBudgetId) {
      setFormError("Aucun budget actif n'est disponible.");
      return;
    }

    const targetAmount = Number(form.targetAmount);
    const currentAmount = Number(form.currentAmount);

    if (!form.name.trim()) {
      setFormError("Ajoute un nom d'objectif.");
      return;
    }

    const nextStatus = targetAmount > 0 && currentAmount >= targetAmount ? "completed" : form.status;

    const input = {
      budgetId: activeBudgetId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      targetAmount,
      currentAmount,
      currency: form.currency,
      targetDate: form.targetDate || null,
      status: nextStatus,
    } satisfies Omit<Goal, "id" | "createdAt" | "updatedAt">;

    try {
      if (editingGoalId) {
        await updateGoal(editingGoalId, input);
        setStatusMessage("Objectif mis a jour.");
      } else {
        await createGoal(input);
        setStatusMessage("Objectif cree.");
      }

      await loadData(activeBudgetId);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "L'objectif n'a pas pu etre enregistre.");
    }
  }

  async function handleDelete(goalId: EntityId) {
    const shouldDelete = window.confirm("Supprimer cet objectif ?");

    if (!shouldDelete) {
      return;
    }

    await deleteGoal(goalId);
    await loadData(activeBudgetId);
    setStatusMessage("Objectif supprime.");

    if (editingGoalId === goalId) {
      resetForm();
    }
  }

  function handleBudgetChange(budgetId: EntityId) {
    setStatusMessage(null);
    resetForm();
    void loadData(budgetId);
  }

  if (!isReady) {
    return (
      <PageTransition>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Chargement des objectifs...</CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)]">
          <GoalFormCard
            form={form}
            formError={formError}
            isEditing={Boolean(editingGoalId)}
            onCancelEdit={resetForm}
            onSubmit={handleSubmit}
            onUpdateForm={updateForm}
            statusMessage={statusMessage}
          />
          <GoalsOverviewCard
            activeBudget={activeBudget}
            budgets={budgets}
            completedGoalsCount={completedGoalsCount}
            groupedTotals={groupedTotals}
            totalGoals={budgetGoals.length}
            onBudgetChange={handleBudgetChange}
          />
        </section>

        <GoalsListCard goals={budgetGoals} onDelete={handleDelete} onEdit={startEditing} />
      </div>
    </PageTransition>
  );
}

function GoalFormCard({
  form,
  formError,
  isEditing,
  onCancelEdit,
  onSubmit,
  onUpdateForm,
  statusMessage,
}: {
  form: GoalFormState;
  formError: string | null;
  isEditing: boolean;
  onCancelEdit: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateForm: (nextValues: Partial<GoalFormState>) => void;
  statusMessage: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{isEditing ? "Modifier un objectif" : "Nouvel objectif"}</CardTitle>
            <CardDescription>Definis une cible, suis le montant actuel et garde une lecture claire de l&apos;avancement.</CardDescription>
          </div>
          {isEditing ? <Badge variant="secondary">Edition</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="Nom">
            <Input value={form.name} placeholder="Fonds d'urgence, voyage, renovation..." onChange={(event) => onUpdateForm({ name: event.target.value })} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
            <Field label="Montant cible">
              <Input
                min="0"
                step="0.01"
                inputMode="decimal"
                type="number"
                value={form.targetAmount}
                placeholder="0.00"
                onChange={(event) => onUpdateForm({ targetAmount: event.target.value })}
              />
            </Field>
            <Field label="Montant actuel">
              <Input
                min="0"
                step="0.01"
                inputMode="decimal"
                type="number"
                value={form.currentAmount}
                placeholder="0.00"
                onChange={(event) => onUpdateForm({ currentAmount: event.target.value })}
              />
            </Field>
            <Field label="Devise">
              <select className={selectClassName} value={form.currency} onChange={(event) => onUpdateForm({ currency: event.target.value })}>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
            <Field label="Date cible">
              <Input type="date" value={form.targetDate} onChange={(event) => onUpdateForm({ targetDate: event.target.value })} />
            </Field>
            <Field label="Statut">
              <select className={selectClassName} value={form.status} onChange={(event) => onUpdateForm({ status: event.target.value as GoalStatus })}>
                <option value="active">Actif</option>
                <option value="completed">Complete</option>
                <option value="archived">Archive</option>
              </select>
            </Field>
          </div>

          <Field label="Description">
            <Textarea value={form.description} placeholder="Contexte ou motivation facultative" onChange={(event) => onUpdateForm({ description: event.target.value })} />
          </Field>

          {form.targetAmount && Number(form.targetAmount) > 0 ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Apercu de progression</span>
                <span className="font-medium">{Math.round(getProgressFromValues(form.currentAmount, form.targetAmount))}%</span>
              </div>
              <Progress value={getProgressFromValues(form.currentAmount, form.targetAmount)} />
            </div>
          ) : null}

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button className="flex-1 sm:flex-none" type="submit">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {isEditing ? "Enregistrer" : "Creer l'objectif"}
            </Button>
            {isEditing ? (
              <Button type="button" variant="outline" onClick={onCancelEdit}>
                Annuler
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function GoalsOverviewCard({
  activeBudget,
  budgets,
  completedGoalsCount,
  groupedTotals,
  totalGoals,
  onBudgetChange,
}: {
  activeBudget?: Budget;
  budgets: Budget[];
  completedGoalsCount: number;
  groupedTotals: Record<string, { current: number; target: number }>;
  totalGoals: number;
  onBudgetChange: (budgetId: EntityId) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="grid gap-3 sm:grid-cols-[1fr_15rem] sm:items-start">
          <div>
            <CardTitle className="text-xl">Progression</CardTitle>
            <CardDescription>Vue d&apos;ensemble du budget actif et des objectifs suivis dans le dashboard.</CardDescription>
          </div>
          <Field label="Budget">
            <select className={selectClassName} value={activeBudget?.id ?? ""} onChange={(event) => onBudgetChange(event.target.value)}>
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <OverviewStat label="Objectifs" value={String(totalGoals)} icon={Target} />
          <OverviewStat label="Completes" value={String(completedGoalsCount)} icon={Trophy} tone="positive" />
          <OverviewStat
            label="En cours"
            value={String(Math.max(totalGoals - completedGoalsCount, 0))}
            icon={RotateCcw}
            tone="neutral"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(groupedTotals).length > 0 ? (
            Object.entries(groupedTotals).map(([currency, totals]) => {
              const progress = totals.target > 0 ? Math.min((totals.current / totals.target) * 100, 100) : 0;

              return (
                <div key={currency} className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <Badge variant="outline">{currency}</Badge>
                    <span className="text-xs text-muted-foreground">{Math.round(progress)}% atteint</span>
                  </div>
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground">
                      {formatCurrencyAmount(totals.current, currency)} / {formatCurrencyAmount(totals.target, currency)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground md:col-span-2">
              Aucun objectif sur ce budget pour le moment.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GoalsListCard({
  goals,
  onDelete,
  onEdit,
}: {
  goals: Goal[];
  onDelete: (goalId: EntityId) => void;
  onEdit: (goal: Goal) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Liste des objectifs</CardTitle>
        <CardDescription>Chaque objectif est suivi individuellement et alimente aussi la section objectifs du dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progress = getGoalProgress(goal);
            const statusTone =
              goal.status === "completed" || progress >= 100
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : goal.status === "archived"
                  ? "bg-muted text-muted-foreground"
                  : "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300";

            return (
              <div key={goal.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{goal.name}</p>
                      <Badge className={statusTone} variant="outline">
                        {progress >= 100 ? "Complete" : goal.status === "active" ? "Actif" : "Archive"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatCurrencyAmount(goal.currentAmount, goal.currency)} / {formatCurrencyAmount(goal.targetAmount, goal.currency)}
                    </p>
                    {goal.description ? <p className="mt-2 text-sm text-muted-foreground">{goal.description}</p> : null}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">Avancement</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-2 lg:w-40">
                    {goal.targetDate ? (
                      <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                        Echeance: {formatGoalDate(goal.targetDate)}
                      </div>
                    ) : null}
                    <Button type="button" variant="outline" onClick={() => onEdit(goal)}>
                      <Edit3 className="h-4 w-4" aria-hidden="true" />
                      Modifier
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onDelete(goal.id)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Aucun objectif configure pour ce budget.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OverviewStat({
  icon: Icon,
  label,
  tone = "neutral",
  value,
}: {
  icon: typeof Target;
  label: string;
  tone?: "neutral" | "positive";
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div
        className={cn(
          "mb-3 flex h-9 w-9 items-center justify-center rounded-md border",
          tone === "positive" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
          tone === "neutral" && "bg-background text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function getGoalProgress(goal: Pick<Goal, "currentAmount" | "targetAmount">) {
  if (goal.targetAmount <= 0) {
    return 0;
  }

  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
}

function getProgressFromValues(currentAmount: string, targetAmount: string) {
  const current = Number(currentAmount);
  const target = Number(targetAmount);

  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) {
    return 0;
  }

  return Math.min((current / target) * 100, 100);
}

function formatGoalDate(date: string) {
  return new Intl.DateTimeFormat("fr-CA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
