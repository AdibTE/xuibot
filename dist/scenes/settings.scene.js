"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSettingsScene = registerSettingsScene;
const auth_guard_1 = require("../auth/auth.guard");
const session_1 = require("../state/session");
const auth_service_1 = require("../services/auth.service");
function registerSettingsScene(bot) {
    // ⚙️ Settings entry
    bot.onText(/⚙️ تنظیمات/, (msg) => {
        (0, auth_guard_1.requireAuth)(bot, msg, () => {
            const session = (0, session_1.getSession)(msg.from.id);
            session.step = "SETTINGS_MENU";
            bot.sendMessage(msg.chat.id, `⚙️ تنظیمات

1️⃣ خروج از حساب
2️⃣ ریست سشن پنل
3️⃣ ریست کامل سشن من
4️⃣ وضعیت سشن

عدد گزینه را ارسال کن`);
        });
    });
    bot.on("message", async (msg) => {
        if (!msg.text || msg.text.startsWith("/"))
            return;
        const session = (0, session_1.getSession)(msg.from.id);
        if (!session.authenticated || !session.step)
            return;
        try {
            switch (session.step) {
                // 🧭 MENU
                case "SETTINGS_MENU":
                    // 1️⃣ Logout
                    if (msg.text === "1") {
                        (0, session_1.resetSession)(msg.from.id);
                        bot.sendMessage(msg.chat.id, "🔒 از حساب خارج شدی.\nبرای ادامه /start را بزن.");
                        return;
                    }
                    // 2️⃣ Reset panel session
                    if (msg.text === "2") {
                        await (0, auth_service_1.loginPanel)();
                        session.step = undefined;
                        bot.sendMessage(msg.chat.id, "♻️ سشن پنل با موفقیت ریست شد.");
                        return;
                    }
                    // 3️⃣ Reset user session
                    if (msg.text === "3") {
                        (0, session_1.resetSession)(msg.from.id);
                        bot.sendMessage(msg.chat.id, "🧹 سشن شما به‌طور کامل ریست شد.\n/start");
                        return;
                    }
                    // 4️⃣ Session info
                    if (msg.text === "4") {
                        const last = new Date(session.lastActivity).toLocaleString();
                        session.step = undefined;
                        bot.sendMessage(msg.chat.id, `ℹ️ وضعیت سشن

🔐 Authenticated: ${session.authenticated ? "Yes" : "No"}
🕒 Last activity: ${last}`);
                        return;
                    }
                    bot.sendMessage(msg.chat.id, "❓ گزینه نامعتبر");
                    break;
            }
        }
        catch {
            session.step = undefined;
            bot.sendMessage(msg.chat.id, "❌ خطا در تنظیمات. دوباره تلاش کن.");
        }
    });
}
