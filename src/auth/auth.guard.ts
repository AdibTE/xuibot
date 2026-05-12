import { getSession, setSession } from "../state/session";
import Bot, { Message } from "node-telegram-bot-api";
import { ENV } from "../config/env";

export function requireAuth(bot: Bot, msg: Message, next: () => void) {
  if (!getSession("authenticated") || !getSession("panelCookie")) {
    bot.sendMessage(msg.chat.id, "🔐 لطفاً ابتدا لاگین کن.");
    return;
  }

  setSession({ lastActivity: Date.now() });
  next();
}

export function isAuthorized(userId?: number): boolean {
  if (!userId) return false;
  return ENV.ADMINS.includes(userId);
}
