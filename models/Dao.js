const { model, Schema } = require('mongoose');

const daoSchema = new Schema({
    daoName: String,
    daoAddress: String,
    governorAddress: String,
    profile_id: Number,
    forum_pub_id: Number,
    daoDescription: String,
    daoOverview: String,
    daoPurpose: String,
    daoLinks: [{
        platform: String,
        link: String
    }],
    daoType: String,
    daoImg: String,
    daoCoverImg: String,
    feeFollow: Boolean,
    quorumPercentage: Number,
    votingPeriod: Number,
    votingDelay: Number,
    minimumDelay: Number,
    members: [
        {
            walletAddress: String,
            joiningDate: String,
            tokenId: Number
        }
    ],
    followCost: Number,
    followCurrency: String,
    followNFTAddress: String,
    creator: String
})

module.exports = model('Dao', daoSchema);