export interface Session {
  authenticated: boolean;
  lastActivity: number;
  credentials: { username?: string; password?: string };
  inboundScene: {
    protocol?: string;
    port?: number;
    remark?: string;
    id?: number;
  };
  clientScene: {
    inboundId?: number;
    email?: string;
    limit?: number;
  };
  step?: string;
  panelCookie?: string;
}

const defaultSession: Session = {
  authenticated: false,
  lastActivity: Date.now(),
  step: undefined,
  credentials: { username: undefined, password: undefined },
  panelCookie: undefined,
  inboundScene: {
    port: undefined,
    protocol: undefined,
    remark: undefined,
    id: undefined,
  },
  clientScene: {
    inboundId: undefined,
    email: undefined,
    limit: undefined,
  },
};

let sessions = defaultSession;

export function getSession<K extends keyof Session>(key: K): Session[K] {
  return sessions[key];
}

export function setSession(dto: Partial<Session>) {
  sessions = {
    ...sessions,
    ...dto,
  };
}

export function resetSession() {
  sessions = defaultSession;
}
