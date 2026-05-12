import { Scenes, Markup } from "telegraf";
import { createApiClient } from "../api/xui";
import { chunkText } from "../utils/format";
import { BotContext } from "../bot";
import { showMainMenu } from "./setup.scene";

export const SERVER_SCENE_ID = "server";

type ServerStep =
  | "menu"
  | "install_xray_version"
  | "confirm_stop_xray"
  | "confirm_restart_xray"
  | "logs_count"
  | "logs_level"
  | "xray_logs_count";

interface ServerState {
  step: ServerStep;
  tempVersion?: string;
  tempCount?: number;
}

export const serverScene = new Scenes.BaseScene<BotContext>(SERVER_SCENE_ID);

serverScene.enter(async (ctx) => {
  (ctx.scene.state as ServerState).step = "menu";
  await showServerMenu(ctx);
});

serverScene.command("cancel", exitScene);
serverScene.hears("🔙 بازگشت", exitScene);

async function exitScene(ctx: BotContext) {
  await ctx.scene.leave();
  await showMainMenu(ctx);
}

async function showServerMenu(ctx: BotContext) {
  await ctx.reply("🔧 *مدیریت Xray و سرور*\nیک عملیات انتخاب کنید:", {
    ...Markup.keyboard([
      ["🔄 ری‌استارت Xray", "⏹ توقف Xray"],
      ["📦 نصب نسخه Xray", "📋 نسخه‌های موجود"],
      ["🗺 آپدیت Geofiles", "🔑 تولید UUID"],
      ["📝 لاگ‌های سیستم", "📝 لاگ‌های Xray"],
      ["🔙 بازگشت"],
    ]).resize(),
  });
}

serverScene.hears("🔄 ری‌استارت Xray", async (ctx) => {
  (ctx.scene.state as ServerState).step = "confirm_restart_xray";
  await ctx.reply(
    "⚠️ آیا می‌خواهید سرویس Xray ری‌استارت شود؟",
    Markup.keyboard([["✅ بله، ری‌استارت کن", "❌ خیر"]]).resize(),
  );
});

serverScene.hears("⏹ توقف Xray", async (ctx) => {
  (ctx.scene.state as ServerState).step = "confirm_stop_xray";
  await ctx.reply(
    "⚠️ آیا مطمئن هستید؟ توقف Xray اتصال همه کاربران قطع می‌شود!",
    Markup.keyboard([["✅ بله، متوقف کن", "❌ خیر"]]).resize(),
  );
});

serverScene.hears("📦 نصب نسخه Xray", async (ctx) => {
  // First show available versions
  await withApi(ctx, async (api) => {
    const versions = await api.getXrayVersion();
    const list = versions
      .slice(0, 10)
      .map((v, i) => `${i + 1}. ${v}`)
      .join("\n");
    await ctx.reply(`📦 *نسخه‌های موجود:*\n\n${list}`);
  });
  (ctx.scene.state as ServerState).step = "install_xray_version";
  await ctx.reply(
    "نسخه مورد نظر را وارد کنید (مثلاً v1.8.4):",
    Markup.removeKeyboard(),
  );
});

serverScene.hears("📋 نسخه‌های موجود", async (ctx) => {
  await withApi(ctx, async (api) => {
    const versions = await api.getXrayVersion();
    const list = versions.map((v, i) => `${i + 1}. ${v}`).join("\n");
    await ctx.reply(`📋 *نسخه‌های Xray موجود:*\n\n${list}`);
  });
  await showServerMenu(ctx);
});

serverScene.hears("🗺 آپدیت Geofiles", async (ctx) => {
  await ctx.reply("🔄 در حال آپدیت Geofiles...");
  await withApi(ctx, async (api) => {
    await api.updateGeofiles();
    await ctx.reply("✅ Geofiles با موفقیت آپدیت شد.");
  });
  await showServerMenu(ctx);
});

serverScene.hears("🔑 تولید UUID", async (ctx) => {
  await withApi(ctx, async (api) => {
    const uuid = await api.generateUUID();
    await ctx.reply(`🔑 UUID جدید:\n\`${uuid}\``);
  });
  await showServerMenu(ctx);
});

serverScene.hears("📝 لاگ‌های سیستم", async (ctx) => {
  (ctx.scene.state as ServerState).step = "logs_count";
  await ctx.reply(
    "🔢 چند خط لاگ می‌خواهید؟ (عدد وارد کنید، مثلاً 50):",
    Markup.removeKeyboard(),
  );
});

serverScene.hears("📝 لاگ‌های Xray", async (ctx) => {
  (ctx.scene.state as ServerState).step = "xray_logs_count";
  await ctx.reply(
    "🔢 چند خط لاگ Xray می‌خواهید؟ (مثلاً 50):",
    Markup.removeKeyboard(),
  );
});

serverScene.on("text", async (ctx) => {
  const state = ctx.scene.state as ServerState;
  const text = ctx.message.text.trim();
  if (text.startsWith("/")) return;

  switch (state.step) {
    case "confirm_restart_xray": {
      if (text === "✅ بله، ری‌استارت کن") {
        await ctx.reply("🔄 در حال ری‌استارت Xray...");
        await withApi(ctx, async (api) => {
          await api.restartXrayService();
          await ctx.reply("✅ سرویس Xray ری‌استارت شد.");
        });
      } else {
        await ctx.reply("❌ عملیات لغو شد.");
      }
      state.step = "menu";
      await showServerMenu(ctx);
      break;
    }

    case "confirm_stop_xray": {
      if (text === "✅ بله، متوقف کن") {
        await withApi(ctx, async (api) => {
          await api.stopXrayService();
          await ctx.reply("⏹ سرویس Xray متوقف شد.");
        });
      } else {
        await ctx.reply("❌ عملیات لغو شد.");
      }
      state.step = "menu";
      await showServerMenu(ctx);
      break;
    }

    case "install_xray_version": {
      const version = text.startsWith("v") ? text : `v${text}`;
      await ctx.reply(`📦 در حال نصب Xray ${version}...`);
      await withApi(ctx, async (api) => {
        await api.installXray(version);
        await ctx.reply(`✅ Xray ${version} با موفقیت نصب شد.`);
      });
      state.step = "menu";
      await showServerMenu(ctx);
      break;
    }

    case "logs_count": {
      const count = parseInt(text);
      if (isNaN(count) || count <= 0) {
        await ctx.reply("❌ عدد نامعتبر.");
        return;
      }
      state.tempCount = count;
      state.step = "logs_level";
      await ctx.reply(
        "سطح لاگ را انتخاب کنید:",
        Markup.keyboard([["info", "warn", "error", "debug"]]).resize(),
      );
      break;
    }

    case "logs_level": {
      const level = ["info", "warn", "error", "debug"].includes(text)
        ? text
        : "info";
      await withApi(ctx, async (api) => {
        const logs = await api.getLogs(state.tempCount!, level);
        const chunks = chunkText(logs || "لاگی یافت نشد.");
        for (const chunk of chunks) {
          await ctx.reply(`\`\`\`\n${chunk}\n\`\`\``);
        }
      });
      state.step = "menu";
      await showServerMenu(ctx);
      break;
    }

    case "xray_logs_count": {
      const count = parseInt(text);
      if (isNaN(count) || count <= 0) {
        await ctx.reply("❌ عدد نامعتبر.");
        return;
      }
      await withApi(ctx, async (api) => {
        const logs = await api.getXrayLogs(count);
        const chunks = chunkText(logs || "لاگی یافت نشد.");
        for (const chunk of chunks) {
          await ctx.reply(`\`\`\`\n${chunk}\n\`\`\``);
        }
      });
      state.step = "menu";
      await showServerMenu(ctx);
      break;
    }
  }
});

async function withApi(
  ctx: BotContext,
  fn: (api: Awaited<ReturnType<typeof createApiClient>>) => Promise<void>,
) {
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
