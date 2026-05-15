import type { CreateBudgetInput, EntityId, UpdateBudgetInput } from "../../../types";
import { HttpError } from "../../lib/http-error";

type BudgetRepositoryContract = {
  findAll: (filters: { ownerId?: EntityId }) => Promise<unknown>;
  findById: (id: EntityId) => Promise<unknown>;
  create: (input: CreateBudgetInput) => Promise<unknown>;
  update: (id: EntityId, input: UpdateBudgetInput) => Promise<unknown>;
  delete: (id: EntityId) => Promise<void>;
};

export class BudgetService {
  constructor(private readonly repository: BudgetRepositoryContract) {}

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
