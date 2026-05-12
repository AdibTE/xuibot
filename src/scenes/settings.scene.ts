import Bot from "node-telegram-bot-api";
import { requireAuth } from "../auth/auth.guard";
import { getSession, resetSession } from "../state/session";
import { loginPanel } from "../services/auth.service";

export function registerSettingsScene(bot: Bot) {
  // ⚙️ Settings entry
  bot.onText(/⚙️ تنظیمات/, (msg) => {
    requireAuth(bot, msg, () => {
      const session = getSession(msg.from!.id);
      session.step = "SETTINGS_MENU";

      bot.sendMessage(
        msg.chat.id,
        `⚙️ تنظیمات

1️⃣ خروج از حساب
2️⃣ ریست سشن پنل
3️⃣ ریست کامل سشن من
4️⃣ وضعیت سشن

عدد گزینه را ارسال کن`,
      );
    });
  });

  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;

    const session = getSession(msg.from!.id);
    if (!session.authenticated || !session.step) return;

    try {
      switch (session.step) {
        // 🧭 MENU
        case "SETTINGS_MENU":
          // 1️⃣ Logout
          if (msg.text === "1") {
            resetSession(msg.from!.id);

            bot.sendMessage(
              msg.chat.id,
              "🔒 از حساب خارج شدی.\nبرای ادامه /start را بزن.",
            );
            return;
          }

          // 2️⃣ Reset panel session
          if (msg.text === "2") {
            const session = getSession(msg.from?.id);
            if (!session.data) {
              bot.sendMessage(msg.chat.id, "سشن شما منقضی شده است. دوباره لاگین کنید.");
              return;
            }

            await loginPanel(session.data.username, session.data.password);
            session.step = undefined;
            bot.sendMessage(msg.chat.id, "♻️ سشن پنل با موفقیت ریست شد.");
            return;
          }

          // 3️⃣ Reset user session
          if (msg.text === "3") {
            resetSession(msg.from!.id);

            bot.sendMessage(
              msg.chat.id,
              "🧹 سشن شما به‌طور کامل ریست شد.\n/start",
            );
            return;
          }

          // 4️⃣ Session info
          if (msg.text === "4") {
            const last = new Date(session.lastActivity).toLocaleString();

            session.step = undefined;

            bot.sendMessage(
              msg.chat.id,
              `ℹ️ وضعیت سشن

🔐 Authenticated: ${session.authenticated ? "Yes" : "No"}
🕒 Last activity: ${last}`,
            );
            return;
          }

          bot.sendMessage(msg.chat.id, "❓ گزینه نامعتبر");
          break;
      }
    } catch {
      session.step = undefined;
      bot.sendMessage(msg.chat.id, "❌ خطا در تنظیمات. دوباره تلاش کن.");
    }
  });
}
