"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const env_1 = require("./config/env");
const cancel_1 = require("./utils/cancel");
const login_scene_1 = require("./scenes/login.scene");
const inbounds_scene_1 = require("./scenes/inbounds.scene");
const clients_scene_1 = require("./scenes/clients.scene");
const settings_scene_1 = require("./scenes/settings.scene");
const bot = new node_telegram_bot_api_1.default(env_1.ENV.BOT_TOKEN, { polling: true });
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `🤖 ربات مدیریت پنل 3x-ui

قابلیت‌ها:
• مدیریت Inbound ها
• مدیریت کاربران
• مشاهده وضعیت سیستم
• ریست ترافیک
• فعال/غیرفعال‌سازی کاربران

⚠️ برای ادامه، پسورد مدیریت را وارد کنید.`);
});
(0, cancel_1.registerCancel)(bot);
(0, login_scene_1.registerLoginScene)(bot);
(0, inbounds_scene_1.registerInboundsScene)(bot);
(0, clients_scene_1.registerClientsScene)(bot);
(0, settings_scene_1.registerSettingsScene)(bot);
console.log("🚀 Bot is running...");
