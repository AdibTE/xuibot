import Bot from "node-telegram-bot-api";
import { requireAuth } from "../auth/auth.guard";
import { getSession } from "../state/session";
import {
  getInbounds,
  createInbound,
  deleteInbound,
} from "../services/inbound.service";

export function registerInboundsScene(bot: Bot) {
  // 🌐 Inbounds menu
  bot.onText(/🌐 Inbounds/, (msg) => {
    requireAuth(bot, msg, () => {
      const session = getSession(msg.from!.id);
      session.step = "INBOUND_MENU";
      session.data = {};

      bot.sendMessage(
        msg.chat.id,
        `🌐 مدیریت Inbounds
1️⃣ مشاهده لیست
2️⃣ ایجاد Inbound
3️⃣ حذف Inbound

عدد گزینه را ارسال کن`,
      );
    });
  });

  // 📥 message handler (FSM)
  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;

    const session = getSession(msg.from!.id);
    if (!session.authenticated || !session.step) return;

    try {
      switch (session.step) {
        case "INBOUND_MENU":
          if (msg.text === "1") {
            const list = await getInbounds();

            const text =
              list.length === 0
                ? "❌ هیچ Inboundای وجود ندارد"
                : list
                    .map(
                      (i: any) =>
                        `🆔 ${i.id} | ${i.protocol} | Port: ${i.port}`,
                    )
                    .join("\n");

            session.step = undefined;
            bot.sendMessage(msg.chat.id, text);
          }

          if (msg.text === "2") {
            session.step = "INBOUND_CREATE_PROTOCOL";
            bot.sendMessage(
              msg.chat.id,
              "🔧 پروتکل را وارد کن (vmess / vless / trojan):",
            );
          }

          if (msg.text === "3") {
            session.step = "INBOUND_DELETE_ID";
            bot.sendMessage(
              msg.chat.id,
              "🆔 ID Inbound مورد نظر برای حذف را وارد کن:",
            );
          }
          break;

        // 🧱 CREATE FLOW
        case "INBOUND_CREATE_PROTOCOL":
          session.data!.protocol = msg.text;
          session.step = "INBOUND_CREATE_PORT";
          bot.sendMessage(msg.chat.id, "🔌 پورت را وارد کن:");
          break;

        case "INBOUND_CREATE_PORT":
          session.data!.port = Number(msg.text);
          session.step = "INBOUND_CREATE_REMARK";
          bot.sendMessage(msg.chat.id, "✏️ Remark را وارد کن:");
          break;

        case "INBOUND_CREATE_REMARK":
          session.data!.remark = msg.text;
          session.step = "INBOUND_CREATE_CONFIRM";

          bot.sendMessage(
            msg.chat.id,
            `📦 تأیید ایجاد Inbound:
Protocol: ${session.data!.protocol}
Port: ${session.data!.port}
Remark: ${session.data!.remark}

برای تأیید بنویس: yes`,
          );
          break;

        case "INBOUND_CREATE_CONFIRM":
          if (msg.text.toLowerCase() !== "yes") {
            session.step = undefined;
            bot.sendMessage(msg.chat.id, "❌ لغو شد");
            return;
          }

          await createInbound({
            protocol: session.data!.protocol,
            port: session.data!.port,
            remark: session.data!.remark,
          });

          session.step = undefined;
          bot.sendMessage(msg.chat.id, "✅ Inbound با موفقیت ایجاد شد");
          break;

        // 🗑 DELETE FLOW
        case "INBOUND_DELETE_ID":
          session.data!.id = Number(msg.text);
          session.step = "INBOUND_DELETE_CONFIRM";

          bot.sendMessage(
            msg.chat.id,
            `⚠️ حذف Inbound با ID ${session.data!.id}\nبرای تأیید بنویس: delete`,
          );
          break;

        case "INBOUND_DELETE_CONFIRM":
          if (msg.text.toLowerCase() !== "delete") {
            session.step = undefined;
            bot.sendMessage(msg.chat.id, "❌ لغو شد");
            return;
          }

          await deleteInbound(session.data!.id);
          session.step = undefined;
          bot.sendMessage(msg.chat.id, "🗑 Inbound حذف شد");
          break;
      }
    } catch (e) {
      session.step = undefined;
      bot.sendMessage(msg.chat.id, "❌ خطا در انجام عملیات. دوباره تلاش کن.");
    }
  });
}
