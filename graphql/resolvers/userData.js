const { AuthenticationError, UserInputError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const UserData = require('../../models/UserData');
const checkAuth = require('../../utils/check-auth');

const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
}

function generateToken(user) {
    return jwt.sign ({
        id: user.id,
        email: user.email,
        username: user.username,
        walletAddress: user.walletAddress ? user.walletAddress : "",
    },
    process.env.SECRET_KEY,
    { expiresIn: '1d' }
    );
}

module.exports = {
    Query: {
        async getUserData(_, {}, context) {

            console.log(context.req.headers.authorization);
            
            const user = checkAuth(context);

            if (user.walletAddress && user.walletAddress !== "") {
                const userData = await UserData.findOne({ walletAddress: user.walletAddress });

                if (!userData) {
                    throw new Error('UserData not found');
                }

                return userData;
            }

            const username = user.username;
            const data = await UserData.findOne({ username }).clone();
            if (!data) {
                throw new Error('User not found');
            }

            return data;
        },
        async getUserProfile(_, { username }, context) {
            const user = checkAuth(context);

            const data = await UserData.findOne({ username }).clone();
            if (!data) {
                throw new Error('User not found');
            }

            return data;
        },
        checkAuth: async (_, { }, context) => {
            const user = checkAuth(context);
            const authHeader = context.req.headers.authorization;
            if (!user) {
                return {
                    token: authHeader,
                    expired: true

                }
            }

            return {
                token: authHeader,
                expired: false,
            }
        },
        async getUserWallet(_, {}, context) {
            const user = checkAuth(context);
            
            console.log(user);

            throw new Error('User not found');
            
        }
    },

    Mutation: {
        async createUserData(_, { userDataInput }, context) {
            console.log("DEBUG 1 ---------");
            console.log({userDataInput});
            const user = checkAuth(context);

            let name = userDataInput.name;
            let email = userDataInput.email;
            let bio = userDataInput.bio;
            let img_url = userDataInput.img_url;
            let web_url = userDataInput.web_url;
            let cover_img_url = userDataInput.cover_img_url;
            let emailVerified = userDataInput.emailVerified;
            let walletAddress = userDataInput.walletAddress;
            let walletConnected = userDataInput.walletConnected;
            let followers = userDataInput.followers;
            let following = userDataInput.following;
            

            const newData = new UserData({
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
                nonce: "",
                isOnchain: false,
                lens: {
                    lens_id: 0,
                    lens_handle: "",
                    image_url: "",
                },
                twitterConnected: false,
                twitter: {
                    twitter_id: "",
                    twitter_handle: "",
                    image_url: "",
                    twitter_name: ""
                },

                user: user.id,
                username: user.username,
                updatedAt: new Date().toISOString(),
            });

            const userData = await newData.save();
            console.log("DEBUG 2 ----------");
            console.log({userData});

            return userData;
        },

        async updateUserName(_, { name }, context) {
            const user = checkAuth(context);
            const data = await UserData.findOne({ username: user.username });
            if (!data) {
                throw new Error('User not found');
            }

            if ( data.username !== user.username ) { 
                throw new Error('You are not authorized to update this user');
            }

            data.name = name;
            data.updatedAt = new Date().toISOString();
            await data.save();

            return data;
        },

        async updateUsername(_, { name, username }, context) {
            const user = checkAuth(context);
            const data = await UserData.findOne({ walletAddress: user.walletAddress });

            if (name !== "") {
                data.name = name;
            }

            if (!data) {
                throw new Error('User not found');
            }

            if ( data.username !== "--" ) {
                throw new Error('You cannot change username.');
            }

            data.username = username;
            data.updatedAt = new Date().toISOString();
            const res = await data.save();
            return res;
        },

        async updateUserBio(_, { bio }, context) {
            const user = checkAuth(context);
            const data = await UserData.findOne({ username: user.username });
            if (!data) {
                throw new Error('User not found');
            }

            if ( data.username !== user.username ) { 
                throw new Error('You are not authorized to update this user');
            }

            data.bio = bio;
            data.updatedAt = new Date().toISOString();
            await data.save();

            return data;
        },

        async updateUserImgUrl(_, { img_url }, context) {
            const user = checkAuth(context);

            if (user.username === "--" || user.walletAddress) {
                const uData = await UserData.findOne({ walletAddress: user.walletAddress });
                if (!uData) {
                    throw new Error('User not found');
                }

                uData.img_url = img_url;
                uData.updatedAt = new Date().toISOString();
                await uData.save();
                return uData;
            }

            const data = await UserData.findOne({ username: user.username });
            if (!data) {
                throw new Error('User not found');
            }

            if ( data.username !== user.username ) { 
                throw new Error('You are not authorized to update this user');
            }

            data.img_url = img_url;
            data.updatedAt = new Date().toISOString();
            await data.save();

            return data;
        },

        async updateUserWebUrl(_, { web_url }, context) {
            const user = checkAuth(context);
            const data = await UserData.findOne({ username: user.username });
            if (!data) {
                throw new Error('User not found');
            }

            if ( data.username !== user.username ) { 
                throw new Error('You are not authorized to update this user');
            }

            data.web_url = web_url;
            data.updatedAt = new Date().toISOString();
            await data.save();

            return data;
        },

        async updateUserCoverImgUrl(_, { cover_img_url }, context) {
            const user = checkAuth(context);
            const data = await UserData.findOne({ username: user.username });
            if (!data) {
                throw new Error('User not found');
            }

            if ( data.username !== user.username ) { 
                throw new Error('You are not authorized to update this user');
            }

            data.cover_img_url = cover_img_url;
            data.updatedAt = new Date().toISOString();
            await data.save();

            return data;
        },

        async updateUserFollowers(_, { newFollower }, context) {
            const user = checkAuth(context);
            const data = await UserData.findOne({ username: user.username });
            if (!data) {
                throw new Error('User not found');
            }

            if ( data.followers.includes(newFollower) ) {
                throw new Error('You are already following this user');
            }

            data.followers.push(newFollower);
            data.updatedAt = new Date().toISOString();
            await data.save();

            return data;
        },

        async updateUserFollowing(_, { newFollowing }, context) {
            const user = checkAuth(context);
            const data = await UserData.findOne({ username: user.username });
            if (!data) {
                throw new Error('User not found');
            }

            if ( data.following.includes(newFollowing) ) {
                throw new Error('You are already following this user');
            }

            data.following.push(newFollowing);
            data.updatedAt = new Date().toISOString();
            await data.save();

            return data;
        },
        async followProfile(_, { username }, context) {

            let user = checkAuth(context);

            const data = await UserData.findOne({ username: username });
            user = await UserData.findOne({ username: user.username });

            if (!data) {
                throw new Error('User not found');
            }

            if ( data.followers.find(follower => follower.username === user.username) ) {
                data.followers = data.followers.filter(follower => follower.username !== user.username);
                user.following = user.following.filter(following => following.username !== data.username);
            } else {
                data.followers.push({
                    username: user.username,
                    onChain: false,
                    tokenId: 0
                })
                user.following.push({
                    username: data.username,
                    onChain: false,
                    tokenId: 0
                });
            }

            await data.save();
            await user.save();

            return data;

        },

        async followOnchain(_, { username, tokenId }, context) {
            let user = checkAuth(context);

            const data = await UserData.findOne({ username: username });
            user = await UserData.findOne({ username: user.username });

            if (!data) {
                throw new Error('User not found');
            }

            const f = data.followers.find(follower => follower.username === user.username)

            console.log(f);

            if (f) {
                data.followers = data.followers.filter(follower => follower.username !== user.username);
                user.following = user.following.filter(following => following.username !== data.username);

                console.log('followers after', data.followers);
                if (!f.onChain) {
                    data.followers.push({
                        username: user.username,
                        onChain: true,
                        tokenId: tokenId
                    })
                    user.following.push({
                        username: data.username,
                        onChain: true,
                        tokenId: tokenId
                    });
                }

            } else {
                data.followers.push({
                    username: user.username,
                    onChain: true,
                    tokenId: tokenId
                })
                user.following.push({
                    username: data.username,
                    onChain: true,
                    tokenId: tokenId
                });
            }

            await data.save();
            await user.save();

            return data;
        },

        async updateUserWalletAddress(_, { walletAddress }, context) {
            const user = checkAuth(context);
            const data = await UserData.findOne({ username: user.username });
            if (!data) {
                throw new Error('User not found');
            }

            if ( data.username !== user.username ) { 
                throw new Error('You are not authorized to update this user');
            }

            data.walletAddress = walletAddress;
            data.walletConnected = true;
            data.updatedAt = new Date().toISOString();
            await data.save();

            return data;
        },
        async refreshToken(_, {}, context) {
            const user = checkAuth(context);

            let userData;

            if (user.username && user.username !== '--') {
                userData = await UserData.findOne({ username: user.username });
            } else {
                userData = await UserData.findOne({ walletAddress: user.walletAddress });
            }
            
            const token = generateToken(userData);

            return {
                token : token,
                expired: false
            }
        },

        async profileOnchain(_, { lensProfileInput }, context) {
            const user = checkAuth(context);

            let userData;

            if (user.username && user.username !== '--') {
                userData = await UserData.findOne({ username: user.username });
            } else {
                userData = await UserData.findOne({ walletAddress: user.walletAddress });
            }

            userData.isOnchain = true;
            let lens = {
                lens_id: lensProfileInput.lens_id,
                lens_handle: lensProfileInput.lens_handle,
                image_url: lensProfileInput.image_url
            }
            userData.lens = lens;

            await userData.save();
            
            return userData;
        }

    }
}