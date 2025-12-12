module.exports = {
    DAY: `t.tanggal > NOW() - INTERVAL '1 day'`,
    WEEK: `t.tanggal > NOW() - INTERVAL '7 day'`,
    MONTH: `t.tanggal > NOW() - INTERVAL '30 day'`,
    YEAR: `t.tanggal > NOW() - INTERVAL '365 day'`
};