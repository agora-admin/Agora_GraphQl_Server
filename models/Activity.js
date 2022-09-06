const { model, Schema } = require('mongoose');

const activitySchema = new Schema({
    twitter_handle: String,
    walletAddress: String,
    timestamp: String,
    type: String,
    propId: Number,
    chainId: Number,
    title: String,
    discourseId: String,
    description: String,
    value: String,
})

module.exports = model('Activity', activitySchema);