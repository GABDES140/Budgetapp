export type ThemePreference = "light" | "dark" | "system";
export type BudgetType = "personal" | "shared";
export type BudgetRole = "owner" | "member";
export type InvitationStatus = "pending" | "accepted" | "expired";
export type TransactionType = "income" | "expense";
export type CategoryType = "income" | "expense" | "both";
export type RecurringFrequency = "weekly" | "monthly" | "yearly";
export type GoalStatus = "active" | "completed" | "archived";
export type ImportBatchStatus = "pending" | "imported" | "failed";

export interface TimestampedEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends TimestampedEntity {
  name: string;
  email: string;
  passwordHash: string;
  defaultCurrency: string;
  theme: ThemePreference;
}

export interface Budget extends TimestampedEntity {
  name: string;
  type: BudgetType;
  monthlyLimit: number;
  defaultCurrency: string;
  ownerId: string;
}

export interface BudgetMember {
  id: string;
  budgetId: string;
  userId: string;
  role: BudgetRole;
  joinedAt: string;
}

export interface Invitation {
  id: string;
  budgetId: string;
  email: string;
  status: InvitationStatus;
  token: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface Transaction extends TimestampedEntity {
  budgetId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  date: string;
  description: string;
  categoryId: string;
  subcategoryId: string | null;
  notes: string | null;
  isRecurring: boolean;
  recurringRuleId: string | null;
}

export interface Category extends TimestampedEntity {
  budgetId: string | null;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface Subcategory extends TimestampedEntity {
  categoryId: string;
  name: string;
}

export interface RecurringRule extends TimestampedEntity {
  budgetId: string;
  userId: string;
  transactionTemplateId: string | null;
  frequency: RecurringFrequency;
  startDate: string;
  endDate: string | null;
  nextOccurrenceDate: string;
  isActive: boolean;
}

export interface Goal extends TimestampedEntity {
  budgetId: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string | null;
  status: GoalStatus;
}

export interface DashboardWidgetPreference extends TimestampedEntity {
  userId: string;
  budgetId: string;
  widgetKey: string;
  isEnabled: boolean;
  position: number;
  config: Record<string, unknown>;
}

export interface FinancialIndicatorPreference extends TimestampedEntity {
  userId: string;
  budgetId: string;
  indicatorKey: string;
  isEnabled: boolean;
  config: Record<string, unknown>;
}

export interface ImportBatch {
  id: string;
  budgetId: string;
  userId: string;
  filename: string;
  status: ImportBatchStatus;
  rowCount: number;
  errorCount: number;
  createdAt: string;
}
