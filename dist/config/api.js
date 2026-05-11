"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("./env");
const auth_service_1 = require("../services/auth.service");
exports.api = axios_1.default.create({
    baseURL: env_1.ENV.PANEL_BASE_URL,
    timeout: 10000,
    withCredentials: true,
});
let isRefreshing = false;
exports.api.interceptors.response.use(res => res, async (error) => {
    if (error.response?.status === 401 && !isRefreshing) {
        isRefreshing = true;
        try {
            await (0, auth_service_1.loginPanel)();
            isRefreshing = false;
            return (0, exports.api)(error.config); // retry original request
        }
        catch (e) {
            isRefreshing = false;
            throw e;
        }
    }
    throw error;
});
