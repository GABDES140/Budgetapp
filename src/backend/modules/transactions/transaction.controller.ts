import type { Request, Response } from "express";

import { TransactionService } from "./transaction.service";

export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  list = async (request: Request, response: Response) => {
    const transactions = await this.service.list({
      budgetId: typeof request.query.budgetId === "string" ? request.query.budgetId : undefined,
      userId: typeof request.query.userId === "string" ? request.query.userId : undefined,
    });

    response.json({ data: transactions });
  };

  getById = async (request: Request, response: Response) => {
    const transaction = await this.service.getById(String(request.params.id));
    response.json({ data: transaction });
  };

  create = async (request: Request, response: Response) => {
    const transaction = await this.service.create(request.body);
    response.status(201).json({ data: transaction });
  };

  update = async (request: Request, response: Response) => {
    const transaction = await this.service.update(String(request.params.id), request.body);
    response.json({ data: transaction });
  };

  delete = async (request: Request, response: Response) => {
    await this.service.delete(String(request.params.id));
    response.status(204).send();
  };
}
