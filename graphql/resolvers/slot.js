const checkAuth = require('../../utils/check-auth');
const Discourse = require('../../models/Discourse');
const Slot = require('../../models/DiscourseSlot');
const { scheduleMeetCreation } = require('../../utils/meetCreator');
const { tweetScheduled } = require('../../utils/tweeter');
const {setSchedule} = require('../../utils/adminServer')

module.exports = {
    Query: {
        async getSlot(_, { propId, chainId }) {
            const discourse = await Discourse.findOne({ propId, chainId });
            if (!discourse) {
                throw new Error('Discourse not found');
            }
            const slot = await Slot.findOne({ propId, chainId });

            if (!slot) {
                return {
                    propId: propId,
                    chainId: chainId,
                    proposed: false,
                    proposer: {
                        address: '',
                        timestamp: ''
                    },
                    slots: []
                }
            }
            return slot;
        },
        async getSlotById(_, { id }) {
            const discourse = await Discourse.findById(id);

            if (!discourse) {
                throw new Error('Discourse not found');
            }

            const slot = await Slot.findOne({ propId: discourse.propId, chainId: discourse.chainId });

            if (!slot) {
                return {
                    propId: discourse.propId,
                    chainId: discourse.chainId,
                    proposed: false,
                    proposer: {
                        address: '',
                        timestamp: ''
                    },
                    slots: []
                }
            }
            return slot;
        }
    },
    Mutation: {
        async proposeSlot(_, { slotInput }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findOne({ propId: slotInput.propId, chainId: slotInput.chainId });
            if (!discourse) {
                throw new Error('Discourse not found');
            }

            if (discourse.irl) {
                throw new Error('Discourse is irl');
            }

            const slot = await Slot.findOne({ propId: slotInput.propId, chainId: slotInput.chainId });
            if (!slot) {
                const newSlot = new Slot({
                    propId: slotInput.propId,
                    chainId: slotInput.chainId,
                    proposed: true,
                    proposer: {
                        address: user.walletAddress,
                        timestamp: new Date().toISOString()
                    },
                    slots: slotInput.slots
                });
                await newSlot.save();
                return newSlot;
            } else {
                if (slot.proposed && slot.proposer.address !== user.walletAddress) {
                    throw new Error('Slot already proposed');
                }

                slot.proposed = true;
                slot.proposer = {
                    address: user.walletAddress,
                    timestamp: new Date().toISOString()
                };
                slot.slots = slotInput.slots;
                await slot.save();
                return slot;
            }
        },

        async acceptSlot(_, { slotInput }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findOne({ propId: slotInput.propId, chainId: slotInput.chainId });
            if (!discourse) {
                throw new Error('Discourse not found');
            }

            const slot = await Slot.findOne({ propId: slotInput.propId, chainId: slotInput.chainId });
            if (!slot) {
                throw new Error('Slot not found');
            }

            slot.slots = slotInput.slots;
            await slot.save();

            discourse.discourse.meet_date = slotInput.slots.find(s => s.accepted == true).timestamp;

            try{
                const timestamp = (new Date(discourse.discourse.meet_date)).getTime()
                await setSchedule({id: discourse.propId,timestamp: parseInt((timestamp/1000)),chainId: discourse.chainId})
            }catch(err){
                console.log(err);
            }

            await discourse.save();
            if(!discourse.irl) {
                scheduleMeetCreation(discourse, discourse.discourse.meet_date);
            }
            await tweetScheduled(discourse);

            return slot;
        }
    }
}