import type { CreateCategoryInput, EntityId, UpdateCategoryInput } from "../../../types";
import { HttpError } from "../../lib/http-error";

type CategoryRepositoryContract = {
  findAll: (filters: { budgetId?: EntityId }) => Promise<unknown>;
  findById: (id: EntityId) => Promise<unknown>;
  create: (input: CreateCategoryInput) => Promise<unknown>;
  update: (id: EntityId, input: UpdateCategoryInput) => Promise<unknown>;
  delete: (id: EntityId) => Promise<void>;
};

export class CategoryService {
  constructor(private readonly repository: CategoryRepositoryContract) {}

  async list(filters: { budgetId?: EntityId }) {
    return this.repository.findAll(filters);
  }

  async getById(id: EntityId) {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new HttpError(404, "Categorie introuvable.");
    }

    return category;
  }

  async create(input: CreateCategoryInput) {
    return this.repository.create(input);
  }

  async update(id: EntityId, input: UpdateCategoryInput) {
    await this.getById(id);
    return this.repository.update(id, input);
  }

  async delete(id: EntityId) {
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw new HttpError(400, error instanceof Error ? error.message : "La categorie n'a pas pu etre supprimee.");
    }
  }
}
