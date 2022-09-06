const { default: axios } = require("axios");
const Stream = require("../models/Stream");
const logr  = require ('../utils/logger');
const { getMToken } = require('./management');

const createStream = async (data) => {

    const config = {
        headers: {
            Authorization: `Bearer ${process.env.LP_KEY}`
        }
    }

    const res = await axios.post( process.env.LP_BASE_URL+'/stream', 
        {
            "name": "disc_"+ data.propId + "_" + data.chainId,
            "profiles": [
                {
                    "name": "720p",
                    "bitrate": 2000000,
                    "fps": 30,
                    "width": 1280,
                    "height": 720
                },
                {
                    "name": "480p",
                    "bitrate": 1000000,
                    "fps": 30,
                    "width": 854,
                    "height": 480
                },
                {
                    "name": "360p",
                    "bitrate": 500000,
                    "fps": 30,
                    "width": 640,
                    "height": 360
                }
            ],
            record: true,
        }, config).then( response => {
            console.log("created stream ");
            return response.data;
        }).catch(err => {
            console.log("Error creating stream", err);
            logr.error('\n\n -------------');
            logr.error('\n\n Error creating stream: ', new Date().toISOString());
            logr.error(err);
        })

    const newStream = new Stream({
        discourseId: data.id,
        propId: data.propId,
        chainId: data.chainId,
        name: res.name,
        streamId: res.id,
        streamKey: res.streamKey,
        playbackId: res.playbackId,
        createdAt: new Date().toISOString(),
        active: false,
    })

    await newStream.save();

    return newStream;
}

const startStream = async (data) => {
    const roomId = data.room_id;
    const hmsMgToken = await getMToken();
    const resStart = await axios.post(process.env.HMS_BEAM_URL,
        {
            "operation": "start",
            "room_id": roomId,
            "meeting_url": `https://${process.env.HMS_DOMAIN}.app.100ms.live/preview/${roomId}/viewer?skip_preview=true&ui_mode=activespeaker`,
            "rtmp_urls": [`rtmp://rtmp.livepeer.com/live/${data.streamKey}`],
            "record": true,
            "resolution" : {"width": 1280, "height": 720}
        },
        {
            headers: {
                Authorization: `Bearer ${hmsMgToken}`
            }
        }
        ).then( response => {
            console.log("connected stream");
            return response.data;
        }).catch(err => {
            console.log("Error connecting stream", err);
            logr.error('\n\n -------------');
            logr.error('\n\n Error connecting stream: ', new Date().toISOString());
            logr.error(err);
        })

    if (resStart) {
        return true;
    }
    return false;
}

const stopStream = async (roomId) => {
    const hmsMgToken = await getMToken();
    const resStop = await axios.post(process.env.HMS_BEAM_URL,
        {
            "operation": "stop",
            "room_id": roomId,
        },
        {
            headers: {
                Authorization: `Bearer ${hmsMgToken}`
            }
        }
        ).then( response => {
            console.log("stopped stream ");
            return response.data;
        }).catch(err => {
            console.log("Error connecting stream", err);
            logr.error('\n\n -------------');
            logr.error('\n\n Error connecting stream: ', new Date().toISOString());
            logr.error(err);
        })

    if (resStop) {
        return true;
    }

    return false;
}

const getSessions = async (id) => {
    console.log("getSessions", id);
    const config = {
        headers: {
            Authorization: `Bearer ${process.env.LP_KEY}`
        }
    }
    const sessions = await axios.get(process.env.LP_BASE_URL + '/stream/'+ id + "/sessions",
        config
    ).then( response => {
        console.log("got sessions for ", id);
        return response.data;
    }).catch(err => {
        console.log("Error getting sessions", err);
        logr.error('\n\n -------------');
        logr.error('\n\n Error getting sessions: ', new Date().toISOString());
        logr.error(err);
    })

    if (sessions) {
        return sessions.map(s => ({
            id: s.id,
            recordingStatus: s.recordingStatus,
            recordingUrl: s.recordingUrl,
            createdAt: new Date(s.createdAt).toISOString(),
        }));
    }


    return [];

}

module.exports = {
    createStream,
    stopStream,
    getSessions,
    startStream
}