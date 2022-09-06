const Discourse = require("../../models/Discourse");
const Events = require("../../models/Events")

module.exports = {
    Query: {
        async getEvent(_, { propId, chainId }, context) {
            const event = await Events.findOne({ propId, chainId })
            if (!event) {
                throw new Error("Event not found")
            }
            return event;
        }
    },

    Mutation: {
        async createEvent(_, { eventInput }, context) {
            const discourse = await Discourse.findOne({ propId: eventInput.propId, chainId: eventInput.chainId })

            if (!discourse) {
                throw new Error("Discourse not found")
            }

            if (discourse.status.terminated) {
                throw new Error("Discourse is terminated")
            }

            if (discourse.status.completed) {
                throw new Error("Discourse is completed")
            }

            if (!discourse.irl) {
                throw new Error("Discourse is not irl")
            }

            console.log('discourse', discourse.title);

            const event = new Events({
                discourseId: discourse._id,
                propId: eventInput.propId,
                chainId: eventInput.chainId,
                eventTimestamp: eventInput.eventTimestamp,
                venue: eventInput.venue
            })

            await event.save();
            return event;
        }
    }

}