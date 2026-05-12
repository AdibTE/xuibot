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
  BOT_PASSWORD: requireEnv("BOT_PASSWORD"),

  PANEL_BASE_URL: requireEnv("PANEL_BASE_URL"),
  PANEL_USERNAME: requireEnv("PANEL_USERNAME"),
  PANEL_PASSWORD: requireEnv("PANEL_PASSWORD"),

  ADMINS: requireEnv("ADMINS").split(",").map(Number)
};
