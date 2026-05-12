import Bot from "node-telegram-bot-api";
import { requireAuth } from "../auth/auth.guard";
import {
  getSystemStatus,
  getOnlineUsers,
  getTrafficStats,
} from "../services/system.service";

export function registerSystemScene(bot: Bot) {
  // 📊 وضعیت سیستم
  bot.onText(/📊 وضعیت سیستم/, (msg) => {
    requireAuth(bot, msg, async () => {
      try {
        const status = await getSystemStatus();

        bot.sendMessage(
          msg.chat.id,
          `📊 وضعیت سیستم

          🖥 OS: ${status.os}
          ⏱ Uptime: ${status.uptime}
          🧠 CPU: ${status.cpu}%
          💾 RAM: ${status.mem.current} / ${status.mem.total}
          💽 Disk: ${status.disk.current} / ${status.disk.total}`,
        );
      } catch {
        bot.sendMessage(msg.chat.id, "❌ دریافت وضعیت سیستم ناموفق بود.");
      }
    });
  });

  // 📡 کاربران آنلاین
  bot.onText(/👤 کاربران آنلاین/, (msg) => {
    requireAuth(bot, msg, async () => {
      try {
        const online = await getOnlineUsers();

        bot.sendMessage(msg.chat.id, `👤 کاربران آنلاین: ${online.length}`);
      } catch {
        bot.sendMessage(msg.chat.id, "❌ دریافت کاربران آنلاین ناموفق بود.");
      }
    });
  });

  // 📈 ترافیک
  bot.onText(/📈 ترافیک/, (msg) => {
    requireAuth(bot, msg, async () => {
      try {
        const traffic = await getTrafficStats();

        bot.sendMessage(
          msg.chat.id,
          `📈 ترافیک کلی

          ⬆️ آپلود: ${traffic.up}
          ⬇️ دانلود: ${traffic.down}`,
        );
      } catch {
        bot.sendMessage(msg.chat.id, "❌ دریافت اطلاعات ترافیک ناموفق بود.");
      }
    });
  });
}
