import axios from "axios";
import { ENV } from "./env";

export const api = axios.create({
  baseURL: ENV.PANEL_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
});