export interface Session {
  authenticated: boolean;
  step?: string;
  data?: Record<string, any>;
  lastActivity: number;
}

const sessions = new Map<number, Session>();

export function getSession(userId: number): Session {
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
  });
}