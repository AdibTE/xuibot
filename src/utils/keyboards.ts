import { SendMessageOptions, KeyboardButton } from "node-telegram-bot-api";

export const mainKeyboard: SendMessageOptions = {
  reply_markup: {
    keyboard: [
      [{ text: "👤 کاربران آنلاین" }, { text: "📊 وضعیت سیستم" }],
      [{ text: "🌐 Inbounds" }, { text: "📈 ترافیک" }],
      [{ text: "⚙️ تنظیمات" }],
    ] as KeyboardButton[][],
    resize_keyboard: true,
  },
};
