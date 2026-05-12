const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 دقیقه
const sessions = new Map();
export function getSession(userId) {
    if (!sessions.has(userId)) {
        sessions.set(userId, {
            authenticated: false,
            lastActivity: Date.now(),
        });
    }
    return sessions.get(userId);
}
export function resetSession(userId) {
    sessions.set(userId, {
        authenticated: false,
        lastActivity: Date.now(),
    });
}
export function isSessionExpired(session) {
    return Date.now() - session.lastActivity > SESSION_TIMEOUT;
}
