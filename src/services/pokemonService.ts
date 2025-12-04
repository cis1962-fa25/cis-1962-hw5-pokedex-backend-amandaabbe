import Pokedex from "pokedex-promise-v2";
import { Pokemon, PokemonMove } from "../types";

const P = new Pokedex();

export async function getFullPokemon(name: string): Promise<Pokemon | null> {
  try {
    const base = await P.getPokemonByName(name.toLowerCase());
    const species = await P.getPokemonSpeciesByName(name.toLowerCase());

    const description =
      species.flavor_text_entries.find((e) => e.language.name === "en")
        ?.flavor_text ?? "No description available";

    // Fetch moves fully
    const moves: PokemonMove[] = await Promise.all(
      base.moves.map(async (m) => {
        const data = await P.getMoveByName(m.move.name);
        return {
          name:
            data.names.find((n) => n.language.name === "en")?.name ??
            data.name,
          power: data.power,
          type: data.type.name,
        };
      })
    );

    return {
      id: base.id,
      name: base.name,
      description,
      sprites: base.sprites,
      stats: base.stats,
      types: base.types.map((t) => ({
        name: t.type.name,
        color: "white",
      })),
      moves,
    };
  } catch (err) {
    return null;
  }
}

export async function getPokemonList(limit: number, offset: number) {
  const list = await P.getPokemonsList({ limit, offset });

  const results = await Promise.all(
    list.results.map((p) => getFullPokemon(p.name))
  );

  return results.filter(Boolean);
}
