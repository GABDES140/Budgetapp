export type ThemePreference = "light" | "dark" | "system";
export type BudgetType = "personal" | "shared";
export type BudgetRole = "owner" | "member";
export type InvitationStatus = "pending" | "accepted" | "expired";
export type TransactionType = "income" | "expense";
export type CategoryType = "income" | "expense" | "both";
export type RecurringFrequency = "weekly" | "monthly" | "yearly";
export type GoalStatus = "active" | "completed" | "archived";
export type ImportBatchStatus = "pending" | "imported" | "failed";
export type EntityId = string;
export type CurrencyCode = string;
export type ISODateString = string;
export type ISODateTimeString = string;
export type WidgetKey =
  | "monthly-balance"
  | "income-expense-summary"
  | "budget-progress"
  | "expense-category-breakdown"
  | "recent-transactions"
  | "goals-progress"
  | "financial-health";

export interface TimestampedEntity {
  id: EntityId;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface User extends TimestampedEntity {
  name: string;
  email: string;
  passwordHash: string;
  defaultCurrency: CurrencyCode;
  theme: ThemePreference;
}

export interface Budget extends TimestampedEntity {
  name: string;
  type: BudgetType;
  monthlyLimit: number;
  defaultCurrency: CurrencyCode;
  ownerId: EntityId;
}

export interface BudgetMember {
  id: EntityId;
  budgetId: EntityId;
  userId: EntityId;
  role: BudgetRole;
  joinedAt: ISODateTimeString;
}

export interface Invitation {
  id: EntityId;
  budgetId: EntityId;
  email: string;
  status: InvitationStatus;
  token: string;
  createdBy: EntityId;
  createdAt: ISODateTimeString;
  expiresAt: ISODateTimeString;
}

export interface Transaction extends TimestampedEntity {
  budgetId: EntityId;
  userId: EntityId;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  date: ISODateString;
  description: string;
  categoryId: EntityId;
  subcategoryId: EntityId | null;
  notes: string | null;
  isRecurring: boolean;
  recurringRuleId: EntityId | null;
}

export interface Category extends TimestampedEntity {
  budgetId: EntityId | null;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface Subcategory extends TimestampedEntity {
  categoryId: EntityId;
  name: string;
}

export interface RecurringRule extends TimestampedEntity {
  budgetId: EntityId;
  userId: EntityId;
  transactionTemplateId: EntityId | null;
  frequency: RecurringFrequency;
  startDate: ISODateString;
  endDate: ISODateString | null;
  nextOccurrenceDate: ISODateString;
  isActive: boolean;
}

export interface Goal extends TimestampedEntity {
  budgetId: EntityId;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  targetDate: ISODateString | null;
  status: GoalStatus;
}

export interface WidgetConfig extends TimestampedEntity {
  userId: EntityId;
  budgetId: EntityId;
  widgetKey: WidgetKey;
  isEnabled: boolean;
  position: number;
  config: Record<string, unknown>;
}

export type DashboardWidgetPreference = WidgetConfig;

export interface FinancialIndicatorPreference extends TimestampedEntity {
  userId: EntityId;
  budgetId: EntityId;
  indicatorKey: string;
  isEnabled: boolean;
  config: Record<string, unknown>;
}

export interface ImportBatch {
  id: EntityId;
  budgetId: EntityId;
  userId: EntityId;
  filename: string;
  status: ImportBatchStatus;
  rowCount: number;
  errorCount: number;
  createdAt: ISODateTimeString;
}

export interface BudgetAppData {
  users: User[];
  budgets: Budget[];
  budgetMembers: BudgetMember[];
  invitations: Invitation[];
  transactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
  recurringRules: RecurringRule[];
  goals: Goal[];
  widgetConfigs: WidgetConfig[];
  financialIndicatorPreferences: FinancialIndicatorPreference[];
  importBatches: ImportBatch[];
}

export type CreateTransactionInput = Omit<Transaction, "id" | "createdAt" | "updatedAt">;
export type UpdateTransactionInput = Partial<CreateTransactionInput>;
export type CreateBudgetInput = Omit<Budget, "id" | "createdAt" | "updatedAt">;
export type UpdateBudgetInput = Partial<CreateBudgetInput>;
export type CreateCategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
export type CreateGoalInput = Omit<Goal, "id" | "createdAt" | "updatedAt">;
export type UpdateGoalInput = Partial<CreateGoalInput>;
export type CreateWidgetConfigInput = Omit<WidgetConfig, "id" | "createdAt" | "updatedAt">;
export type UpdateWidgetConfigInput = Partial<Omit<WidgetConfig, "id" | "createdAt" | "updatedAt">>;
export type CreateFinancialIndicatorPreferenceInput = Omit<
  FinancialIndicatorPreference,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateFinancialIndicatorPreferenceInput = Partial<
  Omit<FinancialIndicatorPreference, "id" | "createdAt" | "updatedAt">
>;
