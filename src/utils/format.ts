import { Inbound, ClientStat, ServerStatus } from "../api/xui";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

export function formatExpiry(expiryTime: number): string {
  if (!expiryTime || expiryTime === 0) return "♾️ نامحدود";
  const date = new Date(expiryTime);
  const now = new Date();
  if (date < now) return `⛔ منقضی شده (${date.toLocaleDateString("fa-IR")})`;
  const daysLeft = Math.ceil((date.getTime() - now.getTime()) / 86400000);
  return `📅 ${date.toLocaleDateString("fa-IR")} (${daysLeft} روز مانده)`;
}

export function formatInboundList(inbounds: Inbound[]): string {
  if (!inbounds.length) return "هیچ inbound‌ای یافت نشد.";
  return inbounds
    .map((ib, i) => {
      const status = ib.enable ? "✅" : "❌";
      const traffic = `⬆️ ${formatBytes(ib.up)} / ⬇️ ${formatBytes(ib.down)}`;
      return `${i + 1}. ${status} *${escapeMarkdown(ib.remark)}*\n   🔌 پورت: ${ib.port} | 📡 ${ib.protocol}\n   ${traffic}`;
    })
    .join("\n\n");
}

export function formatInboundDetail(ib: Inbound): string {
  const lines = [
    `📦 *${escapeMarkdown(ib.remark)}*`,
    `🆔 ID: ${ib.id}`,
    `📡 پروتکل: ${ib.protocol}`,
    `🔌 پورت: ${ib.port}`,
    `🔘 وضعیت: ${ib.enable ? "✅ فعال" : "❌ غیرفعال"}`,
    `⬆️ آپلود: ${formatBytes(ib.up)}`,
    `⬇️ دانلود: ${formatBytes(ib.down)}`,
    `📊 کل: ${ib.total > 0 ? formatBytes(ib.total) : "نامحدود"}`,
    `⏰ انقضاء: ${formatExpiry(ib.expiryTime)}`,
  ];
  return lines.join("\n");
}

export function formatClientStat(stat: ClientStat): string {
  const lines = [
    `👤 *${escapeMarkdown(stat.email)}*`,
    `🔘 وضعیت: ${stat.enable ? "✅ فعال" : "❌ غیرفعال"}`,
    `⬆️ آپلود: ${formatBytes(stat.up)}`,
    `⬇️ دانلود: ${formatBytes(stat.down)}`,
    `📊 کل مصرف: ${formatBytes(stat.up + stat.down)}`,
    `💾 حجم مجاز: ${stat.total > 0 ? formatBytes(stat.total) : "نامحدود"}`,
    `⏰ انقضاء: ${formatExpiry(stat.expiryTime)}`,
  ];
  return lines.join("\n");
}

export function formatServerStatus(status: ServerStatus): string {
  const xrayState = status.xray?.state === "running" ? "✅ در حال اجرا" : "❌ متوقف";
  const lines = [
    `🖥 *وضعیت سرور*`,
    ``,
    `🔷 Xray: ${xrayState} (${escapeMarkdown(status.xray?.version || "N/A")})`,
    ``,
    `⚙️ CPU: ${status.cpu?.toFixed(1) || 0}%`,
    `🧠 RAM: ${formatBytes(status.mem?.current || 0)} / ${formatBytes(status.mem?.total || 0)}`,
    `💾 Swap: ${formatBytes(status.swap?.current || 0)} / ${formatBytes(status.swap?.total || 0)}`,
    `💿 Disk: ${formatBytes(status.disk?.current || 0)} / ${formatBytes(status.disk?.total || 0)}`,
    ``,
    `⏱ Uptime: ${formatUptime(status.uptime || 0)}`,
    `🌐 TCP: ${status.tcpCount || 0} | UDP: ${status.udpCount || 0}`,
    ``,
    `📤 ارسال: ${formatBytes(status.netTraffic?.sent || 0)}`,
    `📥 دریافت: ${formatBytes(status.netTraffic?.recv || 0)}`,
    ``,
    `🌍 IPv4: ${status.publicIP?.ipv4 || "N/A"}`,
    `🌍 IPv6: ${status.publicIP?.ipv6 || "N/A"}`,
  ];
  return lines.join("\n");
}

export function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

export function chunkText(text: string, size = 4000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

export function escapeMarkdownV2(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}