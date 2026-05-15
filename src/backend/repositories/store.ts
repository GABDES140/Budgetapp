import { promises as fs } from "node:fs";
import path from "node:path";

import { cloneBudgetAppData } from "../../data/local-store";
import { mockBudgetAppData } from "../../data/mock-data";
import type { BudgetAppData } from "../../types";

export interface BudgetAppStore {
  read(): Promise<BudgetAppData>;
  write(data: BudgetAppData): Promise<void>;
}

export class FileBudgetAppStore implements BudgetAppStore {
  private readonly filePath = path.join(process.cwd(), "storage", "budgetapp-backend-store.json");

  async read() {
    await this.ensureFile();
    const rawData = await fs.readFile(this.filePath, "utf-8");
    return JSON.parse(rawData) as BudgetAppData;
  }

  async write(data: BudgetAppData) {
    await this.ensureFile();
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  private async ensureFile() {
    const directoryPath = path.dirname(this.filePath);
    await fs.mkdir(directoryPath, { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      const initialData = cloneBudgetAppData(mockBudgetAppData);
      await fs.writeFile(this.filePath, JSON.stringify(initialData, null, 2), "utf-8");
    }
  }
}
