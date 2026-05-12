import { Scenes, Markup } from "telegraf";
import { createApiClient, InboundClient } from "../api/xui";
import { formatClientStat, formatBytes } from "../utils/format";
import { BotContext } from "../bot";
import { showMainMenu } from "./setup.scene";

export const CLIENTS_SCENE_ID = "clients";

type ClientStep =
  | "menu"
  | "search_email"
  | "add_inbound_id"
  | "add_email"
  | "add_total_gb"
  | "add_expiry_days"
  | "add_limit_ip"
  | "delete_email_inbound"
  | "delete_email"
  | "reset_traffic_email"
  | "reset_traffic_inbound"
  | "client_ips_email"
  | "clear_ips_email"
  | "online_clients"
  | "confirm_clear_ips";

interface ClientState {
  step: ClientStep;
  addData?: Partial<InboundClient> & { inboundId?: number };
  tempInboundId?: number;
  tempEmail?: string;
}

export const clientsScene = new Scenes.BaseScene<BotContext>(CLIENTS_SCENE_ID);

clientsScene.enter(async (ctx) => {
  (ctx.scene.state as ClientState).step = "menu";
  await showClientMenu(ctx);
});

clientsScene.command("cancel", exitScene);
clientsScene.hears("🔙 بازگشت", exitScene);

async function exitScene(ctx: BotContext) {
  await ctx.scene.leave();
  await showMainMenu(ctx);
}

async function showClientMenu(ctx: BotContext) {
  await ctx.reply(
    "👥 *مدیریت کلاینت‌ها*\nیک عملیات انتخاب کنید:",
    {
      ...Markup.keyboard([
        ["🔍 جستجو با ایمیل", "➕ اضافه کردن کلاینت"],
        ["🗑 حذف کلاینت", "🔄 ریست ترافیک کلاینت"],
        ["🌐 IP های کلاینت", "🧹 پاک کردن IP ها"],
        ["📡 کلاینت‌های آنلاین", "🔙 بازگشت"],
      ]).resize(),
    }
  );
}

clientsScene.hears("🔍 جستجو با ایمیل", async (ctx) => {
  (ctx.scene.state as ClientState).step = "search_email";
  await ctx.reply("📧 ایمیل کلاینت را وارد کنید:", Markup.removeKeyboard());
});

clientsScene.hears("➕ اضافه کردن کلاینت", async (ctx) => {
  const state = ctx.scene.state as ClientState;
  state.step = "add_inbound_id";
  state.addData = {};
  await ctx.reply("🆔 شناسه Inbound را وارد کنید:", Markup.removeKeyboard());
});

clientsScene.hears("🗑 حذف کلاینت", async (ctx) => {
  (ctx.scene.state as ClientState).step = "delete_email_inbound";
  await ctx.reply("🆔 شناسه Inbound را وارد کنید:", Markup.removeKeyboard());
});

clientsScene.hears("🔄 ریست ترافیک کلاینت", async (ctx) => {
  (ctx.scene.state as ClientState).step = "reset_traffic_inbound";
  await ctx.reply("🆔 شناسه Inbound کلاینت را وارد کنید:", Markup.removeKeyboard());
});

clientsScene.hears("🌐 IP های کلاینت", async (ctx) => {
  (ctx.scene.state as ClientState).step = "client_ips_email";
  await ctx.reply("📧 ایمیل کلاینت را وارد کنید:", Markup.removeKeyboard());
});

clientsScene.hears("🧹 پاک کردن IP ها", async (ctx) => {
  (ctx.scene.state as ClientState).step = "clear_ips_email";
  await ctx.reply("📧 ایمیل کلاینت را وارد کنید:", Markup.removeKeyboard());
});

clientsScene.hears("📡 کلاینت‌های آنلاین", async (ctx) => {
  await withApi(ctx, async (api) => {
    const clients = await api.getOnlineClients();
    if (!clients.length) {
      await ctx.reply("هیچ کلاینت آنلاینی وجود ندارد.");
    } else {
      const list = clients.map((c, i) => `${i + 1}. ${c}`).join("\n");
      await ctx.reply(`📡 *کلاینت‌های آنلاین (${clients.length}):*\n\n${list}`, {
      
      });
    }
  });
  await showClientMenu(ctx);
});

clientsScene.on("text", async (ctx) => {
  const state = ctx.scene.state as ClientState;
  const text = ctx.message.text.trim();
  if (text.startsWith("/")) return;

  switch (state.step) {
    case "search_email": {
      await withApi(ctx, async (api) => {
        const stat = await api.getClientTrafficsByEmail(text);
        await ctx.reply(formatClientStat(stat));
      });
      state.step = "menu";
      await showClientMenu(ctx);
      break;
    }

    case "add_inbound_id": {
      const id = parseInt(text);
      if (isNaN(id)) { await ctx.reply("❌ شناسه نامعتبر."); return; }
      state.addData!.inboundId = id;
      state.step = "add_email";
      await ctx.reply("📧 ایمیل کلاینت را وارد کنید:");
      break;
    }

    case "add_email": {
      state.addData!.email = text;
      state.step = "add_total_gb";
      await ctx.reply("💾 حجم مجاز به گیگابایت وارد کنید (0 = نامحدود):");
      break;
    }

    case "add_total_gb": {
      const gb = parseFloat(text);
      if (isNaN(gb) || gb < 0) { await ctx.reply("❌ مقدار نامعتبر."); return; }
      state.addData!.totalGB = gb * 1024 * 1024 * 1024;
      state.step = "add_expiry_days";
      await ctx.reply("📅 تعداد روز تا انقضاء وارد کنید (0 = نامحدود):");
      break;
    }

    case "add_expiry_days": {
      const days = parseInt(text);
      if (isNaN(days) || days < 0) { await ctx.reply("❌ مقدار نامعتبر."); return; }
      state.addData!.expiryTime = days === 0 ? 0 : Date.now() + days * 86400000;
      state.step = "add_limit_ip";
      await ctx.reply("🔢 حداکثر تعداد IP مجاز (0 = نامحدود):");
      break;
    }

    case "add_limit_ip": {
      const limit = parseInt(text);
      if (isNaN(limit) || limit < 0) { await ctx.reply("❌ مقدار نامعتبر."); return; }
      state.addData!.limitIp = limit;

      await withApi(ctx, async (api) => {
        const client: InboundClient = {
          email: state.addData!.email!,
          totalGB: state.addData!.totalGB || 0,
          expiryTime: state.addData!.expiryTime || 0,
          limitIp: state.addData!.limitIp || 0,
          enable: true,
          id: crypto.randomUUID(),
        };
        await api.addClient(state.addData!.inboundId!, client);
        await ctx.reply(
          `✅ *کلاینت اضافه شد!*\n\n` +
          `📧 ایمیل: ${client.email}\n` +
          `💾 حجم: ${client.totalGB > 0 ? formatBytes(client.totalGB) : "نامحدود"}\n` +
          `🔢 حد IP: ${client.limitIp || "نامحدود"}`,
          
        );
      });

      state.step = "menu";
      state.addData = {};
      await showClientMenu(ctx);
      break;
    }

    case "delete_email_inbound": {
      const id = parseInt(text);
      if (isNaN(id)) { await ctx.reply("❌ شناسه نامعتبر."); return; }
      state.tempInboundId = id;
      state.step = "delete_email";
      await ctx.reply("📧 ایمیل کلاینت را وارد کنید:");
      break;
    }

    case "delete_email": {
      await withApi(ctx, async (api) => {
        await api.deleteClientByEmail(state.tempInboundId!, text);
        await ctx.reply(`✅ کلاینت ${text} حذف شد.`);
      });
      state.step = "menu";
      await showClientMenu(ctx);
      break;
    }

    case "reset_traffic_inbound": {
      const id = parseInt(text);
      if (isNaN(id)) { await ctx.reply("❌ شناسه نامعتبر."); return; }
      state.tempInboundId = id;
      state.step = "reset_traffic_email";
      await ctx.reply("📧 ایمیل کلاینت را وارد کنید:");
      break;
    }

    case "reset_traffic_email": {
      await withApi(ctx, async (api) => {
        await api.resetClientTraffic(state.tempInboundId!, text);
        await ctx.reply(`✅ ترافیک کلاینت ${text} ریست شد.`);
      });
      state.step = "menu";
      await showClientMenu(ctx);
      break;
    }

    case "client_ips_email": {
      await withApi(ctx, async (api) => {
        const ips = await api.getClientIps(text);
        if (!ips.length) {
          await ctx.reply(`هیچ IP‌ای برای ${text} ثبت نشده.`);
        } else {
          await ctx.reply(`🌐 *IP های ${text}:*\n\n${ips.join("\n")}`, {
          });
        }
      });
      state.step = "menu";
      await showClientMenu(ctx);
      break;
    }

    case "clear_ips_email": {
      state.tempEmail = text;
      state.step = "confirm_clear_ips";
      await ctx.reply(
        `⚠️ IP های کلاینت *${text}* پاک شود؟`,
        { ...Markup.keyboard([["✅ بله", "❌ خیر"]]).resize() }
      );
      break;
    }

    case "confirm_clear_ips": {
      if (text === "✅ بله") {
        await withApi(ctx, async (api) => {
          await api.clearClientIps(state.tempEmail!);
          await ctx.reply(`✅ IP های ${state.tempEmail} پاک شد.`);
        });
      } else {
        await ctx.reply("❌ عملیات لغو شد.");
      }
      state.step = "menu";
      await showClientMenu(ctx);
      break;
    }
  }
});

async function withApi(ctx: BotContext, fn: (api: Awaited<ReturnType<typeof createApiClient>>) => Promise<void>) {
  if (!ctx.session?.panel) {
    await ctx.reply("❌ ابتدا باید پنل را تنظیم کنید.");
    return;
  }
  try {
    const api = await createApiClient(ctx.session.panel);
    await fn(api);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    await ctx.reply(`❌ خطا: ${message}`);
  }
}
