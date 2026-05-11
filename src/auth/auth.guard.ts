import { getSession } from "../state/session";
import Bot, { Message } from "node-telegram-bot-api";

export function requireAuth(bot: Bot, msg: Message, next: () => void) {
  const session = getSession(msg.from!.id);

  if (!session.authenticated) {
    bot.sendMessage(msg.chat.id, "🔐 لطفاً ابتدا پسورد مدیریت را وارد کنید.");
    return;
  }

  session.lastActivity = Date.now();
  next();
}
