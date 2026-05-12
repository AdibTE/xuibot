import TelegramBot from "node-telegram-bot-api";

import { ENV } from "./config/env";
import { registerCancel } from "./utils/cancel";
import { registerLoginScene } from "./scenes/login.scene";
import { registerInboundsScene } from "./scenes/inbounds.scene";
import { registerClientsScene } from "./scenes/clients.scene";
import { registerSettingsScene } from "./scenes/settings.scene";
import { isAuthorized } from "./auth/auth.guard";
import { SocksProxyAgent } from "socks-proxy-agent/dist";

const proxy = "socks5://127.0.0.1:40000";
const agent = new SocksProxyAgent(proxy);

const bot = new TelegramBot(ENV.BOT_TOKEN, {
  polling: true,
  request: {
    url: "https://api.telegram.org",
    agent: agent as any,
  },
});

bot.onText(/\/start/, (msg) => {
  const userId = msg.from?.id;

  if (!isAuthorized(userId)) {
    bot.sendMessage(msg.chat.id, "⛔ شما اجازه استفاده از این ربات را ندارید.");
    return;
  }

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
