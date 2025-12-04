import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/errors";

interface JwtPayload {
  pennkey: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return sendError(res, "UNAUTHORIZED", "Missing Authorization header", 401);
  }

  const parts = header.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return sendError(res, "UNAUTHORIZED", "Invalid Authorization header", 401);
  }

  const token = parts[1];

  try {
    const secret = process.env.JWT_TOKEN_SECRET;
    if (!secret) {
      throw new Error("JWT_TOKEN_SECRET is not set");
    }

    const payload = jwt.verify(token, secret) as JwtPayload;

    req.user = payload;
    next();
  } catch {
    return sendError(res, "UNAUTHORIZED", "Invalid or expired token", 401);
  }
}

export default authMiddleware;
