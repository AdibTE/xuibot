import { resetSession } from "../state/session";
export function registerCancel(bot) {
    bot.onText(/\/cancel/, msg => {
        resetSession(msg.from.id);
        bot.sendMessage(msg.chat.id, "❌ عملیات لغو شد.\nبه حالت اصلی برگشتیم.");
    });
}
