import type { CreateCategoryInput, EntityId, UpdateCategoryInput } from "../../../types";

import { HttpError } from "../../lib/http-error";

import { CategoryRepository } from "./category.repository";

export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

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
