const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const format = require('./format');

async function createPDF(chatId, type, rows) {
    const dir = `./reports/${chatId}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `laporan_${type}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text(`Laporan ${type}`, { align: 'center' });
    doc.moveDown();

    // ====================================
    // TULIS DATA TRANSAKSI
    // ====================================
    rows.forEach(r => {
        doc.fontSize(12).text(
            `${r.tanggal.toISOString().split('T')[0]} | ${r.tipe} | ${r.item} | ${format.currency(r.harga)}`
        );
    });

    // ====================================
    // HITUNG TOTAL SALDO
    // ====================================
    const total = rows.reduce((acc, r) => {
        return acc + (r.tipe === "masuk" ? r.harga : -r.harga);
    }, 0);

    doc.moveDown();
    doc.fontSize(14).text(`Total Saldo: ${format.currency(total)}`, {
        align: "right",
        underline: true
    });

    doc.end();
    return filePath;
}

module.exports = createPDF;
