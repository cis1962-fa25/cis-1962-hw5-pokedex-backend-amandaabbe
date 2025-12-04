import { Router } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/errors";

const router = Router();

router.post("/", (req, res) => {
  const { pennkey } = req.body ?? {};

  if (!pennkey || typeof pennkey !== "string") {
    return sendError(res, "BAD_REQUEST", "pennkey is required", 400);
  }

  const secret = process.env.JWT_TOKEN_SECRET;
  if (!secret) {
    return sendError(res, "INTERNAL_SERVER_ERROR", "Missing JWT secret", 500);
  }

  const token = jwt.sign({ pennkey }, secret, { expiresIn: "1h" });

  return res.status(200).json({ token });
});

export default router;
