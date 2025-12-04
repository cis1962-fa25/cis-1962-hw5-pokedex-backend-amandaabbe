import { Router } from "express";
import { getPokemonList, getFullPokemon } from "../services/pokemonService";
import { sendError } from "../utils/errors";

const router = Router();

// GET /pokemon?limit=20&offset=0
router.get("/", async (req, res) => {
  const limit = Number(req.query.limit);
  const offset = Number(req.query.offset);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return sendError(res, "BAD_REQUEST", "Invalid limit/offset", 400);
  }

  const data = await getPokemonList(limit, offset);
  return res.status(200).json(data);
});

// GET /pokemon/:name
router.get("/:name", async (req, res) => {
  const { name } = req.params;

  const pokemon = await getFullPokemon(name);

  if (!pokemon) {
    return sendError(res, "NOT_FOUND", "Pokemon not found", 404);
  }

  res.json(pokemon);
});

export default router;
