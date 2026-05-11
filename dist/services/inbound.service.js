"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInbounds = getInbounds;
exports.createInbound = createInbound;
exports.deleteInbound = deleteInbound;
exports.toggleInbound = toggleInbound;
const api_1 = require("../config/api");
const auth_service_1 = require("./auth.service");
async function getInbounds() {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.get("/panel/api/inbounds");
    return data;
}
async function createInbound(payload) {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.post("/panel/api/inbounds/add", payload);
    return data;
}
async function deleteInbound(id) {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.post("/panel/api/inbounds/del", { id });
    return data;
}
async function toggleInbound(id, enable) {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.post(`/panel/api/inbounds/${enable ? "enable" : "disable"}`, { id });
    return data;
}
