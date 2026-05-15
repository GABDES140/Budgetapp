import type { CreateGoalInput, EntityId, UpdateGoalInput } from "../../../types";

import { HttpError } from "../../lib/http-error";

import { GoalRepository } from "./goal.repository";

export class GoalService {
  constructor(private readonly repository: GoalRepository) {}

  async list(filters: { budgetId?: EntityId }) {
    return this.repository.findAll(filters);
  }

  async getById(id: EntityId) {
    const goal = await this.repository.findById(id);

    if (!goal) {
      throw new HttpError(404, "Objectif introuvable.");
    }

    return goal;
  }

  async create(input: CreateGoalInput) {
    return this.repository.create(input);
  }

  async update(id: EntityId, input: UpdateGoalInput) {
    await this.getById(id);
    return this.repository.update(id, input);
  }

  async delete(id: EntityId) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}
