import { InlineKeyboardMarkup } from "node-telegram-bot-api";

export function inboundInlineKeyboard(inbounds: any[]): InlineKeyboardMarkup {
  return {
    inline_keyboard: inbounds.map(i => [
      { text: `${i.remark} (${i.port})`, callback_data: `inbound:${i.id}` },
    ]),
  };
}