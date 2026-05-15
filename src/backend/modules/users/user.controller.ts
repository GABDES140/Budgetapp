import type { Request, Response } from "express";

import { UserService } from "./user.service";

export class UserController {
  constructor(private readonly service: UserService) {}

  list = async (request: Request, response: Response) => {
    const users = await this.service.list({
      email: typeof request.query.email === "string" ? request.query.email : undefined,
    });
    response.json({ data: users });
  };

  getById = async (request: Request, response: Response) => {
    const user = await this.service.getById(String(request.params.id));
    response.json({ data: user });
  };

  create = async (request: Request, response: Response) => {
    const user = await this.service.create(request.body);
    response.status(201).json({ data: user });
  };

  update = async (request: Request, response: Response) => {
    const user = await this.service.update(String(request.params.id), request.body);
    response.json({ data: user });
  };

  delete = async (request: Request, response: Response) => {
    await this.service.delete(String(request.params.id));
    response.status(204).send();
  };
}
