import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(currentDir, "../../../.env") });

export const config = {
  port: Number(process.env.API_PORT ?? 4100),
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:5174")
    .split(",")
    .map((origin) => origin.trim()),
  aiProvider: process.env.AI_PROVIDER ?? "mock",
  aiApiKey: process.env.AI_API_KEY,
  aiBaseUrl: process.env.AI_BASE_URL,
  aiModel: process.env.AI_MODEL ?? "mock-pet-ai"
};
