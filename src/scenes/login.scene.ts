import Bot from "node-telegram-bot-api";
import { ENV } from "../config/env";
import { getSession } from "../state/session";
import { mainKeyboard } from "../utils/keyboards";

export function registerLoginScene(bot: Bot) {
  bot.on("message", msg => {
    if (!msg.text || msg.text.startsWith("/")) return;

    const session = getSession(msg.from!.id);

    if (session.authenticated) return;

    if (msg.text === ENV.BOT_PASSWORD) {
      session.authenticated = true;

      bot.sendMessage(
        msg.chat.id,
        "✅ احراز هویت موفق بود.\nانتخاب کن چی می‌خوای:",
        mainKeyboard
      );
    } else {
      bot.sendMessage(msg.chat.id, "❌ پسورد اشتباهه.");
    }
  });
}