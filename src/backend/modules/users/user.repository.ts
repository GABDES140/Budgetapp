import type { EntityId, User } from "../../../types";

import { SharedRepository } from "../../repositories/shared";

export class UserRepository extends SharedRepository {
  async findAll(filters: { email?: string }) {
    const data = await this.readData();
    return data.users.filter((user) => !filters.email || user.email.toLowerCase() === filters.email.toLowerCase());
  }

  async findById(id: EntityId) {
    const data = await this.readData();
    return data.users.find((user) => user.id === id) ?? null;
  }

  async create(input: Omit<User, "id" | "createdAt" | "updatedAt">) {
    const data = await this.readData();
    const user: User = {
      ...input,
      id: this.buildTimestampedEntityId("user"),
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    data.users.push(user);
    await this.writeData(data);
    return user;
  }

  async update(id: EntityId, input: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>) {
    const data = await this.readData();
    const user = this.findRequired(data.users, id, "Utilisateur introuvable");
    Object.assign(user, input, { updatedAt: this.now() });
    await this.writeData(data);
    return user;
  }

  async delete(id: EntityId) {
    const data = await this.readData();
    const currentLength = data.users.length;
    data.users = data.users.filter((user) => user.id !== id);

    if (data.users.length === currentLength) {
      throw new Error("Utilisateur introuvable");
    }

    await this.writeData(data);
  }
}
