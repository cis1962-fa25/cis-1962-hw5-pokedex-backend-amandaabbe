import "dotenv/config";
import express from "express";
import pokemonRouter from "./routes/pokemon";
import boxRouter from "./routes/box";
import authRouter from "./routes/auth";

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Pokedex backend is running");
});

// Mount routes
app.use("/pokemon", pokemonRouter);
app.use("/box", boxRouter);
app.use("/token", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
