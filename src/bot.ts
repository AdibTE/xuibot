import TelegramBot from "node-telegram-bot-api";
import { ENV } from "./config/env";
import { registerCancel } from "./utils/cancel";
import { registerLoginScene } from "./scenes/login.scene";
import { registerInboundsScene } from "./scenes/inbounds.scene";
import { registerClientsScene } from "./scenes/clients.scene";
import { registerSettingsScene } from "./scenes/settings.scene";

const bot = new TelegramBot(ENV.BOT_TOKEN, { polling: true });


bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `🤖 ربات مدیریت پنل 3x-ui

قابلیت‌ها:
• مدیریت Inbound ها
• مدیریت کاربران
• مشاهده وضعیت سیستم
• ریست ترافیک
• فعال/غیرفعال‌سازی کاربران

⚠️ برای ادامه، پسورد مدیریت را وارد کنید.`,
  );
});

registerCancel(bot);
registerLoginScene(bot);
registerInboundsScene(bot);
registerClientsScene(bot);
registerSettingsScene(bot);

console.log("🚀 Bot is running...");
