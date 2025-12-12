require("dotenv").config();
const db = require("./db");

const mainMenu = require("./menus/mainMenu");
const expenseMenu = require("./menus/expenseMenu");
const incomeMenu = require("./menus/incomeMenu");
const reportMenu = require("./menus/reportMenu");
const periodSQL = require("./menus/periodMenu");

const state = require("./utils/state");
const createExcel = require("./utils/reportExcel");
const createPDF = require("./utils/reportPDF");
const format = require("./utils/format");

const periodMap = {
  HARIINI: "DAY",
  HARIAN: "DAY",
  HARI: "DAY",
  MINGGUINI: "WEEK",
  MINGGUAN: "WEEK",
  BULANINI: "MONTH",
  BULANAN: "MONTH",
  TAHUNINI: "YEAR",
  TAHUNAN: "YEAR"
};

async function generateReport(bot, chatId, type) {
  let clean = type.replace(/[^A-Z]/gi, "").toUpperCase();
  let key = periodMap[clean] || clean;
  const where = periodSQL[key];

  if (!where) {
    console.log("DEBUG PERIOD:", { type, clean, key });
    return bot.sendMessage(chatId, "Periode tidak dikenali!");
  }

  const result = await db.query(
    `SELECT * FROM transactions t 
     WHERE user_id = $1 AND ${where}
     ORDER BY tanggal DESC`,
    [chatId]
  );

  if (result.rows.length === 0) {
    return bot.sendMessage(chatId, "Tidak ada transaksi pada periode tersebut.");
  }

  let total = 0;

  result.rows.forEach(r => {
    const nominal = Number(r.harga) || 0;
    const tipe = (r.tipe || r.type || "").toLowerCase();

    if (tipe === "masuk") {
      total += nominal;
    } else if (tipe === "keluar") {
      total -= nominal;
    }
  });

  await bot.sendMessage(
    chatId,
    `💰 *Total saldo periode ini:* ${format.currency(total)}`,
    { parse_mode: "Markdown" }
  );

  bot.sendMessage(chatId, "Sedang membuat laporan... 📄");

  const excelPath = await createExcel(chatId, key, result.rows);
  const pdfPath = await createPDF(chatId, key, result.rows);

  await bot.sendDocument(chatId, excelPath);
  await bot.sendDocument(chatId, pdfPath);

  bot.sendMessage(chatId, "📁 Laporan selesai!");
}

module.exports = function setupBot(bot) {
  console.log("🤖 Wijaya Finance System berjalan (Webhook Mode)...");

  bot.onText(/\/start/, (msg) => {
    const id = msg.chat.id;
    state.clear(id);
    bot.sendMessage(id, "Selamat datang! Pilih menu:", mainMenu.keyboard);
  });

  bot.on("message", async (msg) => {
    const id = msg.chat.id;
    const text = msg.text;
    const s = state.get(id);

    if (s?.mode === "expense_item") {
      state.set(id, { mode: "expense_price", item: text });
      return bot.sendMessage(id, expenseMenu.askPrice);
    }

    if (s?.mode === "expense_price") {
      const amount = parseInt(text);

      if (isNaN(amount)) {
        return bot.sendMessage(id, "Nominal harus angka!");
      }

      await db.query(
        `INSERT INTO transactions (user_id, tipe, item, harga, tanggal)
        VALUES ($1, 'keluar', $2, $3, NOW())`,
        [id, s.item, amount]
      );

      state.clear(id);
      return bot.sendMessage(id, "Pengeluaran berhasil dicatat!", mainMenu.keyboard);
    }

    if (s?.mode === "income_item") {
      state.set(id, { mode: "income_price", item: text });
      return bot.sendMessage(id, incomeMenu.askPrice);
    }

    if (s?.mode === "income_price") {
      const amount = parseInt(text);

      if (isNaN(amount)) {
        return bot.sendMessage(id, "Nominal harus angka!");
      }

      await db.query(
        `INSERT INTO transactions (user_id, tipe, item, harga, tanggal)
         VALUES ($1, 'masuk', $2, $3, NOW())`,
        [id, s.item, amount]
      );

      state.clear(id);
      return bot.sendMessage(id, "Pemasukan berhasil dicatat!", mainMenu.keyboard);
    }

    if (s?.mode === "report_period") {
      if (text === "⬅️ Kembali") {
        state.clear(id);
        return bot.sendMessage(id, "Kembali ke menu utama:", mainMenu.keyboard);
      }
      return generateReport(bot, id, text);
    }

    if (text === "➖ Tambah Pengeluaran") {
      state.set(id, { mode: "expense_item" });
      return bot.sendMessage(id, expenseMenu.askItem);
    }

    if (text === "➕ Tambah Pemasukan") {
      state.set(id, { mode: "income_item" });
      return bot.sendMessage(id, incomeMenu.askItem);
    }

    if (text === "📊 Lihat Laporan") {
      state.set(id, { mode: "report_period" });
      return bot.sendMessage(id, "Pilih periode laporan:", reportMenu.keyboard);
    }

    if (text === "⬅️ Kembali") {
      state.clear(id);
      return bot.sendMessage(id, "Kembali ke menu utama:", mainMenu.keyboard);
    }
  });
};
