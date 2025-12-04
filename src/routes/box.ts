import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { sendError } from "../utils/errors";
import type { InsertBoxEntry, BoxEntry } from "../types";
import { createId } from "@paralleldrive/cuid2";
import { createClient, type RedisClientType } from "redis";

const router = Router();

// ----- Redis setup -----

let redisClient: RedisClientType | null = null;

async function getRedis(): Promise<RedisClientType> {
  if (!redisClient) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error("REDIS_URL is not set in environment");
    }

    redisClient = createClient({ url });
    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err);
    });
    await redisClient.connect();
  }
  return redisClient;
}

// All /box routes require auth
router.use(authMiddleware as any);

// GET /box  – list all Box entry IDs for this user
router.get("/", async (req, res) => {
  const user = (req as any).user as { pennkey: string };
  const redis = await getRedis();

  const pattern = `${user.pennkey}:pokedex:*`;
  const keys: string[] = await redis.keys(pattern);
  const ids = keys.map((k) => k.split(":").pop() as string);

  res.json(ids);
});

// POST /box  – create a new Box entry
router.post("/", async (req, res) => {
  const user = (req as any).user as { pennkey: string };
  const redis = await getRedis();
  const body = req.body as InsertBoxEntry;

  if (
    typeof body.level !== "number" ||
    body.level < 1 ||
    body.level > 100 ||
    typeof body.location !== "string" ||
    body.location.trim() === "" ||
    typeof body.pokemonId !== "number"
  ) {
    return sendError(res, "BAD_REQUEST", "Invalid box entry data", 400);
  }

  const id = createId();
  const entry: BoxEntry = {
    id,
    createdAt: new Date().toISOString(),
    ...body,
  };

  const key = `${user.pennkey}:pokedex:${id}`;
  await redis.set(key, JSON.stringify(entry));

  res.status(201).json(entry);
});

// GET /box/:id  – fetch a specific entry
router.get("/:id", async (req, res) => {
  const user = (req as any).user as { pennkey: string };
  const redis = await getRedis();

  const key = `${user.pennkey}:pokedex:${req.params.id}`;
  const data = await redis.get(key);

  if (!data) {
    return sendError(res, "NOT_FOUND", "Box entry not found", 404);
  }

  const entry = JSON.parse(data) as BoxEntry;
  res.json(entry);
});

// PUT /box/:id  – update an entry
router.put("/:id", async (req, res) => {
  const user = (req as any).user as { pennkey: string };
  const redis = await getRedis();

  const key = `${user.pennkey}:pokedex:${req.params.id}`;
  const existing = await redis.get(key);

  if (!existing) {
    return sendError(res, "NOT_FOUND", "Entry not found", 404);
  }

  const current = JSON.parse(existing) as BoxEntry;
  const updates = req.body as Partial<InsertBoxEntry>;

  const updated: BoxEntry = {
    ...current,
    ...updates,
  };

  if (updated.level < 1 || updated.level > 100) {
    return sendError(res, "BAD_REQUEST", "Invalid level", 400);
  }

  await redis.set(key, JSON.stringify(updated));
  res.json(updated);
});

// DELETE /box/:id  – delete one entry
router.delete("/:id", async (req, res) => {
  const user = (req as any).user as { pennkey: string };
  const redis = await getRedis();

  const key = `${user.pennkey}:pokedex:${req.params.id}`;
  const existing = await redis.get(key);

  if (!existing) {
    return sendError(res, "NOT_FOUND", "Entry not found", 404);
  }

  await redis.del(key);
  res.status(204).send();
});

// DELETE /box  – clear all entries for this user
router.delete("/", async (req, res) => {
  const user = (req as any).user as { pennkey: string };
  const redis = await getRedis();

  const pattern = `${user.pennkey}:pokedex:*`;
  const keys: string[] = await redis.keys(pattern);

  if (keys.length > 0) {
    await Promise.all(keys.map((k) => redis.del(k)));
  }

  res.status(204).send();
});

export default router;
