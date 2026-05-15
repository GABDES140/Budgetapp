import type { CreateTransactionInput, EntityId, Transaction, UpdateTransactionInput } from "../../../types";

import { SharedRepository } from "../../repositories/shared";

export class TransactionRepository extends SharedRepository {
  async findAll(filters: { budgetId?: EntityId; userId?: EntityId }) {
    const data = await this.readData();

    return data.transactions.filter((transaction) => {
      return (
        (!filters.budgetId || transaction.budgetId === filters.budgetId) &&
        (!filters.userId || transaction.userId === filters.userId)
      );
    });
  }

  async findById(id: EntityId) {
    const data = await this.readData();
    return data.transactions.find((transaction) => transaction.id === id) ?? null;
  }

  async create(input: CreateTransactionInput) {
    const data = await this.readData();
    const transaction: Transaction = {
      ...input,
      id: this.buildTimestampedEntityId("tx"),
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    data.transactions.push(transaction);
    await this.writeData(data);
    return transaction;
  }

  async update(id: EntityId, input: UpdateTransactionInput) {
    const data = await this.readData();
    const transaction = this.findRequired(data.transactions, id, "Transaction introuvable");

    Object.assign(transaction, input, {
      updatedAt: this.now(),
    });

    await this.writeData(data);
    return transaction;
  }

  async delete(id: EntityId) {
    const data = await this.readData();
    const currentLength = data.transactions.length;
    data.transactions = data.transactions.filter((transaction) => transaction.id !== id);

    if (data.transactions.length === currentLength) {
      throw new Error("Transaction introuvable");
    }

    await this.writeData(data);
  }
}
