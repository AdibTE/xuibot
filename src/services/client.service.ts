import { api } from "../config/api";
import { ensurePanelLogin } from "./auth.service";

export async function getClients(inboundId: number) {
  await ensurePanelLogin();
  const { data } = await api.get(`/panel/api/inbounds/get/${inboundId}`);
  return data.clients || [];
}

export async function addClient(inboundId: number, payload: any) {
  await ensurePanelLogin();
  const { data } = await api.post("/panel/api/inbounds/addClient", {
    id: inboundId,
    settings: payload,
  });
  return data;
}

export async function deleteClient(inboundId: number, email: string) {
  await ensurePanelLogin();
  const { data } = await api.post("/panel/api/inbounds/delClient", {
    id: inboundId,
    email,
  });
  return data;
}

export async function resetClientTraffic(
  inboundId: number,
  email: string
) {
  await ensurePanelLogin();
  const { data } = await api.post(
    "/panel/api/inbounds/resetClientTraffic",
    {
      id: inboundId,
      email,
    }
  );
  return data;
}