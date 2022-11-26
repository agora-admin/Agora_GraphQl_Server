const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');
const checkAuth = require('../../utils/check-auth');
const Discourse = require('../../models/Discourse');
const UserData = require('../../models/UserData');
const { tweetSpeakerConfirmed, tweetScheduled, tweetTerminated, tweetCompleted, tweetCreated } = require('../../utils/tweeter');
const { setSpeakerAddress, terminateDiscourse, isDisputed } = require('../../utils/adminServer');
const axios = require('axios').default;
const { createTimedMeet } = require('../../utils/meetCreator')
const { createStream, startStream, stopStream } = require('../../utils/streamManager');
const Stream = require('../../models/Stream');
const Activity = require('../../models/Activity');

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

module.exports = {
    Query: {
        async getDiscourse(_, { propId, chainId }, context) {

            const discourse = await Discourse.findOne({ propId, chainId });

            if (!discourse) {
                throw new Error('Discourse not found');
            }

            return discourse;

        },

        async getDiscourses() {
            const discourses = await Discourse.find();

            if (!discourses) {
                return [];
            }

            return discourses;
        },
        async getDiscoursesByChainID(_, { chainId }) {
            const discourses = await Discourse.find({ chainId: chainId });

            if (!discourses) {
                return [];
            }

            return discourses;

        },
        async getDiscourseById(_, { id }, context) {
            const discourse = await Discourse.findById(id);

            if (!discourse) {
                throw new Error('Discourse not found');
            }

            return discourse;
        },
        async checkTwitterLink(_, { twitterHandle }, context) {
            // TODO: use auth [temporarily disabled]
            // const user = checkAuth(context);

            const userData = await UserData.findOne({ 'twitter.twitter_handle': twitterHandle }).clone();
            // console.log(userData);

            if (!userData) {
                return {
                    twitter_handle: twitterHandle,
                    address: '0x0',
                    connected: false
                }
            }

            return {
                twitter_handle: 'demoHandle',
                address: userData.walletAddress,
                connected: true
            }
        },

        async getDiscourseFromAdmin(_, { id }) {
            let discription = ""
            await axios.get(`http://localhost:3000/discourse?id=${id}`)
                .then(res => {
                    console.log(res.data);
                    discription = res.data.description;
                })
                .catch(err => {
                    console.log(err);
                }).then(() => {
                    console.log('done');
                    return 'done';
                })

            return discription;
        },

        async getUserActivity(_, { }, context) {
            const user = checkAuth(context);
            const activities = await Activity.find({ walletAddress: user.walletAddress });
            return activities;
        },

        async checkTitle(_, { title }) {
            const discourse = await Discourse.findOne({
                title: {
                    $regex: new RegExp('^' + title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
                }
            });
            console.log(discourse?.title);
            if (discourse) {
                return false;
            }
            return true;
        }
    },

    Mutation: {
        async createDiscourse(_, { discourseInput }, context) {
            const user = checkAuth(context);

            const newDiscourse = new Discourse({
                speakers: discourseInput.speakers,
                moderator: discourseInput.moderator,
                propId: discourseInput.propId,
                chainId: discourseInput.chainId,
                description: discourseInput.description,
                title: discourseInput.title,
                prop_description: discourseInput.prop_description,
                prop_starter: discourseInput.prop_starter,
                charityPercent: discourseInput.charityPercent,
                initTS: discourseInput.initTS,
                endTS: discourseInput.endTS,
                topics: discourseInput.topics,
                funds: [
                    {
                        address: user.walletAddress,
                        amount: discourseInput.initialFunding,
                        timestamp: new Date().toISOString(),
                        txnHash: discourseInput.txnHash
                    }
                ],
                irl: discourseInput.irl,
                status: {
                    disputed: false,
                    completed: false,
                    terminated: false,
                    speakersConfirmation: 0,
                    withdrawn: []
                },
                txnHash: discourseInput.txnHash,
                discourse: {
                    room_id: "",
                    ended: false,
                    meet_date: "",
                    confirmation: []
                }
            });

            const result = await newDiscourse.save();
            await tweetCreated(result);

            return result;
        },

        async updateFunding(_, { propId, chainId, amount, txn }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findOne({ propId, chainId });

            if (!discourse) {
                throw new Error('Discourse not found');
            }

            const checkFund = discourse.funds.find(fund => fund.txnHash === txn);

            if (checkFund) {
                throw new Error('Transaction already exists');
            }

            const newFunding = {
                address: user.walletAddress,
                amount: amount,
                timestamp: new Date().toISOString(),
                txnHash: txn
            }

            discourse.funds.push(newFunding);

            const result = await discourse.save();

            return result;
        },

        async participate(_, { id, email }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findById(id);
            const userData = await UserData.findOne({ walletAddress: user.walletAddress });

            if (!discourse) {
                throw new Error('Discourse not found');
            }

            if (!userData) {
                throw new Error('User data not found');
            }

            if (userData.email === "") {
                userData.email = email;
                await userData.save();
            }

            // TODO : check if discourse is active

            if (discourse.participants.find(participant => participant.address === user.walletAddress)) {
                discourse.participants = discourse.participants.filter(participant => participant.address !== user.walletAddress);
            }

            const newParticipant = {
                address: user.walletAddress,
                email: email,
                twitter_handle: userData.twitterConnected ? userData.twitter.twitter_handle : '',
                timestamp: new Date().toISOString()
            }

            discourse.participants.push(newParticipant);

            const result = await discourse.save();

            return result;
        },
        async linkTwitter(_, { twitterHandle, twitter_name, image_url }, context) {
            const user = checkAuth(context);

            const userData = await UserData.findOne({ walletAddress: user.walletAddress });

            if (!userData) {
                throw new Error('User not found');
            }

            if (userData.twitterConnected) {
                throw new Error('Twitter already connected');
            }

            userData.twitterConnected = true;
            userData.twitter.twitter_handle = twitterHandle;
            userData.twitter.twitter_name = twitter_name;
            userData.twitter.image_url = image_url;
            userData.twitter.twitter_id = "na";

            await userData.save();

            return {
                twitter_handle: twitterHandle,
                address: userData.walletAddress,
                connected: true
            }

        },

        async setWalletAddress(_, { propId, chainId }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findOne({ propId, chainId });
            const userData = await UserData.findOne({ walletAddress: user.walletAddress });

            if (!userData.twitterConnected) {
                throw new Error('Twitter not connected');
            }

            if (!discourse) {
                throw new Error('Discourse not found');
            }

            if (userData.twitter.twitter_handle !== discourse.speakers[0].username &&
                userData.twitter.twitter_handle !== discourse.speakers[1].username) {
                throw new Error('User not authorized');
            }

            if (userData.twitter.twitter_handle === discourse.speakers[0].username) {
                let res = await setSpeakerAddress({
                    id: discourse.propId,
                    address: user.walletAddress,
                    handle: userData.twitter.twitter_handle,
                    chainId: discourse.chainId
                });

                if (res.status !== 200) {
                    throw new Error('Error while setting address');
                }
                discourse.speakers[0].address = user.walletAddress;
            }
            if (userData.twitter.twitter_handle === discourse.speakers[1].username) {
                let res = await setSpeakerAddress({
                    id: discourse.propId,
                    address: user.walletAddress,
                    handle: userData.twitter.twitter_handle,
                    chainId: discourse.chainId
                });

                if (res.status !== 200) {
                    throw new Error('Error while setting address');
                }
                discourse.speakers[1].address = user.walletAddress;
            }

            const result = await discourse.save();

            return result;
        },

        async speakerConfirmation(_, { propId, chainId }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findOne({ propId, chainId });
            const userData = await UserData.findOne({ walletAddress: user.walletAddress });

            if (!userData.twitterConnected) {
                throw new Error('Twitter not connected');
            }

            if (!discourse) {
                throw new Error('Discourse not found');
            }

            if (userData.twitter.twitter_handle !== discourse.speakers[0].username &&
                userData.twitter.twitter_handle !== discourse.speakers[1].username) {
                throw new Error('User not authorized');
            }

            if (userData.twitter.twitter_handle === discourse.speakers[0].username) {
                discourse.speakers[0].confirmed = true;
            }
            if (userData.twitter.twitter_handle === discourse.speakers[1].username) {
                // add method to set wallet address for speaker 2
                discourse.speakers[1].confirmed = true;
            }

            discourse.status.speakersConfirmation++;

            const result = await discourse.save();

            if (discourse.status.speakersConfirmation >= 2) {
                await tweetSpeakerConfirmed(result);
            }

            return result;
        },


        async endMeet(_, { propId, chainId }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findOne({ propId, chainId });
            if (!discourse) {
                throw new Error('Discourse not found');
            }

            discourse.status.completed = true;
            discourse.discourse.ended = true;

            const stream = await Stream.findOne({ propId, chainId });
            if (stream) {
                if (stream.active) {
                    await stopStream(discourse.discourse.room_id);
                    stream.active = false;
                    await stream.save();
                }
            }

            await discourse.save();
            await tweetCompleted(discourse);

            return "done";

        },

        async fundWithdrawn(_, { propId, chainId }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findOne({ propId, chainId });
            if (!discourse) {
                throw new Error('Discourse not found');
            }

            discourse.status.withdrawn.push(user.walletAddress);

            await discourse.save();

            return "done";

        },

        async terminateDiscourse(_, { propId, chainId }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findOne({ propId, chainId });
            if (!discourse) {
                throw new Error('Discourse not found');
            }

            let res = await terminateDiscourse({
                id: discourse.propId,
                chainId: discourse.chainId
            });

            if (res.status !== 200) {
                throw new Error('Error while terminating discourse');
            }

            discourse.status.terminated = true;

            await discourse.save();

            tweetTerminated(discourse);

            return "done";

        },

        async enterDiscourse(_, { propId, chainId }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findOne({ propId, chainId });
            if (!discourse) {
                throw new Error('Discourse not found');
            }

            if (discourse.status.terminated) {
                throw new Error('Discourse already terminated');
            }

            if (discourse.speakers[0].address !== user.walletAddress && discourse.speakers[1].address !== user.walletAddress) {
                throw new Error('User not authorized');
            }

            discourse.discourse.confirmation.push(user.walletAddress);
            discourse.discourse.c_timestamp = new Date().toISOString();

            let stream = await Stream.findOne({ propId, chainId });

            if (stream) {
                if (!stream.active) {
                    stream.active = true;
                    await stream.save();
                }
            } else {
                const s = await createStream(discourse);
                if (s) {
                    const res = await startStream({
                        room_id: discourse.discourse.room_id,
                        streamKey: s.streamKey,
                    });
                    stream = await Stream.findOne({ propId, chainId });
                    stream.active = res;
                    await stream.save();
                }
            }

            await discourse.save();

            return "done";

        },

        async disputed(_, { propId, chainId, txnHash }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findOne({ propId, chainId });
            if (!discourse) {
                throw new Error('Discourse not found');
            }

            if (discourse.status.terminated) {
                throw new Error('Discourse already terminated');
            }

            if (!discourse.funds.find(fund => fund.address === user.walletAddress)) {
                throw new Error('User not authorized');
            }

            discourse.dVotes.push({
                address: user.walletAddress,
                txnHash: txnHash,
                timestamp: new Date().toISOString()
            })


            let s = await isDisputed({
                propId: propId,
                chainId: chainId
            });

            if (s.status === 200) {
                discourse.status.disputed = s.data;
            }

            await discourse.save();

            return 0;
        }
    }
}