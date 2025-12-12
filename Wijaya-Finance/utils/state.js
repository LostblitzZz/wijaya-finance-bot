const userState = {};


module.exports = {
    get: (id) => userState[id],
    set: (id, value) => userState[id] = value,
    clear: (id) => delete userState[id]
};