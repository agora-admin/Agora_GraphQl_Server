const { model, Schema } = require('mongoose');

const proposalSchema = new Schema({
    proposalId: String,
    daoId: String,
    proposalDescription: String,
    proposalTitle: String,
    proposalState: Number,
    proposalType: String,
})