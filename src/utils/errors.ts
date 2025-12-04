import type { Response } from "express";

export function sendError(
  res: Response,
  code: string,
  message: string,
  status: number
) {
  return res.status(status).json({ code, message });
}
