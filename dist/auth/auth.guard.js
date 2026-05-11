"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const session_1 = require("../state/session");
const session_2 = require("../state/session");
function requireAuth(bot, msg, next) {
    const session = (0, session_1.getSession)(msg.from.id);
    if (!session.authenticated) {
        bot.sendMessage(msg.chat.id, "🔐 لطفاً ابتدا لاگین کن.");
        return;
    }
    if ((0, session_2.isSessionExpired)(session)) {
        (0, session_2.resetSession)(msg.from.id);
        bot.sendMessage(msg.chat.id, "⏱ سشن منقضی شد. دوباره /start را بزن.");
        return;
    }
    session.lastActivity = Date.now();
    next();
}
