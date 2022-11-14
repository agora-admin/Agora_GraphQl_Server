const axios = require('axios').default;
const ethers = require('ethers');
const logr = require('./logger');

const config = {
    headers: {
        Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
    }
}

const formatDate = (date) => {
    const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

const getTimeFromDate = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    // const hrStr = hours < 10 ? "0" + hours : hours > 12 ? (hours - 12) < 10 ? "0" + ((hours - 12) === 0 ? 12 : hours - 12) : hours : hours;
    const hrStr = h < 10 ? "0" + h : h;
    const minStr = minutes < 10 ? "0" + minutes : minutes;
    const aStr = hours < 12 ? "AM" : "PM";

    return hrStr + ":" + minStr + " " + aStr;
    
}

const getFundTotal = (funds) => {

    let sum = 0;

    for (let i = 0; i < funds.length; i++) {
        sum += +ethers.utils.formatEther(`${funds[i].amount}`);
    }

    return sum;
}

const getUsername = (user) => {
    if (user.charAt(0) === '@') {
        return user;
    }

    return '@' + user;
}

const checkModerator = (moderator) => {
    return moderator ? `#Moderator ${getUsername(moderator)}` : '';
}

const tweetCreated = async (data) => {
    await axios.post(`${process.env.ADMIN_SERVER_URL}/tweet`, {
    status: `#NewDiscourse  ${data.title} \n#Speakers  ${getUsername(data.speakers[0].username)} & ${getUsername(data.speakers[1].username)} \n${checkModerator(data.moderator.username)} \n#Funding till ${formatDate(new Date(+data.endTS * 1000))} \n\nhttps://discourses.agorasquare.xyz/${data.id}`,
    },{
        headers: {
            Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
        }
    }).then(res => { return "done"; })
    .catch(err => { return "error"; })
}
const tweetSpeakerConfirmed = async (data) => {
    await axios.post(`${process.env.ADMIN_SERVER_URL}/tweet`, {
    status: `#Update Speakers confirmed ✅\n#Raised  ${getFundTotal(data.funds)} #MATIC 💰 \n\n#Discourse  ${data.title} \n#Speakers  ${getUsername(data.speakers[0].username)} & ${getUsername(data.speakers[1].username)} \n#Funding till ${formatDate(new Date(+data.endTS * 1000))} \n\nhttps://discourses.agorasquare.xyz/${data.id}`,
    },{
        headers: {
            Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
        }
    }).then(res => { return "done"; })
    .catch(err => { return "error"; })
}

const tweetHappening = async (data) => {
    await axios.post(`${process.env.ADMIN_SERVER_URL}/tweet`, {
    status: `#Update Happening Now 📢\n#Raised  ${getFundTotal(data.funds)} #MATIC 💰 \n\n#Discourse  ${data.title} \n#Speakers  ${getUsername(data.speakers[0].username)} & ${getUsername(data.speakers[1].username)} \n\nJoin Here https://discourses.agorasquare.xyz/${data.id}`,
    },{
        headers: {
            Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
        }
    }).then(res => { 
        logr.log('info', 'Tweeted happening');
        return "done";
    })
    .catch(err => { 
        logr.error('error', 'Error tweeting happening', err);
        return "error";
    })
}

const tweetTerminated = async (data) => {
    await axios.post(`${process.env.ADMIN_SERVER_URL}/tweet`, {
    status: `#Update Discourse Terminated ❌\n#Raised  ${getFundTotal(data.funds)} #MATIC 💰 \n\n#Discourse  ${data.title} \n#Speakers  ${getUsername(data.speakers[0].username)} & ${getUsername(data.speakers[1].username)} \n\nPledges can be withdrawn from the discourse page ⬇️  \nhttps://discourses.agorasquare.xyz/${data.id}`,
    },{
        headers: {
            Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
        }
    }).then(res => { return "done"; })
    .catch(err => { return "error"; })
}
const tweetScheduled = async (data) => {
    await axios.post(`${process.env.ADMIN_SERVER_URL}/tweet`, {
    status: `#Update Discourse Scheduled 🕐\nat ${formatDate(new Date(data.discourse.meet_date))}  ${getTimeFromDate(new Date(data.discourse.meet_date))} \n\n#Discourse  ${data.title} \n#Speakers  ${getUsername(data.speakers[0].username)} & ${getUsername(data.speakers[1].username)} \n\nhttps://discourses.agorasquare.xyz/${data.id}`,
    },{
        headers: {
            Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
        }
    }).then(res => { return "done"; })
    .catch(err => { return "error"; })
}

const tweetCompleted = async (data) => {
    await axios.post(`${process.env.ADMIN_SERVER_URL}/tweet`, {
    status: `#Update Discourse Completed ✅\n#Funds  ${getFundTotal(data.funds)} #MATIC 💰 \n\n#Discourse  ${data.title} \n#Speakers  ${getUsername(data.speakers[0].username)} & ${getUsername(data.speakers[1].username)} \n\nStakes can be withdrawn from the discourse page ⬇️  \nhttps://discourses.agorasquare.xyz/${data.id}`,
    },{
        headers: {
            Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
        }
    }).then(res => { return "done"; })
    .catch(err => { return "error"; })
}

const tweetFundClaimable = async (data) => {
    await axios.post(`${process.env.ADMIN_SERVER_URL}/tweet`, {
        status: `#Update Speakers Joined ✅\n#Funds  ${getFundTotal(data.funds)} #MATIC 💰 \n\n#Discourse  ${data.title} \n#Speakers  ${getUsername(data.speakers[0].username)} & ${getUsername(data.speakers[1].username)} \n\n\nhttps://discourses.agorasquare.xyz/${data.id}`,
        },{
            headers: {
                Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
            }
        }).then(res => { return "done"; })
        .catch(err => { return "error"; })
}



module.exports = {
    tweetCreated,
    tweetSpeakerConfirmed,
    tweetTerminated,
    tweetCompleted,
    tweetHappening,
    tweetScheduled
}