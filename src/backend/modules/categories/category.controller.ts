import type { Request, Response } from "express";

import { CategoryService } from "./category.service";

export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  list = async (request: Request, response: Response) => {
    const categories = await this.service.list({
      budgetId: typeof request.query.budgetId === "string" ? request.query.budgetId : undefined,
    });
    response.json({ data: categories });
  };

  getById = async (request: Request, response: Response) => {
    const category = await this.service.getById(String(request.params.id));
    response.json({ data: category });
  };

  create = async (request: Request, response: Response) => {
    const category = await this.service.create(request.body);
    response.status(201).json({ data: category });
  };

  update = async (request: Request, response: Response) => {
    const category = await this.service.update(String(request.params.id), request.body);
    response.json({ data: category });
  };

  delete = async (request: Request, response: Response) => {
    await this.service.delete(String(request.params.id));
    response.status(204).send();
  };
}
