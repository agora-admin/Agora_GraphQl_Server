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
            console.log("EventInput: ",eventInput)
            const discourse = await Discourse.findOne({ _id: eventInput.discourseId })
            console.log("Discourse Found: ",discourse);
            
            if (!discourse) {
                throw new Error("Discourse not found")
            }

            const event = new Events({
                discourseId: eventInput.discourseId,
                propId: discourse.propId,
                chainId: discourse.chainId,
                eventTimestamp: eventInput.eventTimestamp,
                venue: eventInput.venue
            })

            await event.save();
            return event;
        }
    }

}