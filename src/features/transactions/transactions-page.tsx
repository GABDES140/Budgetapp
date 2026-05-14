"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Edit3,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { PageTransition } from "@/components/layout/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORTED_CURRENCIES } from "@/lib/constants/currencies";
import { formatCurrencyAmount, formatTransactionDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { localBudgetAppDataService } from "@/services/local-data-service";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/services/transaction-service";
import type {
  Budget,
  Category,
  CreateTransactionInput,
  EntityId,
  Subcategory,
  Transaction,
  TransactionType,
  User,
} from "@/types";

type TransactionFormState = {
  type: TransactionType;
  amount: string;
  currency: string;
  date: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  notes: string;
  isRecurring: boolean;
};

type TransactionFilters = {
  search: string;
  type: "all" | TransactionType;
  categoryId: "all" | EntityId;
  subcategoryId: "all" | EntityId;
  currency: "all" | string;
  dateFrom: string;
  dateTo: string;
};

const emptyFilters: TransactionFilters = {
  search: "",
  type: "all",
  categoryId: "all",
  subcategoryId: "all",
  currency: "all",
  dateFrom: "",
  dateTo: "",
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyForm(defaultCurrency = "CAD"): TransactionFormState {
  return {
    type: "expense",
    amount: "",
    currency: defaultCurrency,
    date: getToday(),
    description: "",
    categoryId: "",
    subcategoryId: "",
    notes: "",
    isRecurring: false,
  };
}

function createDefaultForm(
  categories: Category[],
  budget?: Budget,
  user?: User,
  type: TransactionType = "expense",
): TransactionFormState {
  const category = categories.find((item) => {
    return (item.budgetId === null || item.budgetId === budget?.id) && (item.type === type || item.type === "both");
  });

  return {
    ...createEmptyForm(budget?.defaultCurrency ?? user?.defaultCurrency ?? "CAD"),
    type,
    categoryId: category?.id ?? "",
  };
}

export function TransactionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [activeBudgetId, setActiveBudgetId] = useState<EntityId>("");
  const [activeUserId, setActiveUserId] = useState<EntityId>("");
  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);
  const [form, setForm] = useState<TransactionFormState>(createEmptyForm());
  const [editingTransactionId, setEditingTransactionId] = useState<EntityId | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  const activeBudget = budgets.find((budget) => budget.id === activeBudgetId);
  const activeUser = users.find((user) => user.id === activeUserId);

  const budgetTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.budgetId === activeBudgetId)
      .sort((first, second) => second.date.localeCompare(first.date));
  }, [activeBudgetId, transactions]);

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => category.budgetId === null || category.budgetId === activeBudgetId);
  }, [activeBudgetId, categories]);

  const formCategories = useMemo(() => {
    return visibleCategories.filter((category) => category.type === form.type || category.type === "both");
  }, [form.type, visibleCategories]);

  const formSubcategories = useMemo(() => {
    return subcategories.filter((subcategory) => subcategory.categoryId === form.categoryId);
  }, [form.categoryId, subcategories]);

  const currenciesInBudget = useMemo(() => {
    return Array.from(new Set(budgetTransactions.map((transaction) => transaction.currency))).sort();
  }, [budgetTransactions]);

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  const subcategoryById = useMemo(() => {
    return new Map(subcategories.map((subcategory) => [subcategory.id, subcategory]));
  }, [subcategories]);

  const filteredTransactions = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return budgetTransactions.filter((transaction) => {
      const category = categoryById.get(transaction.categoryId);
      const subcategory = transaction.subcategoryId ? subcategoryById.get(transaction.subcategoryId) : null;
      const searchableText = [
        transaction.description,
        transaction.notes,
        category?.name,
        subcategory?.name,
        transaction.currency,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!searchValue || searchableText.includes(searchValue)) &&
        (filters.type === "all" || transaction.type === filters.type) &&
        (filters.categoryId === "all" || transaction.categoryId === filters.categoryId) &&
        (filters.subcategoryId === "all" || transaction.subcategoryId === filters.subcategoryId) &&
        (filters.currency === "all" || transaction.currency === filters.currency) &&
        (!filters.dateFrom || transaction.date >= filters.dateFrom) &&
        (!filters.dateTo || transaction.date <= filters.dateTo)
      );
    });
  }, [budgetTransactions, categoryById, filters, subcategoryById]);

  const totalsByCurrency = useMemo(() => {
    return filteredTransactions.reduce<Record<string, { income: number; expense: number; count: number }>>(
      (totals, transaction) => {
        totals[transaction.currency] ??= { income: 0, expense: 0, count: 0 };
        totals[transaction.currency].count += 1;
        totals[transaction.currency][transaction.type] += transaction.amount;
        return totals;
      },
      {},
    );
  }, [filteredTransactions]);

  async function loadData() {
    const data = await localBudgetAppDataService.getData();
    const defaultUser = data.users[0];
    const defaultBudget = data.budgets.find((budget) => budget.ownerId === defaultUser?.id) ?? data.budgets[0];

    setUsers(data.users);
    setBudgets(data.budgets);
    setTransactions(data.transactions);
    setCategories(data.categories);
    setSubcategories(data.subcategories);
    setActiveUserId((current) => current || defaultUser?.id || "");
    setActiveBudgetId((current) => current || defaultBudget?.id || "");
    setForm((current) => {
      if (current.categoryId) {
        return current;
      }

      return createDefaultForm(data.categories, defaultBudget, defaultUser);
    });
    setIsReady(true);
  }

  function updateForm(nextValues: Partial<TransactionFormState>) {
    setForm((current) => ({ ...current, ...nextValues }));
    setFormError(null);
  }

  function handleTypeChange(type: TransactionType) {
    const nextCategory = visibleCategories.find((category) => category.type === type || category.type === "both");

    updateForm({
      type,
      categoryId: nextCategory?.id ?? "",
      subcategoryId: "",
    });
  }

  function resetForm(nextType: TransactionType = "expense") {
    setForm(createDefaultForm(visibleCategories, activeBudget, activeUser, nextType));
    setEditingTransactionId(null);
    setIsAdvancedOpen(false);
    setFormError(null);
  }

  function handleBudgetChange(budgetId: EntityId) {
    const nextBudget = budgets.find((budget) => budget.id === budgetId);
    const nextCategories = categories.filter((category) => category.budgetId === null || category.budgetId === budgetId);

    setActiveBudgetId(budgetId);
    setFilters(emptyFilters);
    setForm(createDefaultForm(nextCategories, nextBudget, activeUser));
    setEditingTransactionId(null);
    setIsAdvancedOpen(false);
  }

  function startEditing(transaction: Transaction) {
    setEditingTransactionId(transaction.id);
    setForm({
      type: transaction.type,
      amount: String(transaction.amount),
      currency: transaction.currency,
      date: transaction.date,
      description: transaction.description,
      categoryId: transaction.categoryId,
      subcategoryId: transaction.subcategoryId ?? "",
      notes: transaction.notes ?? "",
      isRecurring: transaction.isRecurring,
    });
    setIsAdvancedOpen(Boolean(transaction.notes || transaction.subcategoryId || transaction.isRecurring));
    setFormError(null);
    setStatusMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setStatusMessage(null);

    if (!activeBudgetId || !activeUserId) {
      setFormError("Aucun budget ou utilisateur actif n'est disponible.");
      return;
    }

    const amount = Number(form.amount);

    if (!form.description.trim()) {
      setFormError("Ajoute une courte description.");
      return;
    }

    const input: CreateTransactionInput = {
      budgetId: activeBudgetId,
      userId: activeUserId,
      type: form.type,
      amount,
      currency: form.currency,
      date: form.date,
      description: form.description.trim(),
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || null,
      notes: form.notes.trim() || null,
      isRecurring: form.isRecurring,
      recurringRuleId: null,
    };

    try {
      if (editingTransactionId) {
        await updateTransaction(editingTransactionId, input);
        setStatusMessage("Transaction mise a jour.");
      } else {
        await createTransaction(input);
        setStatusMessage(form.type === "expense" ? "Depense ajoutee." : "Revenu ajoute.");
      }

      await loadData();
      resetForm(form.type);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "La transaction n'a pas pu etre enregistree.");
    }
  }

  async function handleDelete(transactionId: EntityId) {
    const shouldDelete = window.confirm("Supprimer cette transaction ?");

    if (!shouldDelete) {
      return;
    }

    await deleteTransaction(transactionId);
    await loadData();
    setStatusMessage("Transaction supprimee.");

    if (editingTransactionId === transactionId) {
      resetForm();
    }
  }

  function resetFilters() {
    setFilters(emptyFilters);
  }

  if (!isReady) {
    return (
      <PageTransition>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Chargement des transactions...</CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <TransactionFormCard
            form={form}
            formCategories={formCategories}
            formSubcategories={formSubcategories}
            formError={formError}
            isAdvancedOpen={isAdvancedOpen}
            isEditing={Boolean(editingTransactionId)}
            statusMessage={statusMessage}
            onAdvancedChange={setIsAdvancedOpen}
            onCancelEdit={() => resetForm(form.type)}
            onCategoryChange={(categoryId) => updateForm({ categoryId, subcategoryId: "" })}
            onSubmit={handleSubmit}
            onTypeChange={handleTypeChange}
            onUpdateForm={updateForm}
          />
          <SummaryCard
            activeBudget={activeBudget}
            budgets={budgets}
            filteredCount={filteredTransactions.length}
            totalCount={budgetTransactions.length}
            totalsByCurrency={totalsByCurrency}
            onBudgetChange={handleBudgetChange}
          />
        </section>

        <FiltersCard
          categories={visibleCategories}
          currencies={currenciesInBudget}
          filters={filters}
          subcategories={subcategories}
          onFiltersChange={setFilters}
          onReset={resetFilters}
        />

        <TransactionListCard
          categories={categories}
          subcategories={subcategories}
          transactions={filteredTransactions}
          onDelete={handleDelete}
          onEdit={startEditing}
        />
      </div>
    </PageTransition>
  );
}

type TransactionFormCardProps = {
  form: TransactionFormState;
  formCategories: Category[];
  formSubcategories: Subcategory[];
  formError: string | null;
  isAdvancedOpen: boolean;
  isEditing: boolean;
  statusMessage: string | null;
  onAdvancedChange: (isOpen: boolean) => void;
  onCancelEdit: () => void;
  onCategoryChange: (categoryId: EntityId) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTypeChange: (type: TransactionType) => void;
  onUpdateForm: (nextValues: Partial<TransactionFormState>) => void;
};

function TransactionFormCard({
  form,
  formCategories,
  formSubcategories,
  formError,
  isAdvancedOpen,
  isEditing,
  statusMessage,
  onAdvancedChange,
  onCancelEdit,
  onCategoryChange,
  onSubmit,
  onTypeChange,
  onUpdateForm,
}: TransactionFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{isEditing ? "Modifier une transaction" : "Saisie rapide"}</CardTitle>
            <CardDescription>Revenu ou depense en quelques champs, avec details optionnels.</CardDescription>
          </div>
          {isEditing ? <Badge variant="secondary">Edition</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={form.type === "expense" ? "default" : "outline"}
              onClick={() => onTypeChange("expense")}
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              Depense
            </Button>
            <Button
              type="button"
              variant={form.type === "income" ? "default" : "outline"}
              onClick={() => onTypeChange("income")}
            >
              <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
              Revenu
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <Field label="Montant">
              <Input
                min="0"
                step="0.01"
                inputMode="decimal"
                type="number"
                value={form.amount}
                placeholder="0.00"
                onChange={(event) => onUpdateForm({ amount: event.target.value })}
              />
            </Field>
            <Field label="Devise">
              <select
                className={selectClassName}
                value={form.currency}
                onChange={(event) => onUpdateForm({ currency: event.target.value })}
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <Input
              value={form.description}
              placeholder={form.type === "expense" ? "Epicerie, loyer, abonnement..." : "Salaire, freelance..."}
              onChange={(event) => onUpdateForm({ description: event.target.value })}
            />
          </Field>

          <Field label="Categorie">
            <select
              className={selectClassName}
              value={form.categoryId}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              <option value="">Choisir une categorie</option>
              {formCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onAdvancedChange(!isAdvancedOpen)}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Details avances
            </Button>
            {isEditing ? (
              <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit}>
                Annuler
              </Button>
            ) : null}
          </div>

          {isAdvancedOpen ? (
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Date">
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(event) => onUpdateForm({ date: event.target.value })}
                  />
                </Field>
                <Field label="Sous-categorie">
                  <select
                    className={selectClassName}
                    value={form.subcategoryId}
                    onChange={(event) => onUpdateForm({ subcategoryId: event.target.value })}
                  >
                    <option value="">Aucune</option>
                    {formSubcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Note">
                <Textarea
                  value={form.notes}
                  placeholder="Contexte facultatif"
                  onChange={(event) => onUpdateForm({ notes: event.target.value })}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(event) => onUpdateForm({ isRecurring: event.target.checked })}
                />
                Transaction recurrente
              </label>
            </div>
          ) : null}

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          {statusMessage ? <p className="text-sm text-muted-foreground">{statusMessage}</p> : null}

          <Button className="w-full" type="submit">
            <Plus className="h-4 w-4" aria-hidden="true" />
            {isEditing ? "Enregistrer" : form.type === "expense" ? "Ajouter la depense" : "Ajouter le revenu"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

type SummaryCardProps = {
  activeBudget?: Budget;
  budgets: Budget[];
  filteredCount: number;
  totalCount: number;
  totalsByCurrency: Record<string, { income: number; expense: number; count: number }>;
  onBudgetChange: (budgetId: EntityId) => void;
};

function SummaryCard({
  activeBudget,
  budgets,
  filteredCount,
  totalCount,
  totalsByCurrency,
  onBudgetChange,
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="grid gap-3 sm:grid-cols-[1fr_15rem] sm:items-start">
          <div>
            <CardTitle className="text-xl">Transactions</CardTitle>
            <CardDescription>
              {filteredCount} transaction{filteredCount > 1 ? "s" : ""} affichee{filteredCount > 1 ? "s" : ""} sur{" "}
              {totalCount}.
            </CardDescription>
          </div>
          <Field label="Budget">
            <select
              className={selectClassName}
              value={activeBudget?.id ?? ""}
              onChange={(event) => onBudgetChange(event.target.value)}
            >
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(totalsByCurrency).length > 0 ? (
            Object.entries(totalsByCurrency).map(([currency, totals]) => (
              <div key={currency} className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Badge variant="outline">{currency}</Badge>
                  <span className="text-xs text-muted-foreground">{totals.count} lignes</span>
                </div>
                <div className="space-y-2 text-sm">
                  <SummaryLine label="Revenus" value={formatCurrencyAmount(totals.income, currency)} tone="income" />
                  <SummaryLine label="Depenses" value={formatCurrencyAmount(totals.expense, currency)} tone="expense" />
                  <SummaryLine
                    label="Solde"
                    value={formatCurrencyAmount(totals.income - totals.expense, currency)}
                    tone={totals.income - totals.expense >= 0 ? "income" : "expense"}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground md:col-span-3">
              Aucun total a afficher pour les filtres actifs.
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Les montants de devises differentes sont conserves separement, sans conversion automatique.
        </p>
      </CardContent>
    </Card>
  );
}

type FiltersCardProps = {
  categories: Category[];
  currencies: string[];
  filters: TransactionFilters;
  subcategories: Subcategory[];
  onFiltersChange: (filters: TransactionFilters) => void;
  onReset: () => void;
};

function FiltersCard({ categories, currencies, filters, subcategories, onFiltersChange, onReset }: FiltersCardProps) {
  const filteredSubcategories = subcategories.filter((subcategory) => {
    return filters.categoryId === "all" || subcategory.categoryId === filters.categoryId;
  });

  function updateFilters(nextFilters: Partial<TransactionFilters>) {
    onFiltersChange({ ...filters, ...nextFilters });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_repeat(5,minmax(0,0.8fr))_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={filters.search}
              placeholder="Rechercher"
              onChange={(event) => updateFilters({ search: event.target.value })}
            />
          </div>
          <select
            className={selectClassName}
            value={filters.type}
            onChange={(event) => updateFilters({ type: event.target.value as TransactionFilters["type"] })}
          >
            <option value="all">Tous les types</option>
            <option value="expense">Depenses</option>
            <option value="income">Revenus</option>
          </select>
          <select
            className={selectClassName}
            value={filters.categoryId}
            onChange={(event) => updateFilters({ categoryId: event.target.value, subcategoryId: "all" })}
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
            value={filters.subcategoryId}
            onChange={(event) => updateFilters({ subcategoryId: event.target.value })}
          >
            <option value="all">Sous-categories</option>
            {filteredSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          <select
            className={selectClassName}
            value={filters.currency}
            onChange={(event) => updateFilters({ currency: event.target.value })}
          >
            <option value="all">Toutes devises</option>
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilters({ dateFrom: event.target.value })}
            />
            <Input type="date" value={filters.dateTo} onChange={(event) => updateFilters({ dateTo: event.target.value })} />
          </div>
          <Button type="button" variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Effacer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type TransactionListCardProps = {
  categories: Category[];
  subcategories: Subcategory[];
  transactions: Transaction[];
  onDelete: (transactionId: EntityId) => void;
  onEdit: (transaction: Transaction) => void;
};

function TransactionListCard({
  categories,
  subcategories,
  transactions,
  onDelete,
  onEdit,
}: TransactionListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Liste</CardTitle>
        <CardDescription>Transactions triees par date recente.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length > 0 ? (
          <div className="divide-y">
            {transactions.map((transaction) => {
              const category = categories.find((item) => item.id === transaction.categoryId);
              const subcategory = subcategories.find((item) => item.id === transaction.subcategoryId);

              return (
                <div
                  key={transaction.id}
                  className="grid gap-3 p-4 transition-colors hover:bg-muted/40 md:grid-cols-[minmax(0,1.2fr)_10rem_8rem_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate font-medium">{transaction.description}</span>
                      <Badge variant={transaction.type === "income" ? "secondary" : "muted"}>
                        {transaction.type === "income" ? "Revenu" : "Depense"}
                      </Badge>
                      {transaction.isRecurring ? <Badge variant="outline">Recurrente</Badge> : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{formatTransactionDate(transaction.date)}</span>
                      <span>{category?.name ?? "Categorie inconnue"}</span>
                      {subcategory ? <span>{subcategory.name}</span> : null}
                    </div>
                    {transaction.notes ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{transaction.notes}</p>
                    ) : null}
                  </div>
                  <div
                    className={cn(
                      "text-base font-semibold md:text-right",
                      transaction.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrencyAmount(transaction.amount, transaction.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground md:text-right">{transaction.currency}</div>
                  <div className="flex items-center gap-2 md:justify-end">
                    <Button type="button" variant="outline" size="icon" onClick={() => onEdit(transaction)}>
                      <Edit3 className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => onDelete(transaction.id)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Aucune transaction ne correspond aux filtres actifs.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type FieldProps = {
  children: ReactNode;
  label: string;
};

function Field({ children, label }: FieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SummaryLine({ label, value, tone }: { label: string; value: string; tone: "income" | "expense" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", tone === "income" && "text-emerald-600 dark:text-emerald-400")}>{value}</span>
    </div>
  );
}

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
