import { getSession } from "../state/session";
import Bot, { Message } from "node-telegram-bot-api";
import { isSessionExpired, resetSession } from "../state/session";
import { ENV } from "../config/env";

export function requireAuth(bot: Bot, msg: Message, next: () => void) {
  const session = getSession(msg.from!.id);
  if (!session.authenticated && !session.panelCookie) {
    bot.sendMessage(msg.chat.id, "🔐 لطفاً ابتدا لاگین کن.");
    return;
  }

  if (isSessionExpired(session)) {
    resetSession(msg.from!.id);
    bot.sendMessage(msg.chat.id, "⏱ سشن منقضی شد. دوباره /start را بزن.");
    return;
  }

  session.lastActivity = Date.now();
  next();
}

export function isAuthorized(userId?: number): boolean {
  if (!userId) return false;
  return ENV.ADMINS.includes(userId);
}
