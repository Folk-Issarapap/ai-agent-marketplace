import { defineConfig } from "drizzle-kit";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env - root .env takes precedence over packages/db/.env
function loadEnv() {
  const envPaths = [
    resolve(__dirname, ".env"),           // packages/db/.env
    resolve(__dirname, "../../.env"),     // root .env (overrides)
  ];
  for (const envPath of envPaths) {
    try {
      const envFile = readFileSync(envPath, "utf-8");
      envFile.split("\n").forEach((line) => {
        const [key, ...values] = line.split("=");
        if (key && values.length > 0) {
          const value = values.join("=").trim().replace(/^["']|["']$/g, "");
          process.env[key.trim()] = value; // root .env overwrites when loaded last
        }
      });
    } catch {
      // file not found, skip
    }
  }
}

loadEnv();

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
