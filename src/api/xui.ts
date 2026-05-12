import axios, { AxiosInstance } from "axios";

export interface PanelCredentials {
  baseUrl: string;
  username: string;
  password: string;
}

export interface InboundClient {
  id?: string;
  alterId?: number;
  email: string;
  limitIp: number;
  totalGB: number;
  expiryTime: number;
  enable: boolean;
  tgId?: string;
  subId?: string;
  comment?: string;
  reset?: number;
}

export interface Inbound {
  id: number;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: boolean;
  expiryTime: number;
  listen: string;
  port: number;
  protocol: string;
  settings: string;
  streamSettings: string;
  tag: string;
  sniffing: string;
  clientStats?: ClientStat[];
}

export interface ClientStat {
  id: number;
  inboundId: number;
  enable: boolean;
  email: string;
  up: number;
  down: number;
  expiryTime: number;
  total: number;
  reset: number;
}

export interface ServerStatus {
  cpu: number;
  mem: { current: number; total: number };
  swap: { current: number; total: number };
  disk: { current: number; total: number };
  xray: { state: string; version: string };
  uptime: number;
  loads: number[];
  tcpCount: number;
  udpCount: number;
  netIO: { up: number; down: number };
  netTraffic: { sent: number; recv: number };
  publicIP: { ipv4: string; ipv6: string };
  appStats: { threads: number; mem: number; uptime: number };
}

export class XuiApiClient {
  private http: AxiosInstance;
  private cookie: string = "";

  constructor(private creds: PanelCredentials) {
    this.http = axios.create({
      baseURL: creds.baseUrl,
      timeout: 15000,
      withCredentials: true,
    });
  }

  private getHeaders() {
    return this.cookie ? { Cookie: this.cookie } : {};
  }

  async login(): Promise<void> {
    const res = await this.http.post(
      "/login",
      { username: this.creds.username, password: this.creds.password },
      { withCredentials: true }
    );

    if (!res.data?.success) {
      throw new Error("Login failed: " + (res.data?.msg || "Invalid credentials"));
    }

    const setCookie = res.headers["set-cookie"];
    if (setCookie && setCookie.length > 0) {
      this.cookie = setCookie.map((c: string) => c.split(";")[0]).join("; ");
    }
  }

  // ─── Inbounds ───────────────────────────────────────────────

  async getInbounds(): Promise<Inbound[]> {
    const res = await this.http.get("/panel/api/inbounds/list", {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to get inbounds");
    return res.data.obj || [];
  }

  async getInbound(id: number): Promise<Inbound> {
    const res = await this.http.get(`/panel/api/inbounds/get/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to get inbound");
    return res.data.obj;
  }

  async addInbound(inbound: Partial<Inbound>): Promise<Inbound> {
    const res = await this.http.post("/panel/api/inbounds/add", inbound, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to add inbound");
    return res.data.obj;
  }

  async deleteInbound(id: number): Promise<void> {
    const res = await this.http.post(`/panel/api/inbounds/del/${id}`, {}, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to delete inbound");
  }

  async updateInbound(id: number, inbound: Partial<Inbound>): Promise<void> {
    const res = await this.http.post(`/panel/api/inbounds/update/${id}`, inbound, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to update inbound");
  }

  async getClientTrafficsByEmail(email: string): Promise<ClientStat> {
    const res = await this.http.get(`/panel/api/inbounds/getClientTraffics/${email}`, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Client not found");
    return res.data.obj;
  }

  async getClientTrafficsByInboundId(id: number): Promise<ClientStat[]> {
    const res = await this.http.get(`/panel/api/inbounds/getClientTrafficsById/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to get traffics");
    return res.data.obj || [];
  }

  async addClient(inboundId: number, client: InboundClient): Promise<void> {
    const payload = {
      id: inboundId,
      settings: JSON.stringify({ clients: [client] }),
    };
    const res = await this.http.post("/panel/api/inbounds/addClient", payload, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to add client");
  }

  async deleteClient(inboundId: number, clientId: string): Promise<void> {
    const res = await this.http.post(
      `/panel/api/inbounds/${inboundId}/delClient/${clientId}`,
      {},
      { headers: this.getHeaders() }
    );
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to delete client");
  }

  async deleteClientByEmail(inboundId: number, email: string): Promise<void> {
    const res = await this.http.post(
      `/panel/api/inbounds/${inboundId}/delClientByEmail/${email}`,
      {},
      { headers: this.getHeaders() }
    );
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to delete client");
  }

  async updateClient(clientId: string, inboundId: number, client: InboundClient): Promise<void> {
    const payload = {
      id: inboundId,
      settings: JSON.stringify({ clients: [client] }),
    };
    const res = await this.http.post(`/panel/api/inbounds/updateClient/${clientId}`, payload, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to update client");
  }

  async resetClientTraffic(inboundId: number, email: string): Promise<void> {
    const res = await this.http.post(
      `/panel/api/inbounds/${inboundId}/resetClientTraffic/${email}`,
      {},
      { headers: this.getHeaders() }
    );
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to reset traffic");
  }

  async resetAllTraffics(): Promise<void> {
    const res = await this.http.post("/panel/api/inbounds/resetAllTraffics", {}, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to reset all traffics");
  }

  async resetAllClientTraffics(inboundId: number): Promise<void> {
    const res = await this.http.post(
      `/panel/api/inbounds/resetAllClientTraffics/${inboundId}`,
      {},
      { headers: this.getHeaders() }
    );
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to reset traffics");
  }

  async deleteDepletedClients(inboundId: number): Promise<void> {
    const res = await this.http.post(
      `/panel/api/inbounds/delDepletedClients/${inboundId}`,
      {},
      { headers: this.getHeaders() }
    );
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to delete depleted clients");
  }

  async getClientIps(email: string): Promise<string[]> {
    const res = await this.http.post(
      `/panel/api/inbounds/clientIps/${email}`,
      {},
      { headers: this.getHeaders() }
    );
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to get IPs");
    return res.data.obj || [];
  }

  async clearClientIps(email: string): Promise<void> {
    const res = await this.http.post(
      `/panel/api/inbounds/clearClientIps/${email}`,
      {},
      { headers: this.getHeaders() }
    );
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to clear IPs");
  }

  async getOnlineClients(): Promise<string[]> {
    const res = await this.http.post("/panel/api/inbounds/onlines", {}, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to get online clients");
    return res.data.obj || [];
  }

  async updateClientTraffic(email: string, up: number, down: number): Promise<void> {
    const res = await this.http.post(
      `/panel/api/inbounds/updateClientTraffic/${email}`,
      { up, down },
      { headers: this.getHeaders() }
    );
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to update traffic");
  }

  // ─── Server ─────────────────────────────────────────────────

  async getServerStatus(): Promise<ServerStatus> {
    const res = await this.http.get("/panel/api/server/status", {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to get server status");
    return res.data.obj;
  }

  async getXrayVersion(): Promise<string[]> {
    const res = await this.http.get("/panel/api/server/getXrayVersion", {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to get Xray versions");
    return res.data.obj || [];
  }

  async stopXrayService(): Promise<void> {
    const res = await this.http.post("/panel/api/server/stopXrayService", {}, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to stop Xray");
  }

  async restartXrayService(): Promise<void> {
    const res = await this.http.post("/panel/api/server/restartXrayService", {}, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to restart Xray");
  }

  async installXray(version: string): Promise<void> {
    const res = await this.http.post(`/panel/api/server/installXray/${version}`, {}, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to install Xray");
  }

  async updateGeofiles(): Promise<void> {
    const res = await this.http.post("/panel/api/server/updateGeofile", {}, {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to update geofiles");
  }

  async getLogs(count: number, level?: string): Promise<string> {
    const res = await this.http.post(
      `/panel/api/server/logs/${count}`,
      { level: level || "info" },
      { headers: this.getHeaders() }
    );
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to get logs");
    return res.data.obj || "";
  }

  async getXrayLogs(count: number): Promise<string> {
    const res = await this.http.post(
      `/panel/api/server/xraylogs/${count}`,
      {},
      { headers: this.getHeaders() }
    );
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to get Xray logs");
    return res.data.obj || "";
  }

  async generateUUID(): Promise<string> {
    const res = await this.http.get("/panel/api/server/getNewUUID", {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to generate UUID");
    return res.data.obj;
  }

  async backupToTelegram(): Promise<void> {
    const res = await this.http.get("/panel/api/backuptotgbot", {
      headers: this.getHeaders(),
    });
    if (!res.data?.success) throw new Error(res.data?.msg || "Failed to send backup");
  }
}

// Factory: creates a fresh client and logs in
export async function createApiClient(creds: PanelCredentials): Promise<XuiApiClient> {
  const client = new XuiApiClient(creds);
  await client.login();
  return client;
}
