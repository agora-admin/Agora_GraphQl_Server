const DaoPost = require('../../models/DaoPost');
const checkAuth = require('../../utils/check-auth-dao');

module.exports = {
    Query: {
        getDaoPosts: async (_, {}, context) => {
            checkAuth(context);
            const posts = await DaoPost.find({});
            return posts;
        },
        getDaoPostsOnly: async (_, {daoId}, context) => {
            checkAuth(context);
            const posts = await DaoPost.find({daoId});
            if (!posts) {
                throw new Error('Posts not found');
            }
            return posts;
        }
    },

    Mutation: {
        createDaoPost: async (_, { daoPostInput }, context) => {
            const user = checkAuth(context);

            if (daoPostInput.body.trim() === '') {
                throw new Error('Body must not be empty');
            }

            const data = await DaoPost.findOne({ walletAddress: user.walletAddress });

            const newPost = new DaoPost({
                daoId: daoPostInput.daoId,
                daoName: daoPostInput.daoName,
                pub_id_pointed: daoPostInput.pub_id_pointed,
                profile_id_pointed: daoPostInput.profile_id_pointed,
                pub_id: daoPostInput.pub_id,
                profile_id: daoPostInput.profile_id,
                walletAddress: user.walletAddress,
                body: daoPostInput.body,
                images: daoPostInput.images,
                timestamp: new Date().toISOString(),
                upVotes: [],
                downVotes: [],
                topics: daoPostInput.topics,
                isPoll: false,
                pollOptions: [],
                pollVotes: []
            })

            await newPost.save();

            return newPost;
        }
    }
}