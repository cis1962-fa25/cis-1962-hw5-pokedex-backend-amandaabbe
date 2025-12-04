import { createClient } from "redis";

let client;

if (process.env.REDIS_URL) {
  client = createClient({ url: process.env.REDIS_URL });
} else {
  client = createClient({
    socket: {
      host: process.env.REDIS_HOST ?? "localhost",
      port: Number(process.env.REDIS_PORT ?? 6379)
    }
  });
}

client.connect().catch(console.error);

export default client;
