import type { Request, Response } from "express";

import { BudgetService } from "./budget.service";

export class BudgetController {
  constructor(private readonly service: BudgetService) {}

  list = async (request: Request, response: Response) => {
    const budgets = await this.service.list({
      ownerId: typeof request.query.ownerId === "string" ? request.query.ownerId : undefined,
    });
    response.json({ data: budgets });
  };

  getById = async (request: Request, response: Response) => {
    const budget = await this.service.getById(String(request.params.id));
    response.json({ data: budget });
  };

  create = async (request: Request, response: Response) => {
    const budget = await this.service.create(request.body);
    response.status(201).json({ data: budget });
  };

  update = async (request: Request, response: Response) => {
    const budget = await this.service.update(String(request.params.id), request.body);
    response.json({ data: budget });
  };

  delete = async (request: Request, response: Response) => {
    await this.service.delete(String(request.params.id));
    response.status(204).send();
  };
}
