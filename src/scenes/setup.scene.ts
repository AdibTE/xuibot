import { Scenes, Markup } from "telegraf";
import { createApiClient, PanelCredentials } from "../api/xui";
import { BotContext } from "../bot";

export const SETUP_SCENE_ID = "setup";

type SetupStep = "url" | "username" | "password";

interface SetupState {
  step: SetupStep;
  url?: string;
  username?: string;
}

export const setupScene = new Scenes.BaseScene<BotContext>(SETUP_SCENE_ID);

setupScene.enter(async (ctx) => {
  (ctx.scene.state as SetupState).step = "url";
  await ctx.reply(
    "⚙️ *تنظیم اتصال به پنل 3x\\-ui*\n\n" +
      "🔗 لطفاً آدرس پنل خود را وارد کنید\\.\n" +
      "مثال: `https://yourserver.com:2053`\n\n" +
      "برای انصراف /cancel را بزنید\\.",
    {
      ...Markup.removeKeyboard(),
    },
  );
});

setupScene.command("cancel", async (ctx) => {
  await ctx.reply("❌ عملیات لغو شد.", Markup.removeKeyboard());
  await ctx.scene.leave();
});

setupScene.on("text", async (ctx) => {
  const state = ctx.scene.state as SetupState;
  const text = ctx.message.text.trim();

  if (text.startsWith("/")) return;

  if (state.step === "url") {
    // Basic URL validation
    if (!text.startsWith("http://") && !text.startsWith("https://")) {
      await ctx.reply(
        "❌ آدرس نامعتبر است. باید با http:// یا https:// شروع شود.\nدوباره وارد کنید:",
        { parse_mode: undefined },
      );
      return;
    }
    state.url = text.replace(/\/$/, ""); // remove trailing slash
    state.step = "username";
    await ctx.reply("👤 نام کاربری پنل را وارد کنید:");
  } else if (state.step === "username") {
    state.username = text;
    state.step = "password";
    await ctx.reply("🔑 رمز عبور پنل را وارد کنید:");
  } else if (state.step === "password") {
    const password = text;

    await ctx.reply("🔄 در حال اتصال به پنل...");

    const creds: PanelCredentials = {
      baseUrl: state.url!,
      username: state.username!,
      password,
    };

    try {
      const client = await createApiClient(creds);
      // Store credentials in session
      ctx.session.panel = creds;
      ctx.session.isConnected = true;

      // Quick test - get server status
      const status = await client.getServerStatus();
      const xrayState = status.xray?.state === "running" ? "✅" : "❌";

      await ctx.reply(
        `✅ *اتصال برقرار شد\\!*\n\n` +
          `🖥 Xray: ${xrayState} ${status.xray?.state || "unknown"}\n` +
          `⚙️ CPU: ${status.cpu?.toFixed(1) || 0}%\n\n` +
          `حالا می‌توانید از منوی اصلی استفاده کنید\\.`,
        { ...Markup.removeKeyboard() },
      );

      await ctx.scene.leave();
      // Show main menu after setup
      await showMainMenu(ctx);
    } catch (err: unknown) {
      console.log(err);
      const message = err instanceof Error ? err.message : "خطای ناشناخته";
      await ctx.reply(
        `❌ اتصال ناموفق:\n${message}\n\nدوباره تلاش کنید. آدرس پنل را مجدداً وارد کنید:`,
        { parse_mode: undefined },
      );
      // Reset to beginning
      state.step = "url";
      state.url = undefined;
      state.username = undefined;
    }
  }
});

async function showMainMenu(ctx: BotContext) {
  await ctx.reply("🏠 *منوی اصلی*\nیک گزینه انتخاب کنید:", {
    ...Markup.keyboard([
      ["📋 لیست Inbound‌ها", "📊 وضعیت سرور"],
      ["👥 مدیریت کلاینت‌ها", "🔧 مدیریت Xray"],
      ["📝 لاگ‌ها", "💾 بکاپ"],
      ["⚙️ تنظیم مجدد پنل", "🚪 خروج"],
    ]).resize(),
  });
}

export { showMainMenu };
