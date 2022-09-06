const Discourse = require('../../models/Discourse');
const Stream = require('../../models/Stream');
const { getSessions, startStream, stopStream } = require('../../utils/streamManager');

module.exports = {
    Query: {
        async getSessions (_, { id }) {
            const discourse = await Discourse.findById(id);
            if (!discourse) {
                throw new Error('Discourse not found');
            }

            if (!discourse.discourse.room_id) {
                throw new Error('Discourse not started');
            }

            let propId = discourse.propId;
            let chainId = discourse.chainId;
            let stream = await Stream.findOne({ propId, chainId });
            if (!stream) {
                throw new Error('Stream not found');
            }
            const res = await getSessions(stream.streamId);
            console.log(res);

            if (res.length > 0) {
                return res;
            }

            return [];
        }
    },

    Mutation: {
        async check(_, {id}) {
            const discourse = await Discourse.findById(id);
            if (!discourse) {
                throw new Error('Discourse not found');
            }
            let propId = discourse.propId;
            let chainId = discourse.chainId;
            let stream = await Stream.findOne({ propId, chainId });
            if (!stream) {
                return "checked";
            }

            if(!stream.active) {
                console.log("rId",discourse.discourse.room_id);
                const res = await startStream({
                    room_id: discourse.discourse.room_id,
                    streamKey: stream.streamKey,
                });
                stream = await Stream.findOne({ propId, chainId });
                stream.active = res;
                await stream.save();
            }

            return "checked";
        },

        async stopRec(_, {id}) {

            const discourse = await Discourse.findById(id);
            

            if (!discourse) {
                throw new Error('Discourse not found');
            }

            let propId = discourse.propId;
            let chainId = discourse.chainId;
            let stream = await Stream.findOne({ propId, chainId });
            if (!stream) {
                throw new Error('Stream not found');
            }

            if (!stream.active) {
                throw new Error('Stream not active');
            }

            const res = await stopStream(discourse.discourse.room_id);

            stream.active = false;

            await stream.save();

            return res;
        }
    }
}