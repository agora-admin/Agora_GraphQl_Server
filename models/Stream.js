const { model, Schema } = require('mongoose');

const streamSchema = new Schema({
    discourseId: String,
    propId: Number,
    chainId: Number,
    name: String,
    streamId: String,
    streamKey: String,
    playbackId: String,
    createdAt: String,
    active: Boolean
})

module.exports = model('Stream', streamSchema);