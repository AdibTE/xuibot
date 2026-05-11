"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCancel = registerCancel;
const session_1 = require("../state/session");
function registerCancel(bot) {
    bot.onText(/\/cancel/, msg => {
        (0, session_1.resetSession)(msg.from.id);
        bot.sendMessage(msg.chat.id, "❌ عملیات لغو شد.\nبه حالت اصلی برگشتیم.");
    });
}
