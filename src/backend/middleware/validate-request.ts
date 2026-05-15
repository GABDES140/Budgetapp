import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validateRequest(schemas: ValidationSchemas) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (schemas.params) {
      Object.assign(request.params, schemas.params.parse(request.params) as Record<string, string>);
    }

    if (schemas.query) {
      Object.assign(request.query, schemas.query.parse(request.query) as Record<string, unknown>);
    }

    if (schemas.body) {
      request.body = schemas.body.parse(request.body);
    }

    next();
  };
}
