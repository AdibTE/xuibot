import { getSession } from "../state/session";
import { isSessionExpired, resetSession } from "../state/session";
export function requireAuth(bot, msg, next) {
    const session = getSession(msg.from.id);
    if (!session.authenticated) {
        bot.sendMessage(msg.chat.id, "🔐 لطفاً ابتدا لاگین کن.");
        return;
    }
    if (isSessionExpired(session)) {
        resetSession(msg.from.id);
        bot.sendMessage(msg.chat.id, "⏱ سشن منقضی شد. دوباره /start را بزن.");
        return;
    }
    session.lastActivity = Date.now();
    next();
}
