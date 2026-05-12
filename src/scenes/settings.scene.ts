import Bot from "node-telegram-bot-api";
import { getSession, setSession } from "../state/session";

export function registerSettingsScene(bot: Bot) {
  // ⚙️ Settings entry
  bot.onText(/⚙️ تنظیمات/, (msg) => {
    setSession({ step: "SETTINGS_MENU" });

    bot.sendMessage(
      msg.chat.id,
      `⚙️ تنظیمات

        1️⃣ آخرین فعالیت

        عدد گزینه را ارسال کن`,
    );
  });

  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    if (!getSession("authenticated") || !getSession("step")) return;

    const last = new Date(getSession("lastActivity")).toLocaleString();

    if (getSession("step") == "SETTINGS_MENU") {
      // 🧭 MENU
      if (msg.text === "1") {
        bot.sendMessage(msg.chat.id, `🕒 Last activity: ${last}`);
        setSession({ step: undefined });
        return;
      }
    }
  });
}
