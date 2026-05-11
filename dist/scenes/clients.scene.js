"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerClientsScene = registerClientsScene;
const auth_guard_1 = require("../auth/auth.guard");
const session_1 = require("../state/session");
const client_service_1 = require("../services/client.service");
function registerClientsScene(bot) {
    // 👤 Clients entry
    bot.onText(/👤 کاربران/, (msg) => {
        (0, auth_guard_1.requireAuth)(bot, msg, () => {
            const session = (0, session_1.getSession)(msg.from.id);
            session.step = "CLIENT_MENU";
            session.data = {};
            bot.sendMessage(msg.chat.id, `👤 مدیریت کاربران
1️⃣ لیست کاربران
2️⃣ افزودن کاربر
3️⃣ ریست ترافیک کاربر
4️⃣ حذف کاربر

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
                case "CLIENT_MENU":
                    session.data = {};
                    if (msg.text === "1") {
                        session.step = "CLIENT_LIST_INBOUND";
                        bot.sendMessage(msg.chat.id, "🆔 inbound ID را وارد کن:");
                    }
                    if (msg.text === "2") {
                        session.step = "CLIENT_ADD_INBOUND";
                        bot.sendMessage(msg.chat.id, "🆔 inbound ID را وارد کن:");
                    }
                    if (msg.text === "3") {
                        session.step = "CLIENT_RESET_INBOUND";
                        bot.sendMessage(msg.chat.id, "🆔 inbound ID را وارد کن:");
                    }
                    if (msg.text === "4") {
                        session.step = "CLIENT_DELETE_INBOUND";
                        bot.sendMessage(msg.chat.id, "🆔 inbound ID را وارد کن:");
                    }
                    break;
                // 📋 LIST
                case "CLIENT_LIST_INBOUND":
                    session.data.inboundId = Number(msg.text);
                    const clients = await (0, client_service_1.getClients)(session.data.inboundId);
                    session.step = undefined;
                    if (!clients.length) {
                        bot.sendMessage(msg.chat.id, "❌ کاربری وجود ندارد");
                        return;
                    }
                    bot.sendMessage(msg.chat.id, clients
                        .map((c) => `📧 ${c.email}\n⬆️ ${c.up} | ⬇️ ${c.down}`)
                        .join("\n\n"));
                    break;
                // ➕ ADD
                case "CLIENT_ADD_INBOUND":
                    session.data.inboundId = Number(msg.text);
                    session.step = "CLIENT_ADD_EMAIL";
                    bot.sendMessage(msg.chat.id, "📧 email کاربر را وارد کن:");
                    break;
                case "CLIENT_ADD_EMAIL":
                    session.data.email = msg.text;
                    session.step = "CLIENT_ADD_LIMIT";
                    bot.sendMessage(msg.chat.id, "📦 محدودیت ترافیک (GB) – عدد یا 0 برای نامحدود:");
                    break;
                case "CLIENT_ADD_LIMIT":
                    session.data.limit = Number(msg.text);
                    session.step = "CLIENT_ADD_CONFIRM";
                    bot.sendMessage(msg.chat.id, `📌 تأیید افزودن کاربر
Inbound: ${session.data.inboundId}
Email: ${session.data.email}
Limit: ${session.data.limit} GB

برای تأیید بنویس: yes`);
                    break;
                case "CLIENT_ADD_CONFIRM":
                    if (msg.text.toLowerCase() !== "yes") {
                        session.step = undefined;
                        bot.sendMessage(msg.chat.id, "❌ لغو شد");
                        return;
                    }
                    await (0, client_service_1.addClient)(session.data.inboundId, {
                        email: session.data.email,
                        totalGB: session.data.limit,
                    });
                    session.step = undefined;
                    bot.sendMessage(msg.chat.id, "✅ کاربر اضافه شد");
                    break;
                // 🔄 RESET
                case "CLIENT_RESET_INBOUND":
                    session.data.inboundId = Number(msg.text);
                    session.step = "CLIENT_RESET_EMAIL";
                    bot.sendMessage(msg.chat.id, "📧 email کاربر:");
                    break;
                case "CLIENT_RESET_EMAIL":
                    await (0, client_service_1.resetClientTraffic)(session.data.inboundId, msg.text);
                    session.step = undefined;
                    bot.sendMessage(msg.chat.id, "♻️ ترافیک ریست شد");
                    break;
                // 🗑 DELETE
                case "CLIENT_DELETE_INBOUND":
                    session.data.inboundId = Number(msg.text);
                    session.step = "CLIENT_DELETE_EMAIL";
                    bot.sendMessage(msg.chat.id, "📧 email کاربر:");
                    break;
                case "CLIENT_DELETE_EMAIL":
                    session.data.email = msg.text;
                    session.step = "CLIENT_DELETE_CONFIRM";
                    bot.sendMessage(msg.chat.id, `⚠️ حذف کاربر ${session.data.email}\nبرای تأیید بنویس: delete`);
                    break;
                case "CLIENT_DELETE_CONFIRM":
                    if (msg.text.toLowerCase() !== "delete") {
                        session.step = undefined;
                        bot.sendMessage(msg.chat.id, "❌ لغو شد");
                        return;
                    }
                    await (0, client_service_1.deleteClient)(session.data.inboundId, session.data.email);
                    session.step = undefined;
                    bot.sendMessage(msg.chat.id, "🗑 کاربر حذف شد");
                    break;
            }
        }
        catch {
            session.step = undefined;
            bot.sendMessage(msg.chat.id, "❌ خطا در عملیات. دوباره تلاش کن.");
        }
    });
}
