import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { HttpError } from "../lib/http-error";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  void _next;
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation invalide.",
      issues: error.flatten(),
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  response.status(500).json({
    message: error instanceof Error ? error.message : "Erreur interne du serveur.",
  });
}
