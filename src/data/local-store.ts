import { mockBudgetAppData } from "@/data/mock-data";
import type { BudgetAppData } from "@/types";

const STORAGE_KEY = "budgetapp.local-data.v1";

let memoryData = cloneBudgetAppData(mockBudgetAppData);

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function cloneBudgetAppData(data: BudgetAppData): BudgetAppData {
  if (typeof structuredClone === "function") {
    return structuredClone(data);
  }

  return JSON.parse(JSON.stringify(data)) as BudgetAppData;
}

export function nowIsoString() {
  return new Date().toISOString();
}

export function createEntityId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function readLocalBudgetAppData(): BudgetAppData {
  if (!hasLocalStorage()) {
    return cloneBudgetAppData(memoryData);
  }

  const rawData = window.localStorage.getItem(STORAGE_KEY);

  if (!rawData) {
    const initialData = cloneBudgetAppData(mockBudgetAppData);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }

  try {
    return JSON.parse(rawData) as BudgetAppData;
  } catch {
    const fallbackData = cloneBudgetAppData(mockBudgetAppData);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackData));
    return fallbackData;
  }
}

export function writeLocalBudgetAppData(data: BudgetAppData) {
  const nextData = cloneBudgetAppData(data);

  if (!hasLocalStorage()) {
    memoryData = nextData;
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
}

export function resetLocalBudgetAppData() {
  const initialData = cloneBudgetAppData(mockBudgetAppData);
  writeLocalBudgetAppData(initialData);
  return initialData;
}
