export interface PokemonMove {
  name: string;
  power: number | null;
  type: string;
}

export interface PokemonType {
  name: string;
  color: string;
}

export interface Pokemon {
  id: number;
  name: string;
  description: string;
  sprites: any;
  types: PokemonType[];
  stats: any;
  moves: PokemonMove[];
}

export interface InsertBoxEntry {
  level: number;
  location: string;
  notes?: string;
  pokemonId: number;
}

export interface BoxEntry extends InsertBoxEntry {
  id: string;
  createdAt: string;
}
