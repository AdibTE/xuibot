export interface Session {
  authenticated: boolean;
  lastActivity: number;
  step?: string;
  data?: Record<string, any>;
  panelCookie?: string;
}

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 دقیقه
const sessions = new Map<number, Session>();

export function getSession(userId?: number): Session {
  if (!userId) throw new Error("no user id!");
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      authenticated: false,
      lastActivity: Date.now(),
    });
  }
  return sessions.get(userId)!;
}

export function resetSession(userId: number) {
  sessions.set(userId, {
    authenticated: false,
    lastActivity: Date.now(),
    step: undefined,
    data: undefined
  });
}

export function clearSession(userId: number) {
  sessions.delete(userId);
}

export function isSessionExpired(session: Session): boolean {
  return Date.now() - session.lastActivity > SESSION_TIMEOUT;
}
