import type { Request, Response } from "express";

import { GoalService } from "./goal.service";

export class GoalController {
  constructor(private readonly service: GoalService) {}

  list = async (request: Request, response: Response) => {
    const goals = await this.service.list({
      budgetId: typeof request.query.budgetId === "string" ? request.query.budgetId : undefined,
    });
    response.json({ data: goals });
  };

  getById = async (request: Request, response: Response) => {
    const goal = await this.service.getById(String(request.params.id));
    response.json({ data: goal });
  };

  create = async (request: Request, response: Response) => {
    const goal = await this.service.create(request.body);
    response.status(201).json({ data: goal });
  };

  update = async (request: Request, response: Response) => {
    const goal = await this.service.update(String(request.params.id), request.body);
    response.json({ data: goal });
  };

  delete = async (request: Request, response: Response) => {
    await this.service.delete(String(request.params.id));
    response.status(204).send();
  };
}
