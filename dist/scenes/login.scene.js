import { ENV } from "../config/env";
import { getSession } from "../state/session";
import { mainKeyboard } from "../utils/keyboards";
import { loginPanel } from "../services/auth.service";
export function registerLoginScene(bot) {
    bot.on("message", async (msg) => {
        if (!msg.text || msg.text.startsWith("/"))
            return;
        const session = getSession(msg.from.id);
        if (session.authenticated)
            return;
        if (msg.text !== ENV.BOT_PASSWORD) {
            bot.sendMessage(msg.chat.id, "❌ پسورد اشتباهه.");
            return;
        }
        try {
            await loginPanel();
            session.authenticated = true;
            bot.sendMessage(msg.chat.id, "✅ احراز هویت موفق بود.\nبه پنل متصل شدیم.", mainKeyboard);
        }
        catch {
            bot.sendMessage(msg.chat.id, "❌ اتصال به پنل ناموفق بود.\nتنظیمات پنل را بررسی کن.");
        }
    });
}
