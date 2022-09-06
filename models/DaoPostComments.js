const { model, Schema } = require('mongoose');

const daoPostCommentSchema = new Schema({
    postId: String,
    pub_id_pointed: Number,
    profile_id_pointed: Number,
    body: String,
    timestamp: String,
    walletAddress: String,
    pub_id: Number,
    profile_id: Number,
});

module.exports = model('DaoPostComment', daoPostCommentSchema);