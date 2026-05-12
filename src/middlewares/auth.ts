import { Context, MiddlewareFn } from "telegraf";
import { config } from "../config";

export const authMiddleware: MiddlewareFn<Context> = async (ctx, next) => {
  const userId = ctx.from?.id;

  if (!userId) {
    await ctx.reply("❌ شناسایی کاربر امکان‌پذیر نیست.");
    return;
  }

  if (!config.telegram.allowedUserIds.includes(userId)) {
    console.warn(`Unauthorized access attempt from user ID: ${userId}`);
    await ctx.reply("🚫 شما مجاز به استفاده از این ربات نیستید.");
    return;
  }

  return next();
};
