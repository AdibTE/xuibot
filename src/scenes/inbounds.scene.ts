import Bot from "node-telegram-bot-api";
import { requireAuth } from "../auth/auth.guard";
import { getSession, setSession } from "../state/session";
import {
  getInbounds,
  createInbound,
  deleteInbound,
} from "../services/inbound.service";

export function registerInboundsScene(bot: Bot) {
  // 🌐 Inbounds menu
  bot.onText(/🌐 Inbounds/, (msg) => {
    requireAuth(bot, msg, () => {
      setSession({ step: "INBOUND_MENU" });

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
    if (!getSession("authenticated") || !getSession("step")) return;

    try {
      switch (getSession("step")) {
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

            setSession({ step: undefined });
            bot.sendMessage(msg.chat.id, text);
          }

          if (msg.text === "2") {
            setSession({ step: "INBOUND_CREATE_PROTOCOL" });
            bot.sendMessage(
              msg.chat.id,
              "🔧 پروتکل را وارد کن (vmess / vless / trojan):",
            );
          }

          if (msg.text === "3") {
            setSession({ step: "INBOUND_DELETE_ID" });
            bot.sendMessage(
              msg.chat.id,
              "🆔 ID Inbound مورد نظر برای حذف را وارد کن:",
            );
          }
          break;

        // 🧱 CREATE FLOW
        case "INBOUND_CREATE_PROTOCOL":
          setSession({ inboundScene: { protocol: msg.text } });
          setSession({ step: "INBOUND_CREATE_PORT" });
          bot.sendMessage(msg.chat.id, "🔌 پورت را وارد کن:");
          break;

        case "INBOUND_CREATE_PORT":
          setSession({
            inboundScene: {
              ...getSession("inboundScene"),
              port: Number(msg.text),
            },
          });
          setSession({ step: "INBOUND_CREATE_REMARK" });
          bot.sendMessage(msg.chat.id, "✏️ Remark را وارد کن:");
          break;

        case "INBOUND_CREATE_REMARK":
          setSession({
            inboundScene: { ...getSession("inboundScene"), remark: msg.text },
          });
          setSession({ step: "INBOUND_CREATE_CONFIRM" });

          bot.sendMessage(
            msg.chat.id,
            `📦 تأیید ایجاد Inbound:
                Protocol: ${getSession("inboundScene").protocol}
                Port: ${getSession("inboundScene").port}
                Remark: ${getSession("inboundScene").remark}

                برای تأیید بنویس: yes`,
          );
          break;

        case "INBOUND_CREATE_CONFIRM":
          if (msg.text.toLowerCase() !== "yes") {
            setSession({ step: undefined });
            bot.sendMessage(msg.chat.id, "❌ لغو شد");
            return;
          }

          await createInbound({
            protocol: getSession("inboundScene").protocol,
            port: getSession("inboundScene").port,
            remark: getSession("inboundScene").remark,
          });

          setSession({ step: undefined });
          bot.sendMessage(msg.chat.id, "✅ Inbound با موفقیت ایجاد شد");
          break;

        // 🗑 DELETE FLOW
        case "INBOUND_DELETE_ID":
          setSession({ inboundScene: { id: Number(msg.text) } });
          setSession({ step: "INBOUND_DELETE_CONFIRM" });

          bot.sendMessage(
            msg.chat.id,
            `⚠️ حذف Inbound با ID ${getSession("inboundScene").id}\nبرای تأیید بنویس: delete`,
          );
          break;

        case "INBOUND_DELETE_CONFIRM":
          if (msg.text.toLowerCase() !== "delete") {
            setSession({ step: undefined });
            bot.sendMessage(msg.chat.id, "❌ لغو شد");
            return;
          }

          await deleteInbound(getSession("inboundScene").id!);
          setSession({ step: undefined });
          bot.sendMessage(msg.chat.id, "🗑 Inbound حذف شد");
          break;
      }
    } catch (e) {
      setSession({ step: undefined });
      console.log(e)
      bot.sendMessage(msg.chat.id, "❌ خطا در انجام عملیات. دوباره تلاش کن.");
    }
  });
}
