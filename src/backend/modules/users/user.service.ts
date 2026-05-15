import type { EntityId, User } from "../../../types";
import { HttpError } from "../../lib/http-error";

type UserRepositoryContract = {
  findAll: (filters: { email?: string }) => Promise<User[]>;
  findById: (id: EntityId) => Promise<User | null>;
  create: (input: Omit<User, "id" | "createdAt" | "updatedAt">) => Promise<User>;
  update: (id: EntityId, input: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>) => Promise<User>;
  delete: (id: EntityId) => Promise<void>;
};

export class UserService {
  constructor(private readonly repository: UserRepositoryContract) {}

  async list(filters: { email?: string }) {
    const users = await this.repository.findAll(filters);
    return users.map(sanitizeUser);
  }

  async getById(id: EntityId) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new HttpError(404, "Utilisateur introuvable.");
    }

    return sanitizeUser(user);
  }

  async create(input: Omit<User, "id" | "createdAt" | "updatedAt">) {
    const user = await this.repository.create(input);
    return sanitizeUser(user);
  }

  async update(id: EntityId, input: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>) {
    await this.getById(id);
    const user = await this.repository.update(id, input);
    return sanitizeUser(user);
  }

  async delete(id: EntityId) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}

function sanitizeUser(user: User) {
  const { passwordHash, ...publicUser } = user;
  void passwordHash;
  return publicUser;
}
