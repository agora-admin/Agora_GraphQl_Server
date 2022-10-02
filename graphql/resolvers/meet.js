const { default: axios } = require('axios');
var jwt = require('jsonwebtoken');
var uuid4 = require('uuid4');
const Discourse = require('../../models/Discourse');
const checkAuth = require('../../utils/check-auth');
const { getMToken, getUToken } = require('../../utils/management');
const logr = require('../../utils/logger');

var app_access_key = '62697b38ff688c037a37f2c8';
var app_secret = 'R1RdGL926UWY2x7bfyT9NwZGtL1w7rn6gi-ITgSBT53d7UJiFcivNDtdf2xGCyUjzFdxlwcU7Tuk2mGsdNGh2kBkVrH5zow6OjjZWZAa34Wvlu2ciodkBA-k0BvRIaucersmOzkgzJJF14FGy4oT7CmbQElMmM5i9i-gU6IYg6U=';
var template = 'default_createown_c7018a65-c897-408a-ad98-95e4cfff3cce';
var url = "https://prod-in2.100ms.live/api/v2/rooms";


module.exports = {
    Query: {

        async getMeetToken(_, { id }, context) {
            const user = checkAuth(context);

            const discourse = await Discourse.findById(id);

            if (!discourse) {
                throw new Error('Meet not found');
            }

            if (discourse.discourse.room_id === "" || discourse.discourse.ended === true) {
                throw new Error('Meet not found or may have ended');
            }


            const role = (discourse.speakers[0].address === user.walletAddress ||
                discourse.speakers[1].address === user.walletAddress) ? 'speaker' : 'viewer';
            var data = {
                room_id: discourse.discourse.room_id,
                user_id: user.walletAddress,
                role: role
            }

            var token = await getUToken(data).catch(err => {
                logr.error('\n\n -------------');
                logr.error('\n\n Error getting user token: ', new Date().toISOString());
                logr.error(err);
                throw new Error('Error getting user token');
            })

            var date = new Date();
            var exp = date.getTime() + (24 * 60 * 60 * 1000);
            var expDate = new Date(exp);

            context.res.set('Set-Cookie', [
                `meetToken=${token}; Max-Age=86400 ${process.env.NODE_ENV === 'development' ? '' : '; Domain=.agorasquare.xyz'};`,
            ])

            return {
                token: token,
                eat: expDate.toISOString(),
                iat: new Date().toISOString(),
            }
        }

    },

    Mutation: {
        
    }
}

