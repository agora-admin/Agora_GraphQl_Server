const {model, Schema} = require('mongoose');

const eventSchema = new Schema({
    discourseId: String,
    propId: Number,
    chainId: Number,
    eventTimestamp: String,
    venue : {
        name: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String
    }
});

module.exports = model('Event', eventSchema);