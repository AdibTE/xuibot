import { api } from "../config/api";

export async function getInbounds() {

  const { data } = await api.get("/panel/api/inbounds");
  return data;
}

export async function createInbound(payload: any) {

  const { data } = await api.post("/panel/api/inbounds/add", payload);
  return data;
}

export async function deleteInbound(id: number) {

  const { data } = await api.post("/panel/api/inbounds/del", { id });
  return data;
}

export async function toggleInbound(id: number, enable: boolean) {

  const { data } = await api.post(
    `/panel/api/inbounds/${enable ? "enable" : "disable"}`,
    { id }
  );
  return data;
}