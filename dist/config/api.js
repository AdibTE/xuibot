import axios from "axios";
import { ENV } from "./env";
import { loginPanel } from "../services/auth.service";
export const api = axios.create({
    baseURL: ENV.PANEL_BASE_URL,
    timeout: 10000,
    withCredentials: true,
});
let isRefreshing = false;
api.interceptors.response.use(res => res, async (error) => {
    if (error.response?.status === 401 && !isRefreshing) {
        isRefreshing = true;
        try {
            await loginPanel();
            isRefreshing = false;
            return api(error.config); // retry original request
        }
        catch (e) {
            isRefreshing = false;
            throw e;
        }
    }
    throw error;
});
