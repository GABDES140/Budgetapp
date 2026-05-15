import type { Budget, CreateBudgetInput, EntityId, UpdateBudgetInput } from "../../../types";

import { SharedRepository } from "../../repositories/shared";

export class BudgetRepository extends SharedRepository {
  async findAll(filters: { ownerId?: EntityId }) {
    const data = await this.readData();
    return data.budgets.filter((budget) => !filters.ownerId || budget.ownerId === filters.ownerId);
  }

  async findById(id: EntityId) {
    const data = await this.readData();
    return data.budgets.find((budget) => budget.id === id) ?? null;
  }

  async create(input: CreateBudgetInput) {
    const data = await this.readData();
    const budget: Budget = {
      ...input,
      id: this.buildTimestampedEntityId("budget"),
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    data.budgets.push(budget);
    await this.writeData(data);
    return budget;
  }

  async update(id: EntityId, input: UpdateBudgetInput) {
    const data = await this.readData();
    const budget = this.findRequired(data.budgets, id, "Budget introuvable");
    Object.assign(budget, input, { updatedAt: this.now() });
    await this.writeData(data);
    return budget;
  }

  async delete(id: EntityId) {
    const data = await this.readData();
    const currentLength = data.budgets.length;
    data.budgets = data.budgets.filter((budget) => budget.id !== id);

    if (data.budgets.length === currentLength) {
      throw new Error("Budget introuvable");
    }

    await this.writeData(data);
  }
}
