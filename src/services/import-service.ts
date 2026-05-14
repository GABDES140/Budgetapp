import * as XLSX from "xlsx";

import { createTransaction } from "@/services/transaction-service";
import type { BudgetAppData, Category, CreateTransactionInput, EntityId, Subcategory, Transaction, TransactionType } from "@/types";

export const IMPORT_TEMPLATE_COLUMNS = [
  "date",
  "type",
  "amount",
  "currency",
  "category",
  "subcategory",
  "description",
  "notes",
] as const;

type ImportTemplateColumn = (typeof IMPORT_TEMPLATE_COLUMNS)[number];

export type ImportFileFormat = "csv" | "xlsx";

export type ParsedImportRow = Partial<Record<ImportTemplateColumn, string>> & {
  _rowNumber: number;
};

export type ImportPreviewRow = {
  rowNumber: number;
  values: ParsedImportRow;
  errors: string[];
  transactionInput: CreateTransactionInput | null;
};

export type ImportPreview = {
  columns: string[];
  rows: ImportPreviewRow[];
  validRows: ImportPreviewRow[];
  invalidRows: ImportPreviewRow[];
};

const REQUIRED_COLUMNS = ["date", "type", "amount", "currency", "category"] as const;
const ISO_CURRENCY_PATTERN = /^[A-Z]{3}$/;

export async function parseImportFile(file: File): Promise<{ columns: string[]; rows: ParsedImportRow[] }> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const worksheetName = workbook.SheetNames[0];

  if (!worksheetName) {
    throw new Error("Le fichier ne contient aucune feuille exploitable.");
  }

  const worksheet = workbook.Sheets[worksheetName];
  const rawRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });

  if (rawRows.length === 0) {
    throw new Error("Le fichier importe est vide.");
  }

  const headerRow = rawRows[0].map((value) => normalizeHeader(String(value ?? ""))).filter(Boolean);
  const dataRows = rawRows.slice(1);
  const columns = headerRow;

  if (extension === "csv" || extension === "xlsx" || extension === "xls") {
    return {
      columns,
      rows: dataRows.map((row, index) => mapRowToObject(columns, row, index + 2)),
    };
  }

  throw new Error("Format de fichier non supporte. Utilise un CSV ou un fichier Excel.");
}

export function validateImportRows(input: {
  budgetId: EntityId;
  categories: Category[];
  rows: ParsedImportRow[];
  subcategories: Subcategory[];
  userId: EntityId;
}): ImportPreview {
  const scopedCategories = input.categories.filter((category) => category.budgetId === null || category.budgetId === input.budgetId);
  const categoryByName = new Map(scopedCategories.map((category) => [normalizeLabel(category.name), category]));
  const subcategoryByName = new Map(
    input.subcategories.map((subcategory) => [normalizeLabel(subcategory.name), subcategory]),
  );

  const previewRows = input.rows.map((row) => {
    const errors: string[] = [];

    for (const column of REQUIRED_COLUMNS) {
      if (!String(row[column] ?? "").trim()) {
        errors.push(`Colonne requise manquante: ${column}`);
      }
    }

    const type = normalizeType(row.type);

    if (!type) {
      errors.push("Le type doit etre income ou expense.");
    }

    const amount = Number(String(row.amount ?? "").replace(",", "."));

    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push("Le montant doit etre un nombre positif.");
    }

    const currency = String(row.currency ?? "").trim().toUpperCase();

    if (!ISO_CURRENCY_PATTERN.test(currency)) {
      errors.push("La devise doit respecter le format ISO a trois lettres.");
    }

    const date = String(row.date ?? "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push("La date doit utiliser le format YYYY-MM-DD.");
    }

    const category = categoryByName.get(normalizeLabel(String(row.category ?? "")));

    if (!category) {
      errors.push("Categorie introuvable dans le budget actif.");
    }

    const subcategoryName = String(row.subcategory ?? "").trim();
    const subcategory = subcategoryName ? subcategoryByName.get(normalizeLabel(subcategoryName)) : undefined;

    if (subcategoryName && !subcategory) {
      errors.push("Sous-categorie introuvable.");
    }

    if (subcategory && category && subcategory.categoryId !== category.id) {
      errors.push("La sous-categorie ne correspond pas a la categorie choisie.");
    }

    if (type === "expense" && category && !(category.type === "expense" || category.type === "both")) {
      errors.push("La categorie choisie n'accepte pas les depenses.");
    }

    if (type === "income" && category && !(category.type === "income" || category.type === "both")) {
      errors.push("La categorie choisie n'accepte pas les revenus.");
    }

    const description = String(row.description ?? "").trim() || category?.name || "Transaction importee";

    const transactionInput: CreateTransactionInput | null =
      errors.length === 0 && type && category
        ? {
            budgetId: input.budgetId,
            userId: input.userId,
            type,
            amount,
            currency,
            date,
            description,
            categoryId: category.id,
            subcategoryId: subcategory?.id ?? null,
            notes: String(row.notes ?? "").trim() || null,
            isRecurring: false,
            recurringRuleId: null,
          }
        : null;

    return {
      rowNumber: row._rowNumber,
      values: row,
      errors,
      transactionInput,
    };
  });

  return {
    columns: [...IMPORT_TEMPLATE_COLUMNS],
    rows: previewRows,
    validRows: previewRows.filter((row) => row.errors.length === 0),
    invalidRows: previewRows.filter((row) => row.errors.length > 0),
  };
}

export async function confirmImport(preview: ImportPreview) {
  for (const row of preview.validRows) {
    if (row.transactionInput) {
      await createTransaction(row.transactionInput);
    }
  }

  return preview.validRows.length;
}

export function buildTemplateWorkbook(format: ImportFileFormat) {
  const workbook = XLSX.utils.book_new();
  const sampleRows = [
    [...IMPORT_TEMPLATE_COLUMNS],
    ["2026-05-14", "expense", "42.50", "CAD", "Alimentation", "", "Epicerie", "Exemple"],
    ["2026-05-15", "income", "1200.00", "CAD", "Salaire", "", "Versement", ""],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(sampleRows);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Import");

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ",", RS: "\n" });
    return {
      blob: new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      filename: "budgetapp-import-template.csv",
    };
  }

  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

  return {
    blob: new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename: "budgetapp-import-template.xlsx",
  };
}

export function buildTransactionsExport(input: {
  categories: Category[];
  format: ImportFileFormat;
  subcategories: Subcategory[];
  transactions: Transaction[];
}) {
  const categoryById = new Map(input.categories.map((category) => [category.id, category]));
  const subcategoryById = new Map(input.subcategories.map((subcategory) => [subcategory.id, subcategory]));
  const rows = input.transactions.map((transaction) => ({
    date: transaction.date,
    type: transaction.type,
    amount: transaction.amount,
    currency: transaction.currency,
    category: categoryById.get(transaction.categoryId)?.name ?? "",
    subcategory: transaction.subcategoryId ? subcategoryById.get(transaction.subcategoryId)?.name ?? "" : "",
    description: transaction.description,
    notes: transaction.notes ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [...IMPORT_TEMPLATE_COLUMNS],
  });

  if (input.format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ",", RS: "\n" });
    return {
      blob: new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      filename: "budgetapp-transactions.csv",
    };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

  return {
    blob: new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    filename: "budgetapp-transactions.xlsx",
  };
}

export function getImportSummaryText(preview: ImportPreview) {
  return `${preview.validRows.length} ligne(s) valide(s), ${preview.invalidRows.length} ligne(s) a corriger.`;
}

export function listExportTransactions(data: BudgetAppData, budgetId: EntityId) {
  return data.transactions
    .filter((transaction) => transaction.budgetId === budgetId)
    .sort((first, second) => second.date.localeCompare(first.date));
}

function mapRowToObject(columns: string[], row: (string | number | null)[], rowNumber: number): ParsedImportRow {
  const nextRow: ParsedImportRow = { _rowNumber: rowNumber };

  columns.forEach((column, index) => {
    if (isTemplateColumn(column)) {
      nextRow[column] = String(row[index] ?? "").trim();
    }
  });

  return nextRow;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function normalizeLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function normalizeType(value: unknown): TransactionType | null {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "income" || normalized === "expense") {
    return normalized;
  }

  return null;
}

function isTemplateColumn(value: string): value is ImportTemplateColumn {
  return IMPORT_TEMPLATE_COLUMNS.includes(value as ImportTemplateColumn);
}
