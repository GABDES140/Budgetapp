import type { CreateBudgetInput, EntityId, UpdateBudgetInput } from "../../../types";

import { HttpError } from "../../lib/http-error";

import { BudgetRepository } from "./budget.repository";

export class BudgetService {
  constructor(private readonly repository: BudgetRepository) {}

  async list(filters: { ownerId?: EntityId }) {
    return this.repository.findAll(filters);
  }

  async getById(id: EntityId) {
    const budget = await this.repository.findById(id);

    if (!budget) {
      throw new HttpError(404, "Budget introuvable.");
    }

    return budget;
  }

  async create(input: CreateBudgetInput) {
    return this.repository.create(input);
  }

  async update(id: EntityId, input: UpdateBudgetInput) {
    await this.getById(id);
    return this.repository.update(id, input);
  }

  async delete(id: EntityId) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}
