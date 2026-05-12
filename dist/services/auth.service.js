import { api } from "../config/api";
import { ENV } from "../config/env";
/**
 * Login to 3x-ui panel
 * This will store session cookie inside axios instance
 */
export async function loginPanel() {
    await api.post("/login", {
        username: ENV.PANEL_USERNAME,
        password: ENV.PANEL_PASSWORD,
    });
}
/**
 * Check if current session is still valid
 * 3x-ui returns 200 if logged in, 401 otherwise
 */
export async function checkPanelSession() {
    try {
        await api.get("/panel/api/status");
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Force re-login if session expired
 */
export async function ensurePanelLogin() {
    const isValid = await checkPanelSession();
    if (!isValid) {
        await loginPanel();
    }
}
