const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');
const DaoUser = require('../../models/DaoUser.js');
const { ethers } = require('ethers');

var generateNonce = () => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 24; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return "By signing this you are logging into AGORA SQUARE \n" + text;
}

var getEmptyUserData = (walletAddress, nonceInput) => {
    return new DaoUser({
        walletAddress,
        nonce: nonceInput,
        lastLogin: new Date().toISOString(),
        lensProfileConnected: false,
        lensProfile_id: 0,
    })
}

function generateToken(data) {
    return jwt.sign(
        {
            id: data.id,
            walletAddress: data.walletAddress,
        },
        process.env.SECRET_KEY,
        {
            expiresIn: '1d'
        }
    );
}


module.exports = {
    Query: {
        async getDaoNonce(_, { walletAddress }) {
            const user = await DaoUser.findOne({ walletAddress });
            if (!user) {

                const nonce = generateNonce();
                const newData = getEmptyUserData(walletAddress, nonce);
                const result = await newData.save();
                return {
                    nonce: result.nonce,
                    newUser: true
                }
            }
            return {
                nonce: user.nonce,
                newUser: false
            }
        }
    },

    Mutation: {
        async verifySignatureDao(_, { walletAddress, signature }) {
            const user = await DaoUser.findOne({ walletAddress });
            if (!user) {
                throw new UserInputError('User does not exist');
            }

            try {
                const signerAddress = await ethers.utils.verifyMessage(user.nonce, signature);
                if (signerAddress === walletAddress) {

                    user.lastLogin = new Date().toISOString();
                    await user.save();

                    return {
                        verified: true,
                        token: generateToken(user),
                        walletAddress: user.walletAddress,
                        lensProfileConnected: user.lensProfileConnected,
                        lensProfile_id: user.lensProfile_id
                    }
                }
                return {
                    verified: false,
                    token: null,
                    walletAddress: null,
                    lensProfileConnected: false,
                    lensProfile_id: 0
                }
            } catch (err) {
                throw new Error('Invalid signature');
            }
        }
    }
}