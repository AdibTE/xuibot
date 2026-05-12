import { api } from "../config/api";
import { ensurePanelLogin } from "./auth.service";
export async function getSystemStatus() {
    await ensurePanelLogin();
    const { data } = await api.get("/panel/api/status");
    return data;
}
export async function getOnlineUsers() {
    await ensurePanelLogin();
    const { data } = await api.get("/panel/api/online");
    return data;
}
export async function getTrafficStats() {
    await ensurePanelLogin();
    const { data } = await api.get("/panel/api/traffic");
    return data;
}
