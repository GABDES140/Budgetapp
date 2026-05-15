import type { CreateGoalInput, EntityId, Goal, UpdateGoalInput } from "../../../types";

import { SharedRepository } from "../../repositories/shared";

export class GoalRepository extends SharedRepository {
  async findAll(filters: { budgetId?: EntityId }) {
    const data = await this.readData();
    return data.goals.filter((goal) => !filters.budgetId || goal.budgetId === filters.budgetId);
  }

  async findById(id: EntityId) {
    const data = await this.readData();
    return data.goals.find((goal) => goal.id === id) ?? null;
  }

  async create(input: CreateGoalInput) {
    const data = await this.readData();
    const goal: Goal = {
      ...input,
      id: this.buildTimestampedEntityId("goal"),
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    data.goals.push(goal);
    await this.writeData(data);
    return goal;
  }

  async update(id: EntityId, input: UpdateGoalInput) {
    const data = await this.readData();
    const goal = this.findRequired(data.goals, id, "Objectif introuvable");
    Object.assign(goal, input, { updatedAt: this.now() });
    await this.writeData(data);
    return goal;
  }

  async delete(id: EntityId) {
    const data = await this.readData();
    const currentLength = data.goals.length;
    data.goals = data.goals.filter((goal) => goal.id !== id);

    if (data.goals.length === currentLength) {
      throw new Error("Objectif introuvable");
    }

    await this.writeData(data);
  }
}
