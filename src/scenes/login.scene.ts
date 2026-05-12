import Bot from "node-telegram-bot-api";
import { ENV } from "../config/env";
import { getSession } from "../state/session";
import { mainKeyboard } from "../utils/keyboards";
import { loginPanel } from "../services/auth.service";

export function registerLoginScene(bot: Bot) {
  bot.on("message", async (msg) => {
    const userId = msg.from?.id;
    const chatId = msg.chat.id;
    const session = getSession(userId);
    if (session.authenticated) return;
    if (!msg.text || msg.text.startsWith("/")) return;

    if (!session.step) {
      session.step = "username";
      bot.sendMessage(chatId, "👤 نام کاربری پنل را وارد کنید:");
      return;
    }

    if (session.step === "username") {
      session.data = { username: msg.text };
      session.step = "password";
      bot.sendMessage(chatId, "🔑 رمز عبور پنل را وارد کنید:");
      return;
    }

    if (session.step === "password") {
      const { username } = session.data!;
      const password = msg.text;
      session.data = { ...session.data, password };
      
      try {
        const cookie = await loginPanel(username, password);

        session.authenticated = true;
        session.panelCookie = cookie;
        session.step = undefined;

        bot.sendMessage(
          msg.chat.id,
          "✅ احراز هویت موفق بود.\nبه پنل متصل شدیم.",
          mainKeyboard,
        );
      } catch {
        session.step = undefined;
        bot.sendMessage(
          msg.chat.id,
          "❌ اتصال به پنل ناموفق بود.\nتنظیمات پنل را بررسی کن.",
        );
      }
    }
  });
}
