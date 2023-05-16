const axios = require('axios').default;
const Discourse = require('../models/Discourse');
const logr  = require ('../utils/logger');
const { tweetHappening, tweetCompleted } = require('./tweeter');
const { getMToken } = require('./management');

const createTimedMeet = (data) => {

    var date = new Date();
    var time = date.getTime() + 30000;
    var newDate = new Date(time);
    var newDateString = newDate.toISOString();
    var newDateFromString = new Date(newDateString);
    var diff = newDateFromString.getTime() - date.getTime();
    setTimeout(createRawMeet, diff, data);
}
const scheduleMeetCreation = (data, timestamp) => {

    var targetDate = new Date(timestamp);
    var diff = targetDate.getTime() - new Date().getTime();
    if (diff < 0) {
        console.log("date is in the past");
        return;
    }
    setTimeout(createRawMeet, diff, data);
}

const scheduleDiscourseCompletion = (data, timestamp) => {

    var targetDate = new Date(timestamp);
    var diff = targetDate.getTime() - new Date().getTime();
    setTimeout(endDiscourse, diff + 3600, data);
}

const endDiscourse = async(data) => {
    const discourse = await Discourse.findById(data.id);
            if (!discourse) {
                throw new Error('Discourse not found');
            }

            discourse.status.completed = true;
            discourse.discourse.ended = true;

            await discourse.save();
            await tweetCompleted(discourse);

            return "done";
}

const createRawMeet = async (data) => {
    var token = await getMToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    const res = await axios.post( process.env.HMS_URI , {
        name: "dis_"+data.id,
        description: data.title,
        template: process.env.HMS_DISCOURSE_TEMPLATE,
        region: "auto"
    }, config)
    .then( response => {
        console.log("created meet");
        logr.log('info', 'Meet created: '+response.id);
        return response.data;
    } )
    .catch(err => {
        console.log("Error creating meet", err);
        logr.error('\n\n -------------');
        logr.error('\n\n Error creating meet: ', new Date().toISOString());
        logr.error(err);
    })

    const discourse = await Discourse.findById(data.id);

    logr.log('info', 'Meet created: ',res);
    console.log("writing roomId:", res.id);
    discourse.discourse.room_id = res.id;
    discourse.discourse.ended = !res.active;
    
    await discourse.save();
    console.log("discourse updated with room_id", res.id);
    
    console.log("tweeting ..");
    logr.log('info', ' Tweeting ');

    await tweetHappening(discourse);

    return;
}

module.exports = {
    createTimedMeet,
    scheduleMeetCreation,
    scheduleDiscourseCompletion
}