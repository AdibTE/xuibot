import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  telegram: {
    token: requireEnv("TELEGRAM_BOT_TOKEN"),
    allowedUserIds: (process.env.ALLOWED_USER_IDS || "")
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id)),
  },
};
