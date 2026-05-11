"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSystemScene = registerSystemScene;
const auth_guard_1 = require("../auth/auth.guard");
const system_service_1 = require("../services/system.service");
function registerSystemScene(bot) {
    // 📊 وضعیت سیستم
    bot.onText(/📊 وضعیت سیستم/, (msg) => {
        (0, auth_guard_1.requireAuth)(bot, msg, async () => {
            try {
                const status = await (0, system_service_1.getSystemStatus)();
                bot.sendMessage(msg.chat.id, `📊 وضعیت سیستم

🖥 OS: ${status.os}
⏱ Uptime: ${status.uptime}
🧠 CPU: ${status.cpu}%
💾 RAM: ${status.mem.current} / ${status.mem.total}
💽 Disk: ${status.disk.current} / ${status.disk.total}`);
            }
            catch {
                bot.sendMessage(msg.chat.id, "❌ دریافت وضعیت سیستم ناموفق بود.");
            }
        });
    });
    // 📡 کاربران آنلاین
    bot.onText(/👤 کاربران آنلاین/, (msg) => {
        (0, auth_guard_1.requireAuth)(bot, msg, async () => {
            try {
                const online = await (0, system_service_1.getOnlineUsers)();
                bot.sendMessage(msg.chat.id, `👤 کاربران آنلاین: ${online.length}`);
            }
            catch {
                bot.sendMessage(msg.chat.id, "❌ دریافت کاربران آنلاین ناموفق بود.");
            }
        });
    });
    // 📈 ترافیک
    bot.onText(/📈 ترافیک/, (msg) => {
        (0, auth_guard_1.requireAuth)(bot, msg, async () => {
            try {
                const traffic = await (0, system_service_1.getTrafficStats)();
                bot.sendMessage(msg.chat.id, `📈 ترافیک کلی

⬆️ آپلود: ${traffic.up}
⬇️ دانلود: ${traffic.down}`);
            }
            catch {
                bot.sendMessage(msg.chat.id, "❌ دریافت اطلاعات ترافیک ناموفق بود.");
            }
        });
    });
}
