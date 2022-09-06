const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('../../models/Post');
const UserData = require('../../models/UserData');
const checkAuth = require('../../utils/check-auth');
const org = require('open-graph-scraper');

module.exports = {
    Query: {
        async getPost(_, { postId }, context) {
            const user = checkAuth(context);

            const post = await Post.findById(postId);

            if (!post) {
                throw new Error('Post not found');
            }

            return post;
        },

        async getPosts(_,{},context) {
            const user = checkAuth(context);

            const posts = await Post.find().sort({ createdAt: -1 });

            return posts;
        },

        async getSelfPosts(_,{},context) {
            const user = checkAuth(context);

            const posts = await Post.find({ 'publisher': user.username }).sort({ createdAt: -1 });

            return posts;
        },

        async getUserPosts(_,{ username },context) {
            const user = checkAuth(context);

            const posts = await Post.find({ 'publisher': username }).sort({ createdAt: -1 });

            return posts;
        },

        async getLinkMeta(_, { url }, context) {
            const options = { url, timeout: 5000 };
            var data = await org(options).then((data) => {
                const { error, result, response } = data;

                if(!result) {
                    throw new Error('Link not found');
                }

                return  {
                    ogTitle: result.ogTitle,
                    ogType: result.ogType,
                    ogUrl: result.ogUrl,
                    ogDescription: result.ogDescription,
                    ogImage: {
                        url: result.ogImage.url,
                        width: result.ogImage.width,
                        height: result.ogImage.height,
                        type: result.ogImage.type
                    },
                    requestUrl: result.requestUrl,
                    success: result.success
                }
            })

            if (!data) {
                throw new Error('Link not found');
            }

            return data;
        }
    },

    Mutation: {
        
        async createPost(_, { postInput }, context) {
            const user = checkAuth(context);

            if (postInput.body.trim() === '') {
                throw new UserInputError('Post body must not be empty');
            }

            const data = await UserData.findOne({ username: user.username });

            const newPost = new Post({
                body: postInput.body,
                images: postInput.images,
                author: {
                    name: data ? data.name : '',
                    username: data ? data.username: '',
                    img_url: data? data.img_url : '',
                },
                timestamp: new Date().toISOString(),
                likes: [],
                comments: [],
                isNFT: false,
                nft: null,
                isOnchain: false,
                lens: {
                    pub_id: 0,
                    lens_id: 0,
                    content_url: '',
                },
                publisher: data.username,
                isMirrored: false,
                mirrorCount: 0,
                mirror: null
            })

            await newPost.save();
            // TODO - send notification to all followers
            // TODO - add pubsub
            return newPost;
        },

        async mirrorPost(_, { postId, pub_id }, context) {
            const user = checkAuth(context);

            const orgPost = await Post.findById(postId);

            if (!orgPost) {
                throw new Error('Post not found');
            }

            const data = await UserData.findOne({ username: user.username });

            if (!data) {
                throw new Error('User not found');
            }

            if (!data.isOnchain) {
                throw new Error('User not onchain');
            }

            const newPost = new Post({
                body: orgPost.body,
                images: orgPost.images,
                author: {
                    name: orgPost.author.name,
                    username: orgPost.author.username,
                    img_url: orgPost.author.img_url,
                },
                timestamp: new Date().toISOString(),
                likes: [],
                comments: [],
                publisher: data.username,
                isMirrored: true,
                isNFT: orgPost.isNFT,
                nft: orgPost.nft,
                mirrorCount: orgPost.mirrorCount + 1,
                mirror: {
                    by: user.username,
                    timestamp: new Date().toISOString(),
                    org_postId: postId,
                    lens_profileId: data.lens.lens_id,
                    lens_pubId: pub_id
                }
            })

            await newPost.save();
            // TODO - send notification to all followers
            // TODO - add pubsub
            return newPost;
        },

        async createNFTPost(_, { nftPostInput }, context) {
            const user = checkAuth(context);
            
            const data = await UserData.findOne({ username: user.username });

            if (!data) {
                throw new Error('User not found');
            }
            
            const newPost = new Post({
                body: nftPostInput.body,
                images: [],
                author: {
                    name: data ? data.name : '',
                    username: data ? data.username: '',
                    img_url: data? data.img_url : '',
                },
                timestamp: new Date().toISOString(),
                likes: [],
                comments: [],
                isNFT: true,
                nft: {
                    title: nftPostInput.nftTitle,
                    description: nftPostInput.nftDescription,
                    collection: nftPostInput.nftCollection,
                    img_url: nftPostInput.nftImgUrl,
                    permalink: nftPostInput.nftPermalink,
                },
                isOnchain: false,
                lens: {
                    pub_id: 0,
                    lens_id: 0,
                    content_url: '',
                },
                publisher: data.username,
                isMirrored: false,
                mirrorCount: 0,
                mirror: null
            })

            await newPost.save();
            return newPost;
        }
        ,

        async likePost(_, { postId }, context) {
            const user = checkAuth(context);

            const post = await Post.findById(postId);

            if (!post) {
                throw new Error('Post not found');
            }

            let userData;

            if (user.username && user.username !== '--') {
                userData = await UserData.findOne({ username: user.username });
            } else {
                userData = await UserData.findOne({ walletAddress: user.walletAddress });
            }
            

            if (post.likes.find(like => like.username === userData.username)) {
                post.likes = post.likes.filter(like => like.username !== userData.username);
            } else {
                post.likes.push({
                    username: userData.username,
                    name: userData.name,
                    timestamp: new Date().toISOString(),
                });
            }


            await post.save();

            return post;
        },
        
        async commentPost(_, { postId, commentBody }, context) {
            const user = checkAuth(context);

            const post = await Post.findById(postId);

            if (!post) {
                throw new Error('Post not found');
            }

            let userData;

            if (user.username && user.username !== '--') {
                userData = await UserData.findOne({ username: user.username });
            } else {
                userData = await UserData.findOne({ walletAddress: user.walletAddress });
            }

            if (commentBody.trim() === '') {
                throw new UserInputError('Comment body must not be empty');
            }

            post.comments.push({
                isOnchain: false,
                username: userData.username,
                name: userData.name,
                body: commentBody,
                timestamp: new Date().toISOString(),
                img_url: userData.img_url,
                likes: []
            });

            await post.save();

            return post;
        },

        async commentOnchain(_, { postId, commentBody, pubId, contentURI, profileIdPointed, pubIdPointed }, context) {

            const user = checkAuth(context);

            const post = await Post.findById(postId);

            if (!post) {
                throw new Error('Post not found');
            }

            let userData;

            if (user.username && user.username !== '--') {
                userData = await UserData.findOne({ username: user.username });
            } else {
                userData = await UserData.findOne({ walletAddress: user.walletAddress });
            }

            if (commentBody.trim() === '') {
                throw new UserInputError('Comment body must not be empty');
            }

            post.comments.push({
                isOnchain: true,
                lens: {
                    profileId: userData.lens.lens_id,
                    pubId: pubId,
                    contentURI: contentURI,
                    profileIdPointed: profileIdPointed,
                    pubIdPointed: pubIdPointed
                },
                username: userData.username,
                name: userData.name,
                body: commentBody,
                timestamp: new Date().toISOString(),
                img_url: userData.img_url,
                likes: []
            });
            await post.save();

            return post;
        },

        async likeComment(_, { postId, commentIndex }, context) {

            const user = checkAuth(context);

            const post = await Post.findById(postId);

            if (!post) {
                throw new Error('Post not found');
            }

            let userData;

            if (user.username && user.username !== '--') {
                userData = await UserData.findOne({ username: user.username });
            } else {
                userData = await UserData.findOne({ walletAddress: user.walletAddress });
            }

            if (post.comments[commentIndex].likes.find(like => like.username === userData.username)) {
                post.comments[commentIndex].likes = post.comments[commentIndex].likes.filter(like => like.username !== userData.username);
            }
            else {
                post.comments[commentIndex].likes.push({
                    username: userData.username,
                    name: userData.name,
                    timestamp: new Date().toISOString(),
                });
            }

            await post.save();

            return post;

        },

        async deleteCommentPost(_, { postId, commentIndex }, context) {
            const user = checkAuth(context);

            const post = await Post.findById(postId);

            if (!post) {
                throw new Error('Post not found');
            }

            let userData;

            if (user.username && user.username !== '--') {
                userData = await UserData.findOne({ username: user.username });
            } else {
                userData = await UserData.findOne({ walletAddress: user.walletAddress });
            }
            
            if (post.comments[commentIndex].username !== userData.username
                && userData.username !== post.author.username) {
                throw new Error('Cannot delete someone else\'s comment');
            } else {
                post.comments.splice(commentIndex, 1);
            }

            await post.save();

            return post;

        },

        async deletePost(_, { postId }, context) {
            const user = checkAuth(context);

            const post = await Post.findById(postId);

            if (!post) {
                throw new Error('Post not found');
            }

            if (post.author.username !== user.username) {
                throw new Error('Cannot delete someone else\'s post');
            }

            await post.remove();

            return post;
        },

        async postOnchain(_, { lensPubInput }, context) {
            const user = checkAuth(context);

            const post = await Post.findById(lensPubInput.postId);

            if (!post) {
                throw new Error('Post not found');
            }

            if (post.author.username !== user.username) {
                throw new Error('Cannot mint someone else\'s post');
            }

            post.isOnchain = true;
            let data = {
                pub_id: lensPubInput.pub_id,
                lens_id: lensPubInput.lens_id,
                content_url: lensPubInput.content_url,
            }
            post.lens = data;

            await post.save();

            return post;
        }
    }
}