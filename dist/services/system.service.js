"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStatus = getSystemStatus;
exports.getOnlineUsers = getOnlineUsers;
exports.getTrafficStats = getTrafficStats;
const api_1 = require("../config/api");
const auth_service_1 = require("./auth.service");
async function getSystemStatus() {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.get("/panel/api/status");
    return data;
}
async function getOnlineUsers() {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.get("/panel/api/online");
    return data;
}
async function getTrafficStats() {
    await (0, auth_service_1.ensurePanelLogin)();
    const { data } = await api_1.api.get("/panel/api/traffic");
    return data;
}
