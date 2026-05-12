import { resetSession } from "../state/session";
import Bot from "node-telegram-bot-api";

export function registerCancel(bot: Bot) {
  bot.onText(/\/cancel/, (msg) => {
    resetSession(msg.from!.id);
    bot.sendMessage(msg.chat.id, "❌ عملیات لغو شد.\nبه حالت اصلی برگشتیم.");
  });
}
