"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginPanel = loginPanel;
exports.checkPanelSession = checkPanelSession;
exports.ensurePanelLogin = ensurePanelLogin;
const api_1 = require("../config/api");
const env_1 = require("../config/env");
/**
 * Login to 3x-ui panel
 * This will store session cookie inside axios instance
 */
async function loginPanel() {
    await api_1.api.post("/login", {
        username: env_1.ENV.PANEL_USERNAME,
        password: env_1.ENV.PANEL_PASSWORD,
    });
}
/**
 * Check if current session is still valid
 * 3x-ui returns 200 if logged in, 401 otherwise
 */
async function checkPanelSession() {
    try {
        await api_1.api.get("/panel/api/status");
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Force re-login if session expired
 */
async function ensurePanelLogin() {
    const isValid = await checkPanelSession();
    if (!isValid) {
        await loginPanel();
    }
}
