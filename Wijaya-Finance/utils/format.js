module.exports = {
    currency(num) {
        return `Rp ${Number(num).toLocaleString('id-ID')}`;
    },
    today() {
        return new Date().toISOString().split('T')[0];
    }
};