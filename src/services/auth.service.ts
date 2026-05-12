import { api } from "../config/api";

/**
 * Login to 3x-ui panel
 * This will store session cookie inside axios instance
 */
export async function loginPanel(username: string, password: string) {
  const res = await api.post("/login", { username, password });

  const cookie = res.headers["set-cookie"]?.[0];
  if (!cookie) throw new Error("Login failed");
  return cookie;
}

/**
 * Check if current session is still valid
 * 3x-ui returns 200 if logged in, 401 otherwise
 */
export async function checkPanelSession(): Promise<boolean> {
  try {
    await api.get("/panel/api/status");
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Force re-login if session expired
 */
export async function ensurePanelLogin(): Promise<void> {
  const isValid = await checkPanelSession();

  if (!isValid) {
    throw new Error("session timedout. relogin");
  }
}
