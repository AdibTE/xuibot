import { api } from "../config/api";

export async function getSystemStatus() {
  const { data } = await api.get("/panel/api/status");
  return data;
}

export async function getOnlineUsers() {
  const { data } = await api.get("/panel/api/online");
  return data;
}

export async function getTrafficStats() {
  const { data } = await api.get("/panel/api/traffic");
  return data;
}
