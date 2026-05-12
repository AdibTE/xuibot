import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`❌ Missing env variable: ${name}`);
  }
  return value;
}

export const ENV = {
  BOT_TOKEN: requireEnv("BOT_TOKEN"),
  PANEL_BASE_URL: requireEnv("PANEL_BASE_URL"),
  ADMINS: requireEnv("ADMINS").split(",").map(Number)
};
