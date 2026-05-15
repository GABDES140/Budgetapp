import type { Category, CreateCategoryInput, EntityId, UpdateCategoryInput } from "../../../types";

import { SharedRepository } from "../../repositories/shared";

export class CategoryRepository extends SharedRepository {
  async findAll(filters: { budgetId?: EntityId }) {
    const data = await this.readData();

    return data.categories.filter((category) => {
      return category.budgetId === null || !filters.budgetId || category.budgetId === filters.budgetId;
    });
  }

  async findById(id: EntityId) {
    const data = await this.readData();
    return data.categories.find((category) => category.id === id) ?? null;
  }

  async create(input: CreateCategoryInput) {
    const data = await this.readData();
    const category: Category = {
      ...input,
      id: this.buildTimestampedEntityId("cat"),
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    data.categories.push(category);
    await this.writeData(data);
    return category;
  }

  async update(id: EntityId, input: UpdateCategoryInput) {
    const data = await this.readData();
    const category = this.findRequired(data.categories, id, "Categorie introuvable");
    Object.assign(category, input, { updatedAt: this.now() });
    await this.writeData(data);
    return category;
  }

  async delete(id: EntityId) {
    const data = await this.readData();
    const category = this.findRequired(data.categories, id, "Categorie introuvable");

    if (category.isDefault) {
      throw new Error("Une categorie par defaut ne peut pas etre supprimee.");
    }

    data.categories = data.categories.filter((item) => item.id !== id);
    await this.writeData(data);
  }
}
