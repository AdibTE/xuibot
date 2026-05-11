"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLoginScene = registerLoginScene;
const env_1 = require("../config/env");
const session_1 = require("../state/session");
const keyboards_1 = require("../utils/keyboards");
const auth_service_1 = require("../services/auth.service");
function registerLoginScene(bot) {
    bot.on("message", async (msg) => {
        if (!msg.text || msg.text.startsWith("/"))
            return;
        const session = (0, session_1.getSession)(msg.from.id);
        if (session.authenticated)
            return;
        if (msg.text !== env_1.ENV.BOT_PASSWORD) {
            bot.sendMessage(msg.chat.id, "❌ پسورد اشتباهه.");
            return;
        }
        try {
            await (0, auth_service_1.loginPanel)();
            session.authenticated = true;
            bot.sendMessage(msg.chat.id, "✅ احراز هویت موفق بود.\nبه پنل متصل شدیم.", keyboards_1.mainKeyboard);
        }
        catch {
            bot.sendMessage(msg.chat.id, "❌ اتصال به پنل ناموفق بود.\nتنظیمات پنل را بررسی کن.");
        }
    });
}
