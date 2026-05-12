export function inboundInlineKeyboard(inbounds) {
    return {
        inline_keyboard: inbounds.map(i => [
            { text: `${i.remark} (${i.port})`, callback_data: `inbound:${i.id}` },
        ]),
    };
}
