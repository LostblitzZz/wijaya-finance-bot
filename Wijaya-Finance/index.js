require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const setupBot = require("./bot");

const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
  console.error("BOT_TOKEN tidak ditemukan!");
  process.exit(1);
}

const app = express();
app.use(express.json());

const bot = new TelegramBot(TOKEN, { polling: false });

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Wijaya Finance Bot is running!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

setupBot(bot);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server berjalan di port ${PORT}`);

  let webhookBase = process.env.WEBHOOK_URL;
  
  if (!webhookBase && process.env.REPLIT_DEV_DOMAIN) {
    webhookBase = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }

  if (webhookBase) {
    const webhookEndpoint = `${webhookBase}/bot${TOKEN}`;
    try {
      await bot.setWebHook(webhookEndpoint);
      console.log(`Webhook aktif di ${webhookBase}`);
    } catch (err) {
      console.error("Gagal set webhook:", err.message);
    }
  } else {
    console.log("WEBHOOK_URL tidak diset");
  }
});
