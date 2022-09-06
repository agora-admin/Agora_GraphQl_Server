const { model, Schema } = require('mongoose');

// TODO : add retweet attributes
// TODO : likes on comment

const postSchema = new Schema({
    body: String,
    images: [String],
    author: {
        username: String,
        name: String,
        img_url: String,
    },
    timestamp: String,
    likes: [
        {
            username: String,
            name: String,
            timestamp: String,
        }
    ],
    comments: [
        {
            isOnchain: Boolean,
            lens: {
                profileId: Number,
                pubId: Number,
                contentURI: String,
                profileIdPointed: Number,
                pubIdPointed: Number,
            },
            username: String,
            name: String,
            body: String,
            timestamp: String,
            img_url: String,
            likes: [
                {
                    username: String,
                    name: String,
                    timestamp: String,
                }
            ]
        }
    ],
    isNFT: Boolean,
    nft: {
        title: String,
        description: String,
        collection: String,
        img_url: String,
        permalink: String,
    },
    isOnchain: Boolean,
    lens: {
        pub_id: Number,
        lens_id: Number,
        content_url: String,
    },
    publisher: String,
    isMirrored: Boolean,
    mirrorCount: Number,
    mirror: {
        by: String,
        timestamp: String,
        org_postId: String,
        lens_profileId: Number,
        lens_pubId: Number
    }

});

module.exports = model('Post', postSchema);