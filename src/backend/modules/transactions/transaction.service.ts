import type { CreateTransactionInput, EntityId, UpdateTransactionInput } from "../../../types";

import { HttpError } from "../../lib/http-error";

import { TransactionRepository } from "./transaction.repository";

export class TransactionService {
  constructor(private readonly repository: TransactionRepository) {}

  async list(filters: { budgetId?: EntityId; userId?: EntityId }) {
    return this.repository.findAll(filters);
  }

  async getById(id: EntityId) {
    const transaction = await this.repository.findById(id);

    if (!transaction) {
      throw new HttpError(404, "Transaction introuvable.");
    }

    return transaction;
  }

  async create(input: CreateTransactionInput) {
    return this.repository.create(input);
  }

  async update(id: EntityId, input: UpdateTransactionInput) {
    await this.getById(id);
    return this.repository.update(id, input);
  }

  async delete(id: EntityId) {
    await this.getById(id);
    await this.repository.delete(id);
  }
}
