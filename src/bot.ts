import { Telegraf, session, Scenes, Markup, Context } from "telegraf";
import { config } from "./config";
import { authMiddleware } from "./middlewares/auth";
import { setupScene, SETUP_SCENE_ID, showMainMenu } from "./scenes/setup.scene";
import { inboundsScene, INBOUNDS_SCENE_ID } from "./scenes/inbounds.scene";
import { clientsScene, CLIENTS_SCENE_ID } from "./scenes/clients.scene";
import { serverScene, SERVER_SCENE_ID } from "./scenes/server.scene";
import { createApiClient, PanelCredentials } from "./api/xui";
import { formatServerStatus } from "./utils/format";
import { SocksProxyAgent } from "socks-proxy-agent";

// ─── Session & Context ───────────────────────────────────────────────────────

export interface SessionData extends Scenes.SceneSession {
  panel?: PanelCredentials;
  isConnected?: boolean;
}

export interface BotContext extends Context {
  session: SessionData;
  scene: Scenes.SceneContextScene<BotContext, Scenes.SceneSessionData>;
}

// ─── Bot Setup ───────────────────────────────────────────────────────────────

const agent = new SocksProxyAgent("socks5://127.0.0.1:10808");

const bot = new Telegraf<BotContext>(config.telegram.token, {
  telegram: { agent },
});

const stage = new Scenes.Stage<BotContext>([
  setupScene,
  inboundsScene,
  clientsScene,
  serverScene,
]);

bot.use(session());
bot.use(authMiddleware);
bot.use(stage.middleware());

// ─── /start Command ──────────────────────────────────────────────────────────

const HELP_TEXT = `
🤖 *ربات مدیریت 3x\\-ui*

به ربات مدیریت پنل 3x\\-ui خوش آمدید\\. با این ربات می‌توانید کلیه عملیات پنل خود را از طریق تلگرام مدیریت کنید\\.

━━━━━━━━━━━━━━━━━━━━━
📋 *مدیریت Inbound‌ها*
• مشاهده لیست و جزئیات Inbound‌ها
• حذف Inbound
• ریست ترافیک یک Inbound یا همه
• حذف کلاینت‌های خالی \\(depleted\\)
• ریست ترافیک همه کلاینت‌های یک Inbound

━━━━━━━━━━━━━━━━━━━━━
👥 *مدیریت کلاینت‌ها*
• جستجو بر اساس ایمیل و مشاهده ترافیک
• اضافه کردن کلاینت جدید به Inbound
• حذف کلاینت با ایمیل
• ریست ترافیک کلاینت
• مشاهده IP های فعال کلاینت
• پاک کردن IP های ثبت‌شده
• مشاهده کلاینت‌های آنلاین

━━━━━━━━━━━━━━━━━━━━━
🔧 *مدیریت Xray و سرور*
• ری‌استارت سرویس Xray
• توقف سرویس Xray
• نصب / آپدیت نسخه Xray
• مشاهده نسخه‌های موجود
• آپدیت Geofiles
• تولید UUID جدید
• مشاهده لاگ‌های سیستم
• مشاهده لاگ‌های Xray

━━━━━━━━━━━━━━━━━━━━━
📊 *وضعیت سرور*
• CPU، RAM، Disk، Swap
• وضعیت و نسخه Xray
• Uptime، ترافیک شبکه
• IP عمومی سرور

━━━━━━━━━━━━━━━━━━━━━
💾 *بکاپ*
• ارسال بکاپ دیتابیس به تلگرام بات پنل

━━━━━━━━━━━━━━━━━━━━━
*دستورات کلیدی:*
/start \\- شروع و منوی اصلی
/cancel \\- لغو عملیات جاری و بازگشت

━━━━━━━━━━━━━━━━━━━━━
⚙️ برای شروع، ابتدا اتصال به پنل را تنظیم کنید\\.
`;

bot.start(async (ctx) => {
  await ctx.reply(HELP_TEXT, {
    ...Markup.removeKeyboard(),
  });

  if (!ctx.session.isConnected || !ctx.session.panel) {
    await ctx.reply(
      "⚙️ پنلی تنظیم نشده\\. برای شروع، اتصال به پنل را تنظیم کنید:",
      {
        ...Markup.keyboard([["⚙️ تنظیم پنل"]]).resize(),
      },
    );
  } else {
    await showMainMenu(ctx);
  }
});

bot.command("cancel", async (ctx) => {
  if (ctx.scene.current) {
    await ctx.scene.leave();
  }
  await showMainMenu(ctx);
});

// ─── Main Menu Handlers ──────────────────────────────────────────────────────

bot.hears("⚙️ تنظیم پنل", async (ctx) => {
  await ctx.scene.enter(SETUP_SCENE_ID);
});

bot.hears("⚙️ تنظیم مجدد پنل", async (ctx) => {
  ctx.session.isConnected = false;
  ctx.session.panel = undefined;
  await ctx.scene.enter(SETUP_SCENE_ID);
});

bot.hears("📋 لیست Inbound‌ها", async (ctx) => {
  if (!ensureConnected(ctx)) return;
  await ctx.scene.enter(INBOUNDS_SCENE_ID);
});

bot.hears("👥 مدیریت کلاینت‌ها", async (ctx) => {
  if (!ensureConnected(ctx)) return;
  await ctx.scene.enter(CLIENTS_SCENE_ID);
});

bot.hears("🔧 مدیریت Xray", async (ctx) => {
  if (!ensureConnected(ctx)) return;
  await ctx.scene.enter(SERVER_SCENE_ID);
});

bot.hears("📊 وضعیت سرور", async (ctx) => {
  if (!ensureConnected(ctx)) return;
  await ctx.reply("🔄 در حال دریافت وضعیت سرور...");
  try {
    const api = await createApiClient(ctx.session.panel!);
    const status = await api.getServerStatus();
    await ctx.reply(formatServerStatus(status));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    await ctx.reply(`❌ خطا: ${message}`);
  }
});

bot.hears("📝 لاگ‌ها", async (ctx) => {
  if (!ensureConnected(ctx)) return;
  await ctx.scene.enter(SERVER_SCENE_ID);
});

bot.hears("💾 بکاپ", async (ctx) => {
  if (!ensureConnected(ctx)) return;
  await ctx.reply("📤 در حال ارسال بکاپ...");
  try {
    const api = await createApiClient(ctx.session.panel!);
    await api.backupToTelegram();
    await ctx.reply("✅ بکاپ به تلگرام بات پنل ارسال شد.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته";
    await ctx.reply(`❌ خطا: ${message}`);
  }
});

bot.hears("🚪 خروج", async (ctx) => {
  ctx.session.isConnected = false;
  ctx.session.panel = undefined;
  await ctx.reply(
    "👋 از پنل خارج شدید.",
    Markup.keyboard([["⚙️ تنظیم پنل"]]).resize(),
  );
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureConnected(ctx: BotContext): boolean {
  if (!ctx.session.isConnected || !ctx.session.panel) {
    ctx.reply(
      "❌ ابتدا باید به پنل متصل شوید.",
      Markup.keyboard([["⚙️ تنظیم پنل"]]).resize(),
    );
    return false;
  }
  return true;
}

// ─── Launch ──────────────────────────────────────────────────────────────────

bot.launch(() => {
  console.log("🤖 3x-ui Telegram Bot started successfully!");
  console.log(`✅ Allowed users: ${config.telegram.allowedUserIds.join(", ")}`);
});

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
