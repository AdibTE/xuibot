import Bot from "node-telegram-bot-api";
import { getSession, setSession } from "../state/session";
import { mainKeyboard } from "../utils/keyboards";
import { loginPanel } from "../services/auth.service";

export function registerLoginScene(bot: Bot) {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    if (getSession("authenticated")) return;
    if (!msg.text || msg.text.startsWith("/")) return;

    if (!getSession("step")) {
      setSession({ step: "username" });
      bot.sendMessage(chatId, "👤 نام کاربری پنل را وارد کنید:");
      return;
    }

    if (getSession("step") === "username") {
      setSession({ credentials: { username: msg.text } });
      setSession({ step: "password" });
      bot.sendMessage(chatId, "🔑 رمز عبور پنل را وارد کنید:");
      return;
    }

    if (getSession("step") === "password") {
      setSession({
        credentials: { ...getSession("credentials"), password: msg.text },
      });
      setSession({ step: undefined });

      try {
        const { username, password } = getSession("credentials");
        const cookie = await loginPanel(username!, password!);

        setSession({ authenticated: true });
        setSession({ panelCookie: cookie });

        bot.sendMessage(
          msg.chat.id,
          "✅ احراز هویت موفق بود.\nبه پنل متصل شدیم.",
          mainKeyboard,
        );
      } catch {
        setSession({ step: undefined });
        bot.sendMessage(
          msg.chat.id,
          "❌ اتصال به پنل ناموفق بود.\nتنظیمات پنل را بررسی کن.",
        );
      }
    }
  });
}
