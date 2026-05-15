import { createEntityId, nowIsoString } from "../../data/local-store";
import type { BudgetAppData, EntityId } from "../../types";

import type { BudgetAppStore } from "./store";

export class SharedRepository {
  constructor(protected readonly store: BudgetAppStore) {}

  protected async readData() {
    return this.store.read();
  }

  protected async writeData(data: BudgetAppData) {
    await this.store.write(data);
  }

  protected buildTimestampedEntityId(prefix: string) {
    return createEntityId(prefix);
  }

  protected now() {
    return nowIsoString();
  }

  protected findRequired<T extends { id: EntityId }>(items: T[], id: EntityId, message: string) {
    const item = items.find((candidate) => candidate.id === id);

    if (!item) {
      throw new Error(message);
    }

    return item;
  }
}
