const { model, Schema } = require('mongoose');

const discouseSlotSchema = new Schema({
    propId: Number,
    chainId: Number,
    proposed: Boolean,
    proposer: {
        address: String,
        timestamp: String  
    },
    slots: [
        {
            timestamp: String,
            accepted: Boolean
        }
    ]
});

module.exports = model('DiscourseSlot', discouseSlotSchema);