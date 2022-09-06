const { model, Schema } = require('mongoose');

const daoUserSchema = new Schema({
    walletAddress: String,
    nonce: String,
    lastLogin: String,
    lensProfileConnected: Boolean,
    lensProfile_id: Number,
})

module.exports = model('DaoUser', daoUserSchema);