import Bot from "node-telegram-bot-api";
import { requireAuth } from "../auth/auth.guard";
import { getSession, setSession } from "../state/session";
import {
  getClients,
  addClient,
  deleteClient,
  resetClientTraffic,
} from "../services/client.service";

export function registerClientsScene(bot: Bot) {
  // 👤 Clients entry
  bot.onText(/👤 کاربران/, (msg) => {
    requireAuth(bot, msg, () => {
      setSession({ step: "CLIENT_MENU" });

      bot.sendMessage(
        msg.chat.id,
        `👤 مدیریت کاربران
          1️⃣ لیست کاربران
          2️⃣ افزودن کاربر
          3️⃣ ریست ترافیک کاربر
          4️⃣ حذف کاربر

          عدد گزینه را ارسال کن`,
      );
    });
  });

  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    if (!getSession("authenticated") || !getSession("step")) return;

    try {
      switch (getSession("step")) {
        // 🧭 MENU
        case "CLIENT_MENU":
          if (msg.text === "1") {
            setSession({ step: "CLIENT_LIST_INBOUND" });
            bot.sendMessage(msg.chat.id, "🆔 inbound ID را وارد کن:");
          }

          if (msg.text === "2") {
            setSession({ step: "CLIENT_ADD_INBOUND" });
            bot.sendMessage(msg.chat.id, "🆔 inbound ID را وارد کن:");
          }

          if (msg.text === "3") {
            setSession({ step: "CLIENT_RESET_INBOUND" });
            bot.sendMessage(msg.chat.id, "🆔 inbound ID را وارد کن:");
          }

          if (msg.text === "4") {
            setSession({ step: "CLIENT_DELETE_INBOUND" });
            bot.sendMessage(msg.chat.id, "🆔 inbound ID را وارد کن:");
          }
          break;

        // 📋 LIST
        case "CLIENT_LIST_INBOUND":
          setSession({ clientScene: { inboundId: Number(msg.text) } });
          const clients = await getClients(
            getSession("clientScene").inboundId!,
          );

          setSession({ step: undefined });

          if (!clients.length) {
            bot.sendMessage(msg.chat.id, "❌ کاربری وجود ندارد");
            return;
          }

          bot.sendMessage(
            msg.chat.id,
            clients
              .map((c: any) => `📧 ${c.email}\n⬆️ ${c.up} | ⬇️ ${c.down}`)
              .join("\n\n"),
          );
          break;

        // ➕ ADD
        case "CLIENT_ADD_INBOUND":
          setSession({ clientScene: { inboundId: Number(msg.text) } });
          setSession({ step: "CLIENT_ADD_EMAIL" });
          bot.sendMessage(msg.chat.id, "📧 email کاربر را وارد کن:");
          break;

        case "CLIENT_ADD_EMAIL":
          setSession({
            clientScene: { ...getSession("clientScene"), email: msg.text },
          });
          setSession({ step: "CLIENT_ADD_LIMIT" });
          bot.sendMessage(
            msg.chat.id,
            "📦 محدودیت ترافیک (GB) – عدد یا 0 برای نامحدود:",
          );
          break;

        case "CLIENT_ADD_LIMIT":
          setSession({
            clientScene: {
              ...getSession("clientScene"),
              limit: Number(msg.text),
            },
          });
          setSession({ step: "CLIENT_ADD_CONFIRM" });

          bot.sendMessage(
            msg.chat.id,
            `📌 تأیید افزودن کاربر
                Inbound: ${getSession("clientScene").inboundId}
                Email: ${getSession("clientScene").email}
                Limit: ${getSession("clientScene").limit} GB

                برای تأیید بنویس: yes`,
          );
          break;

        case "CLIENT_ADD_CONFIRM":
          if (msg.text.toLowerCase() !== "yes") {
            setSession({ step: undefined });
            bot.sendMessage(msg.chat.id, "❌ لغو شد");
            return;
          }

          await addClient(getSession("clientScene").inboundId!, {
            email: getSession("clientScene").email,
            totalGB: getSession("clientScene").limit,
          });

          setSession({ step: undefined });
          bot.sendMessage(msg.chat.id, "✅ کاربر اضافه شد");
          break;

        // 🔄 RESET
        case "CLIENT_RESET_INBOUND":
          setSession({ clientScene: { inboundId: Number(msg.text) } });
          setSession({ step: "CLIENT_RESET_EMAIL" });
          bot.sendMessage(msg.chat.id, "📧 email کاربر:");
          break;

        case "CLIENT_RESET_EMAIL":
          await resetClientTraffic(
            getSession("clientScene").inboundId!,
            msg.text,
          );
          setSession({ step: undefined });
          bot.sendMessage(msg.chat.id, "♻️ ترافیک ریست شد");
          break;

        // 🗑 DELETE
        case "CLIENT_DELETE_INBOUND":
          setSession({ clientScene: { inboundId: Number(msg.text) } });
          setSession({ step: "CLIENT_DELETE_EMAIL" });
          bot.sendMessage(msg.chat.id, "📧 email کاربر:");
          break;

        case "CLIENT_DELETE_EMAIL":
          setSession({
            clientScene: {
              ...getSession("clientScene"),
              email: msg.text,
            },
          });
          setSession({ step: "CLIENT_DELETE_CONFIRM" });

          bot.sendMessage(
            msg.chat.id,
            `⚠️ حذف کاربر ${getSession("clientScene").email}\nبرای تأیید بنویس: delete`,
          );
          break;

        case "CLIENT_DELETE_CONFIRM":
          if (msg.text.toLowerCase() !== "delete") {
            setSession({ step: undefined });
            bot.sendMessage(msg.chat.id, "❌ لغو شد");
            return;
          }

          await deleteClient(
            getSession("clientScene").inboundId!,
            getSession("clientScene").email!,
          );

          setSession({ step: undefined });
          bot.sendMessage(msg.chat.id, "🗑 کاربر حذف شد");
          break;
      }
    } catch {
      setSession({ step: undefined });
      bot.sendMessage(msg.chat.id, "❌ خطا در عملیات. دوباره تلاش کن.");
    }
  });
}
