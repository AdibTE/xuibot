🤖 Telegram Bot for 3x-ui Panel (Node.js)

یک ربات تلگرام ماژولار، تمیز و قابل توسعه برای مدیریت پنل 3x-ui
ساخته‌شده با Node.js + TypeScript و کتابخانه node-telegram-bot-api

مناسب برای ادمین‌هایی که می‌خوان بدون لاگین به پنل،
وضعیت سیستم، Inbounds، کاربران و تنظیمات رو از داخل تلگرام کنترل کنن.

✨ Features
🔐 Login واقعی به پنل 3x-ui
🌐 مدیریت Inbounds
👥 مشاهده و مدیریت Clients
📊 وضعیت سیستم (CPU / RAM / Uptime)
⚙️ تنظیمات ربات
🧠 Session-based state (بدون دردسر)
🧩 معماری Scene-based (قابل گسترش)
⌨️ Keyboards استاندارد و قابل توسعه
🛡️ Guard برای احراز هویت
🧱 Project Structure
src/
 ├─ bot.ts                 # Entry point
 ├─ config/
 │   ├─ env.ts             # Env & config loader
 │   └─ api.ts             # Axios instance
 ├─ auth/
 │   └─ auth.guard.ts      # Auth middleware
 ├─ scenes/
 │   ├─ login.scene.ts
 │   ├─ inbounds.scene.ts
 │   ├─ clients.scene.ts
 │   ├─ system.scene.ts
 │   └─ settings.scene.ts
 ├─ services/
 │   ├─ auth.service.ts
 │   ├─ inbound.service.ts
 │   ├─ client.service.ts
 │   └─ system.service.ts
 ├─ state/
 │   └─ session.ts         # Session management
 └─ utils/
     ├─ cancel.ts
     └─ keyboards.ts

📌 نکته مهم
این ساختار قرارداد پروژه محسوب می‌شه.
تمام توسعه‌های بعدی باید مطابق همین معماری انجام بشن.

🚀 Getting Started
1️⃣ Clone project
git clone https://github.com/your-username/3x-ui-telegram-bot.git
cd 3x-ui-telegram-bot
2️⃣ Install dependencies
npm install
3️⃣ Environment Variables

یک فایل .env بساز:

BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
PANEL_BASE_URL=https://your-panel-domain
4️⃣ Run (Development)
npm run dev

یا برای اجرا در حالت عادی:

npm run build
npm start
🧠 Architecture Philosophy
Scene-based
هر قابلیت = یک Scene مستقل
بدون if/else جهنمی
Service layer
منطق API جدا از Bot Logic
تست‌پذیر، قابل نگهداری
Stateful Sessions
بدون دیتابیس
بدون دردسر
ولی قابل ارتقا
Single Source of Truth برای Keyboardها
تغییر ظاهر = یک فایل
⌨️ Main Keyboard
export const mainKeyboard: SendMessageOptions = {
  reply_markup: {
    keyboard: [
      [{ text: "👤 کاربران آنلاین" }, { text: "📊 وضعیت سیستم" }],
      [{ text: "🌐 Inbounds" }, { text: "📈 ترافیک" }],
      [{ text: "⚙️ تنظیمات" }],
    ],
    resize_keyboard: true,
  },
};
🔒 Authentication Flow
کاربر دستور /start می‌زند
اگر لاگین نیست → login.scene
توکن پنل ذخیره می‌شود در Session
تمام Sceneها از auth.guard عبور می‌کنند
🛠️ Tech Stack
Node.js
TypeScript
node-telegram-bot-api
Axios
3x-ui API
📈 Future Improvements
✅ Persistence با Redis
✅ Role-based access
✅ Inline keyboards
✅ Logs & Monitoring
✅ Multi-panel support
🧑‍💻 Contribution

Pull Request خوشحال‌مون می‌کنه 😄
قبلش فقط:

ساختار پروژه رو نشکن
Scene جدید؟ → فایل جدید
Logic جدید؟ → Service جدید
📜 License

MIT — آزاد، تمیز، بدون دردسر.