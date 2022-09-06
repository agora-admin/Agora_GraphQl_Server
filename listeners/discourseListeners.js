const Web3 = require('web3');
const DiscourseAbi = require('../abi/DiscourseHub.json');
const Discourse = require('../models/Discourse');
const logr = require('../utils/logger');
require('dotenv').config();

const web3 = new Web3(
    new Web3.providers.WebSocketProvider(
        process.env.INFURA_ENDPOINT_WS_RINKEBY
    )
)

const FROM_BLOCK = 0;

let discourseHub = new web3.eth.Contract(DiscourseAbi, process.env.DISCOURSE_HUB_ADDRESS);

const attachListeners = async () => {
    listenPledgeWithdrawal();
    listenFundWithdrawal();
    listenSetSpeakerAddress();
}

const listenPledgeWithdrawal = () => {
    var eventBlocks = new Set();
    discourseHub.events.WithdrawPledge({
        fromBlock: FROM_BLOCK,
    }, function (error, event) {
        if (error) {
            console.log(error);
        } else {
            console.log('event ', event.blockNumber);
        }
    }).on('connected', function (event) {
        console.log('Listening to WithdrawPledge events');
    }).on('data', function (event) {
        // Do event things
        if (eventBlocks.has(event.blockNumber)) {
            console.log('already processed');
            return;
        } else {
            logr.log(new Date().toISOString,'/n/n-----/n/n FundWithdrawl event /n/n');
            eventBlocks.add(event.blockNumber);
            const discourse = Discourse.findOne({ propId: event.returnValues._propId });

            if (!discourse) {
                logr.log('discourse not found with id: ', event.returnValues._propId);
                return;
            }
            
            logr.log('propId: ', discourse.propId);
            logr.log('withdrawer: ', event.returnValues._pledger);

            discourse.status.withdrawn.push(event.returnValues._pledger);

            await discourse.save();
        }
    }).on('error', function (error) {
        logr.error('\n\n --------------------- \n\n');
        logr.error(new Date().toISOString,'PledgeWithdrawal: ', error);
        logr.error('\n\n --------------------- \n\n');
    })
}

const listenFundWithdrawal = () => {
    var eventBlocks = new Set();
    discourseHub.events.WithdrawFunds({
        fromBlock: FROM_BLOCK,
    }, function (error, event) {
        if (error) {
            console.log(error);
        } else {
            console.log('event ', event.blockNumber);
        }
    }).on('connected', function (event) {
        console.log('Listening to WithdrawFund events');
    }).on('data', function (event) {
        // Do event things
        if (eventBlocks.has(event.blockNumber)) {
            console.log('already processed');
            return;
        } else {
            logr.log(new Date().toISOString,'/n/n-----/n/n FundWithdrawl event /n/n');
            eventBlocks.add(event.blockNumber);
            const discourse = Discourse.findOne({ propId: event.returnValues._propId });

            if (!discourse) {
                logr.log('discourse not found with id: ', event.returnValues._propId);
                return;
            }
            logr.log('propId: ', discourse.propId);
            logr.log('withdrawer: ', event.returnValues._recipient);

            discourse.status.withdrawn.push(event.returnValues._recipient);

            await discourse.save();
        }
    }).on('error', function (error) {
        logr.error('\n\n --------------------- \n\n');
        logr.error(new Date().toISOString,'FundWithdrawal: ', error);
        logr.error('\n\n --------------------- \n\n');
    })
}

const listenSetSpeakerAddress = () => {
    var eventBlocks = new Set();
    discourseHub.events.WithdrawFunds({
        fromBlock: FROM_BLOCK,
    }, function (error, event) {
        if (error) {
            console.log(error);
        } else {
            console.log('event ', event.blockNumber);
        }
    }).on('connected', function (event) {
        console.log('Listening to SetSpeakerAddress events');
    }).on('data', function (event) {
        // Do event things
        if (eventBlocks.has(event.blockNumber)) {
            console.log('already processed');
            return;
        } else {
            logr.log(new Date().toISOString,'/n/n-----/n/n SetSpeakerAddress event /n/n');
            eventBlocks.add(event.blockNumber);
            const discourse = Discourse.findOne({ propId: event.returnValues._propId });

            if (!discourse) {
                logr.log('discourse not found with id: ', event.returnValues._propId);
                return;
            }
            logr.log('propId: ', discourse.propId);
            logr.log('speaker1: ', event.returnValues._speaker1);
            logr.log('speaker2: ', event.returnValues._speaker2);

            if (discourse.speakers[0].address === "0x00" && event.returnValues._speaker1 !== "0x0000000000000000000000000000000000000000") {
                discourse.speakers[0].address = event.returnValues._speaker1;
                logr.log('setting speaker1 -> address: ', event.returnValues._speaker1);
            }

            if (discourse.speakers[1].address === "0x00" && event.returnValues._speaker2 !== "0x0000000000000000000000000000000000000000") {
                discourse.speakers[1].address = event.returnValues._speaker2;
                logr.log('setting speaker2 -> address: ', event.returnValues._speaker2);
            }

            await discourse.save();
        }
    }).on('error', function (error) {
        logr.error('\n\n --------------------- \n\n');
        logr.error(new Date().toISOString,'setSpeakerAddress: ', error);
        logr.error('\n\n --------------------- \n\n');
    })
}

module.exports = attachListeners;