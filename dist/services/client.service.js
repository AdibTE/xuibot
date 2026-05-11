"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClients = getClients;
exports.addClient = addClient;
exports.deleteClient = deleteClient;
exports.resetClientTraffic = resetClientTraffic;
const api_1 = require("../config/api");
const auth_service_1 = require("./auth.service");
async function getClients(inboundId) {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.get(`/panel/api/inbounds/get/${inboundId}`);
    return data.clients || [];
}
async function addClient(inboundId, payload) {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.post("/panel/api/inbounds/addClient", {
        id: inboundId,
        settings: payload,
    });
    return data;
}
async function deleteClient(inboundId, email) {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.post("/panel/api/inbounds/delClient", {
        id: inboundId,
        email,
    });
    return data;
}
async function resetClientTraffic(inboundId, email) {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.post("/panel/api/inbounds/resetClientTraffic", {
        id: inboundId,
        email,
    });
    return data;
}
