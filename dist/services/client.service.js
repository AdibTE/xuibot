import { api } from "../config/api";
import { ensurePanelLogin } from "./auth.service";
export async function getClients(inboundId) {
    await ensurePanelLogin();
    const { data } = await api.get(`/panel/api/inbounds/get/${inboundId}`);
    return data.clients || [];
}
export async function addClient(inboundId, payload) {
    await ensurePanelLogin();
    const { data } = await api.post("/panel/api/inbounds/addClient", {
        id: inboundId,
        settings: payload,
    });
    return data;
}
export async function deleteClient(inboundId, email) {
    await ensurePanelLogin();
    const { data } = await api.post("/panel/api/inbounds/delClient", {
        id: inboundId,
        email,
    });
    return data;
}
export async function resetClientTraffic(inboundId, email) {
    await ensurePanelLogin();
    const { data } = await api.post("/panel/api/inbounds/resetClientTraffic", {
        id: inboundId,
        email,
    });
    return data;
}
