"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = getSession;
exports.resetSession = resetSession;
exports.isSessionExpired = isSessionExpired;
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 دقیقه
const sessions = new Map();
function getSession(userId) {
    if (!sessions.has(userId)) {
        sessions.set(userId, {
            authenticated: false,
            lastActivity: Date.now(),
        });
    }
    return sessions.get(userId);
}
function resetSession(userId) {
    sessions.set(userId, {
        authenticated: false,
        lastActivity: Date.now(),
    });
}
function isSessionExpired(session) {
    return Date.now() - session.lastActivity > SESSION_TIMEOUT;
}
