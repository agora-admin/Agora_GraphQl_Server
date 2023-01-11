const { model, Schema } = require('mongoose');

const discourseSchema = new Schema({
    speakers: [
        {
            name: String,
            username: String,
            address: String,
            confirmed: Boolean,
            isTwitterHandle: Boolean,
            image_url: String
        }
    ],
    moderator: {
        name: String,
        username: String,
        image_url: String
    },
    propId: Number,
    chainId: Number,
    description: String,
    title: String,
    prop_description: String,
    prop_starter: String,
    charityPercent: Number,
    initTS: String,
    endTS: String,
    topics : [String],
    funds: [{
        address: String,
        amount: Number,
        timestamp: String,
        txnHash: String
    }],
    irl: Boolean,
    yt_link: String,
    link: String,
    disable: Boolean,
    status: {
        disputed: Boolean,
        completed: Boolean,
        terminated: Boolean,
        speakersConfirmation: Number,
        withdrawn: [String] 
    },
    txnHash: String,
    discourse: {
        room_id: String,
        ended: Boolean,
        meet_date: String,
        confirmation: [String],
        c_timestamp: String
    },
    dVotes: [
        {
            address: String,
            txnHash: String,
            timestamp: String
        }
    ]
});

module.exports = model('Discourse', discourseSchema);