import { Scenes, Markup } from "telegraf";
import { createApiClient } from "../api/xui";
import { formatInboundList, formatInboundDetail, escapeMarkdown } from "../utils/format";
import { BotContext } from "../bot";
import { showMainMenu } from "./setup.scene";

export const INBOUNDS_SCENE_ID = "inbounds";

type InboundStep =
  | "menu"
  | "list"
  | "get_id"
  | "delete_id"
  | "reset_traffic_id"
  | "reset_all_clients_id"
  | "delete_depleted_id"
  | "confirm_delete"
  | "confirm_reset_all"
  | "confirm_reset_all_clients";

interface InboundState {
  step: InboundStep;
  selectedId?: number;
}

export const inboundsScene = new Scenes.BaseScene<BotContext>(INBOUNDS_SCENE_ID);

inboundsScene.enter(async (ctx) => {
  (ctx.scene.state as InboundState).step = "menu";
  await ctx.reply(
    "📋 *مدیریت Inbound‌ها*\nیک عملیات انتخاب کنید:",
    {
      ...Markup.keyboard([
        ["📋 لیست همه Inbound‌ها", "🔍 مشاهده جزئیات"],
        ["🗑 حذف Inbound", "🔄 ریست ترافیک Inbound"],
        ["♻️ ریست همه ترافیک‌ها", "🗑 حذف Inbound‌های خالی"],
        ["🔄 ریست کلاینت‌های Inbound", "🔙 بازگشت"],
      ]).resize(),
    }
  );
});

inboundsScene.command("cancel", exitScene);
inboundsScene.hears("🔙 بازگشت", exitScene);

async function exitScene(ctx: BotContext) {
  await ctx.scene.leave();
  await showMainMenu(ctx);
}

inboundsScene.hears("📋 لیست همه Inbound‌ها", async (ctx) => {
  await withApi(ctx, async (api) => {
    const inbounds = await api.getInbounds();
    const text = formatInboundList(inbounds);
    await ctx.reply(`📋 *Inbound‌های موجود:*\n\n${escapeMarkdown(text)}`, {
    });
  });
});

inboundsScene.hears("🔍 مشاهده جزئیات", async (ctx) => {
  (ctx.scene.state as InboundState).step = "get_id";
  await ctx.reply("🆔 شناسه Inbound را وارد کنید:", Markup.removeKeyboard());
});

inboundsScene.hears("🗑 حذف Inbound", async (ctx) => {
  (ctx.scene.state as InboundState).step = "delete_id";
  await ctx.reply("🆔 شناسه Inbound برای حذف را وارد کنید:", Markup.removeKeyboard());
});

inboundsScene.hears("🔄 ریست ترافیک Inbound", async (ctx) => {
  (ctx.scene.state as InboundState).step = "reset_traffic_id";
  await ctx.reply("🆔 شناسه Inbound برای ریست ترافیک را وارد کنید:", Markup.removeKeyboard());
});

inboundsScene.hears("♻️ ریست همه ترافیک‌ها", async (ctx) => {
  (ctx.scene.state as InboundState).step = "confirm_reset_all";
  await ctx.reply(
    "⚠️ آیا مطمئن هستید؟ ترافیک همه Inbound‌ها ریست می‌شود!",
    Markup.keyboard([["✅ بله، ریست کن", "❌ خیر"]]).resize()
  );
});

inboundsScene.hears("🗑 حذف Inbound‌های خالی", async (ctx) => {
  (ctx.scene.state as InboundState).step = "delete_depleted_id";
  await ctx.reply(
    "🆔 شناسه Inbound را وارد کنید \\(-1 برای همه\\):",
    {  ...Markup.removeKeyboard() }
  );
});

inboundsScene.hears("🔄 ریست کلاینت‌های Inbound", async (ctx) => {
  (ctx.scene.state as InboundState).step = "reset_all_clients_id";
  await ctx.reply("🆔 شناسه Inbound را وارد کنید:", Markup.removeKeyboard());
});

inboundsScene.on("text", async (ctx) => {
  const state = ctx.scene.state as InboundState;
  const text = ctx.message.text.trim();

  if (text.startsWith("/")) return;

  switch (state.step) {
    case "get_id": {
      const id = parseInt(text);
      if (isNaN(id)) { await ctx.reply("❌ شناسه نامعتبر."); return; }
      await withApi(ctx, async (api) => {
        const ib = await api.getInbound(id);
        await ctx.reply(formatInboundDetail(ib));
      });
      await returnToMenu(ctx);
      break;
    }

    case "delete_id": {
      const id = parseInt(text);
      if (isNaN(id)) { await ctx.reply("❌ شناسه نامعتبر."); return; }
      state.selectedId = id;
      state.step = "confirm_delete";
      await ctx.reply(
        `⚠️ آیا مطمئن هستید که Inbound شماره *${id}* حذف شود؟`,
        {  ...Markup.keyboard([["✅ بله، حذف کن", "❌ خیر"]]).resize() }
      );
      break;
    }

    case "confirm_delete": {
      if (text === "✅ بله، حذف کن") {
        await withApi(ctx, async (api) => {
          await api.deleteInbound(state.selectedId!);
          await ctx.reply(`✅ Inbound شماره ${state.selectedId} حذف شد.`);
        });
      } else {
        await ctx.reply("❌ عملیات لغو شد.");
      }
      await returnToMenu(ctx);
      break;
    }

    case "reset_traffic_id": {
      const id = parseInt(text);
      if (isNaN(id)) { await ctx.reply("❌ شناسه نامعتبر."); return; }
      await withApi(ctx, async (api) => {
        await api.resetAllClientTraffics(id);
        await ctx.reply(`✅ ترافیک همه کلاینت‌های Inbound ${id} ریست شد.`);
      });
      await returnToMenu(ctx);
      break;
    }

    case "confirm_reset_all": {
      if (text === "✅ بله، ریست کن") {
        await withApi(ctx, async (api) => {
          await api.resetAllTraffics();
          await ctx.reply("✅ ترافیک همه Inbound‌ها ریست شد.");
        });
      } else {
        await ctx.reply("❌ عملیات لغو شد.");
      }
      await returnToMenu(ctx);
      break;
    }

    case "delete_depleted_id": {
      const id = parseInt(text);
      if (isNaN(id)) { await ctx.reply("❌ شناسه نامعتبر."); return; }
      await withApi(ctx, async (api) => {
        await api.deleteDepletedClients(id);
        await ctx.reply(`✅ کلاینت‌های خالی در Inbound ${id === -1 ? "همه" : id} حذف شدند.`);
      });
      await returnToMenu(ctx);
      break;
    }

    case "reset_all_clients_id": {
      const id = parseInt(text);
      if (isNaN(id)) { await ctx.reply("❌ شناسه نامعتبر."); return; }
      await withApi(ctx, async (api) => {
        await api.resetAllClientTraffics(id);
        await ctx.reply(`✅ ترافیک کلاینت‌های Inbound ${id} ریست شد.`);
      });
      await returnToMenu(ctx);
      break;
    }
  }
});

async function returnToMenu(ctx: BotContext) {
  (ctx.scene.state as InboundState).step = "menu";
  await ctx.reply(
    "📋 *مدیریت Inbound‌ها*\nیک عملیات انتخاب کنید:",
    {
      ...Markup.keyboard([
        ["📋 لیست همه Inbound‌ها", "🔍 مشاهده جزئیات"],
        ["🗑 حذف Inbound", "🔄 ریست ترافیک Inbound"],
        ["♻️ ریست همه ترافیک‌ها", "🗑 حذف Inbound‌های خالی"],
        ["🔄 ریست کلاینت‌های Inbound", "🔙 بازگشت"],
      ]).resize(),
    }
  );
}

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
