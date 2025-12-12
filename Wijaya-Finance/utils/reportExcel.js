const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const format = require('./format');

async function createExcelReport(chatId, type, rows) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Laporan');

    ws.columns = [
        { header: 'Tanggal', key: 'tanggal', width: 15 },
        { header: 'Jenis', key: 'tipe', width: 15 },
        { header: 'Item', key: 'item', width: 25 },
        { header: 'Harga', key: 'harga', width: 20 }
    ];

    // =====================================
    // INPUT DATA
    // =====================================
    rows.forEach(r => ws.addRow({
        tanggal: r.tanggal.toISOString().split('T')[0],
        tipe: r.tipe,
        item: r.item,
        harga: r.harga // simpan angka mentah dulu
    }));

    // =====================================
    // RUMUS PERHITUNGAN TOTAL SALDO
    // =====================================
    const total = rows.reduce((acc, r) => {
        return acc + (r.tipe === "masuk" ? r.harga : -r.harga);
    }, 0);

    // =====================================
    // TAMBAHKAN ROW TOTAL
    // =====================================
    const totalRow = ws.addRow({
        tanggal: "",
        tipe: "",
        item: "TOTAL SALDO",
        harga: total
    });

    // Format total biar tebal & rapih
    totalRow.font = { bold: true };
    totalRow.getCell("D").font = { bold: true };

    // Format harga pake currency
    ws.getColumn("harga").numFmt = '"Rp" #,##0';

    // =====================================
    // SIMPAN FILE
    // =====================================
    const dir = `./reports/${chatId}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `laporan_${type}.xlsx`);
    await wb.xlsx.writeFile(filePath);

    return filePath;
}

module.exports = createExcelReport;
