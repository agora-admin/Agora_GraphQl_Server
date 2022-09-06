const { model, Schema } = require('mongoose');

const userDataSchema = new Schema({
    username: String,
    name: String,
    email: String,
    bio: String,
    img_url: String,
    web_url: String,
    cover_img_url: String,
    emailVerified: Boolean,
    walletAddress: String,
    walletConnected: Boolean,
    followers: [
        {
            username: String,
            onChain: Boolean,
            tokenId: Number
        }
    ],
    following: [
        {
            username: String,
            onChain: Boolean,
            tokenId: Number
        }
    ],
    updatedAt: String,
    nonce: String,
    isOnchain: Boolean,
    lens: {
        lens_id: Number,
        lens_handle: String,
        image_url: String,
    },
    twitterConnected: Boolean,
    twitter: {
        twitter_id: String,
        twitter_handle: String,
        image_url: String,
        twitter_name: String
    }
    // followedPages: [String],
});

module.exports = model('UserData', userDataSchema);