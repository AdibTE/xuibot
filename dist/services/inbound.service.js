import { api } from "../config/api";
import { ensurePanelLogin } from "./auth.service";
export async function getInbounds() {
    await ensurePanelLogin();
    const { data } = await api.get("/panel/api/inbounds");
    return data;
}
export async function createInbound(payload) {
    await ensurePanelLogin();
    const { data } = await api.post("/panel/api/inbounds/add", payload);
    return data;
}
export async function deleteInbound(id) {
    await ensurePanelLogin();
    const { data } = await api.post("/panel/api/inbounds/del", { id });
    return data;
}
export async function toggleInbound(id, enable) {
    await ensurePanelLogin();
    const { data } = await api.post(`/panel/api/inbounds/${enable ? "enable" : "disable"}`, { id });
    return data;
}
