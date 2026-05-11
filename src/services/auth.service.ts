import { api } from "../config/api";
import { ENV } from "../config/env";

export async function loginPanel() {
  return api.post("/login", {
    username: ENV.PANEL_USERNAME,
    password: ENV.PANEL_PASSWORD,
  });
}