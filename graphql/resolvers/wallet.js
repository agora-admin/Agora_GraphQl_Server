const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const UserData = require('../../models/UserData.js');
const checkAuth = require('../../utils/check-auth');
const safeCheckAuth = require('../../utils/safe-check-auth');
const { ethers } = require('ethers');

var generateNonce = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 24; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

var getEmptyUserData = function (walletAddressInput, nonceInput) {
    let username = "";
    let name = "";
    let email = "";
    let bio = "";
    let img_url = "";
    let web_url = "";
    let cover_img_url = "";
    let emailVerified = false;
    let walletAddress = walletAddressInput;
    let walletConnected = false;
    let followers = [];
    let following = [];
    let updatedAt = "";
    let nonce = nonceInput;

    const newData = new UserData({
        username,
        name,
        email,
        bio,
        img_url,
        web_url,
        cover_img_url,
        emailVerified,
        walletAddress,
        walletConnected,
        followers,
        following,
        updatedAt,
        nonce
    })

    return newData;

}

const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
}

function generateToken(data) {
    return jwt.sign(
        {
            id: data.id,
            username: data.username,
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
        async getNonce(_, { walletAddress }, context) {

            // login/signup with wallet address
            console.log("walletAddress: " + walletAddress);
            const userData = await UserData.findOne({ walletAddress });

            if (userData) {
                userData.nonce = generateNonce();
                const dataU = await userData.save();
                return {
                    nonce: dataU.nonce,
                    newUser: false
                };
            }

            // Already existing user connecting wallet

            const user = safeCheckAuth(context);

            if (user) {
                if (user.username && user.username !== "" && user.username !== "--" && user.username !== walletAddress) {
                    const data = await UserData.findOne({ username: user.username });
                    if (data) {
                        // User connecting wallet
                        if (data.walletAddress !== "") {
                            if (data.walletAddress !== walletAddress) {
                                throw new Error('Already linked with a different wallet');
                            }
                            throw new Error('Already linked with this wallet');
                        }

                        data.walletAddress = walletAddress;
                        data.nonce = generateNonce();
                        const res = await data.save();
                        return {
                            nonce: res.nonce,
                            newUser: false,
                        }
                    }
                }
            }


            const newData = getEmptyUserData(walletAddress, generateNonce());
            newData.username = walletAddress;
            const dataU = await newData.save();
            return {
                nonce: dataU.nonce,
                newUser: true
            }


            // if (user.walletAddress && user.walletAddress !== "") {
            //     const data = await UserData.findOne({ walletAddress }).clone();

            //     if (!data) {



            //     }

            //     data.nonce = generateNonce();
            //     const dataU = await data.save();
            //     return {
            //         nonce: dataU.nonce,
            //         newUser: false
            //     };
            // }

        }
    },

    Mutation: {
        async verifySignature(_, { signature, walletAddress }, context) {

            console.log(`verifying data`);
            console.log(`w: ${walletAddress}, s: ${signature}`);

            const token = context.req.headers.authorization.split('Bearer ')[1];
            console.log(token);
            const user = safeCheckAuth(context);
            if (token && token !== 'undefined') {

                if (user.walletAddress && user.walletAddress !== walletAddress) {
                    throw new Error('Invalid wallet address');
                }

                const userData = await UserData.findOne({ walletAddress });

                if (!userData) {
                    throw new Error('Wallet address not found');
                }

                try {
                    const signerAddress = await ethers.utils.verifyMessage(userData.nonce, signature);
                    if (signerAddress !== walletAddress) {
                        throw new Error('Signature is invalid');
                    }
                    userData.walletConnected = true;
                    let token = generateToken(userData)

                    context.res.set('Set-Cookie', [
                        `jwt=${token}; Max-Age=86400 ${process.env.NODE_ENV === 'development' ? '' : '; Domain=.agorasquare.xyz'};`,
                    ])
                    const res = await userData.save();
                    return {
                        address: signerAddress,
                        username: res.username,
                        token: token
                    };

                } catch (err) {
                    console.log(err);
                    throw new Error('Error verifying signature');
                }
            }

            console.log('passed auth ');
            const userData = await UserData.findOne({ walletAddress });

            if (!userData) {
                throw new Error('Wallet address not found');
            }

            try {
                console.log('sig: ', signature);
                console.log('nonce: ', userData.nonce);
                console.log('add:', walletAddress);
                const signerAddress = await ethers.utils.verifyMessage(userData.nonce, signature);
                if (signerAddress !== walletAddress) {
                    throw new Error('Signature is invalid');
                }

                if (!userData.walletConnected) {

                    userData.walletConnected = true;
                    userData.username = userData.username == "" ? "--" : userData.username;
                    userData.name = userData.name == "" ? shortenAddress(walletAddress) : userData.name;
                    await userData.save();
                }

                console.log(`returning value`);
                let token = generateToken(userData)

                context.res.set('Set-Cookie', [
                    `jwt=${token}; Max-Age=86400 ${process.env.NODE_ENV === 'development' ? '' : '; Domain=.agorasquare.xyz'};`,
                ])

                return {
                    address: signerAddress,
                    username: userData.username,
                    token: token
                };

            } catch (err) {
                console.log(err);
                throw new Error('Error verifying signature');
            }
        }
    }
}