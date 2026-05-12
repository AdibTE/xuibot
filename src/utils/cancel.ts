import { setSession } from "../state/session";
import Bot from "node-telegram-bot-api";

export function registerCancel(bot: Bot) {
  bot.onText(/cancel/, (msg) => {
    setSession({ step: undefined });
    bot.sendMessage(msg.chat.id, "❌ عملیات لغو شد.\nبه حالت اصلی برگشتیم.");
  });
}
