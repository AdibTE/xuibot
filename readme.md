# 🤖 Telegram Bot for 3x-ui Panel (Node.js)

یک ربات تلگرام **ماژولار، تمیز و قابل توسعه** برای مدیریت پنل **3x-ui**  
ساخته‌شده با **Node.js + TypeScript** و کتابخانه `node-telegram-bot-api`

> مناسب برای ادمین‌هایی که می‌خوان بدون لاگین به پنل،  
> وضعیت سیستم، Inbounds، کاربران و تنظیمات رو از داخل تلگرام کنترل کنن.

---

## ✨ Features

- 🔐 **Login واقعی به پنل 3x-ui**
- 🌐 مدیریت **Inbounds**
- 👥 مشاهده و مدیریت **Clients**
- 📊 وضعیت سیستم (CPU / RAM / Uptime)
- ⚙️ تنظیمات ربات
- 🧠 Session-based state (بدون دردسر)
- 🧩 معماری Scene-based (قابل گسترش)
- ⌨️ Keyboards استاندارد و قابل توسعه
- 🛡️ Guard برای احراز هویت

---

## 🧱 Project Structure

```bash
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
```

📌 **نکته مهم**  
این ساختار **قرارداد پروژه** محسوب می‌شه.  
تمام توسعه‌های بعدی باید مطابق همین معماری انجام بشن.

---

## 🚀 Getting Started

### 1️⃣ Clone project

```bash
git clone https://github.com/your-username/3x-ui-telegram-bot.git
cd 3x-ui-telegram-bot
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Environment Variables

یک فایل `.env` بساز:

```env
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
PANEL_BASE_URL=https://your-panel-domain
```

---

### 4️⃣ Run (Development)

```bash
npm run dev
```

یا:

```bash
npm run build
npm start
```

---

## 🧠 Architecture Philosophy

- Scene-based architecture
- Service layer separation
- Stateful sessions
- Single source of truth keyboards

---

## ⌨️ Main Keyboard

```ts
export const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "👤 کاربران آنلاین" }, { text: "📊 وضعیت سیستم" }],
      [{ text: "🌐 Inbounds" }, { text: "📈 ترافیک" }],
      [{ text: "⚙️ تنظیمات" }],
    ],
    resize_keyboard: true,
  },
};
```

---

## 🔒 Authentication Flow

1. /start
2. login scene
3. panel login
4. auth guard protects all scenes

---

## 📈 Future Improvements

- Redis persistence
- Role-based access
- Inline keyboards
- Logging system
- Multi-panel support

---

## 📜 License

MIT
