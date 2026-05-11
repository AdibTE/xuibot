import { SendMessageOptions, KeyboardButton } from "node-telegram-bot-api";

export const mainKeyboard: SendMessageOptions = {
  reply_markup: {
    keyboard: [
      [{ text: "👤 کاربران" }, { text: "وضعیت سیستم 📊" }],
      [{ text: "🌐 Inbounds" }, { text: "⚙️ تنظیمات" }],
    ] as KeyboardButton[][],
    resize_keyboard: true,
  },
};