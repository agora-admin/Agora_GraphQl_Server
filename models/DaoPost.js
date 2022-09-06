const { model, Schema } = require('mongoose');

const daoPostSchema = new Schema({
    daoId: String,
    daoName: String,
    pub_id_pointed: Number,
    profile_id_pointed: Number,
    pub_id: Number,
    profile_id: Number,
    walletAddress: String,
    body: String,
    images: [String],
    timestamp: String,
    upVotes: [{
        walletAddress: String,
        timestamp: String
    }],
    downVotes: [{
        walletAddress: String,
        timestamp: String
    }],
    topics: [String],
    isPoll: Boolean,
    pollOptions: [{
        body: String,
        index: Number
    }],
    pollVotes: [{
        walletAddress: String,
        timestamp: String,
        optionIndex: Number
    }]
});

module.exports = model('DaoPost', daoPostSchema);