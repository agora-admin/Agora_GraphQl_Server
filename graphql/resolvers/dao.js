const Dao = require('../../models/Dao');
const DaoUser = require('../../models/DaoUser');
const checkAuth = require("../../utils/check-auth-dao");

module.exports = {
    Query: {
        getDaos: async (_, {}, context) => {
            checkAuth(context);
            const daos = await Dao.find({});
            return daos;
        },
        getDao: async (_, { daoId }, context) => {
            checkAuth(context);
            const dao = await Dao.findById(daoId);
            if (!dao) {
                throw new Error('Dao not found');
            }
            return dao;
        }
    },
    Mutation: {
        createDao: async (_, { daoInput }, context) => {
            const user = checkAuth(context);

            const newDao = new Dao({
                daoName: daoInput.daoName,
                daoAddress: daoInput.daoAddress,
                governorAddress: daoInput.governorAddress,
                profile_id: daoInput.profile_id,
                forum_pub_id: daoInput.forum_pub_id,
                daoDescription: daoInput.daoDescription,
                daoOverview: daoInput.daoOverview,
                daoPurpose: daoInput.daoPurpose,
                daoLinks: daoInput.daoLinks,
                daoType: daoInput.daoType,
                daoImg: daoInput.daoImg,
                daoCoverImg: daoInput.daoCoverImg,
                feeFollow: daoInput.feeFollow,
                quorumPercentage: daoInput.quorumPercentage,
                votingPeriod: daoInput.votingPeriod,
                votingDelay: daoInput.votingDelay,
                minimumDelay: daoInput.minimumDelay,
                members: [{
                    walletAddress: user.walletAddress,
                    joiningDate: new Date().toISOString(),
                    tokenId: 1
                }],
                followCost: daoInput.followCost,
                followCurrency: daoInput.followCurrency,
                followNFTAddress: daoInput.followNFTAddress,
                creator: user.walletAddress
            });

            await newDao.save();

            return newDao;
        },

        joinDao: async (_, { daoId, tokenId }, context) => {
            const user = checkAuth(context);

            const dao = await Dao.findById(daoId);

            if(!dao) {
                throw new Error('Dao not found');
            }

            if(dao.members.find(member => member.walletAddress === user.walletAddress)) {
                throw new Error('You are already a member of this DAO');
            }

            dao.members.push({
                walletAddress: user.walletAddress,
                joiningDate: new Date().toISOString(),
                tokenId: tokenId
            })

            const res = await dao.save();

            return res;

        },

        profileMinted: async (_, { profile_id }, context) => {
            const user = checkAuth(context);

            const userData = await DaoUser.findOne({ walletAddress: user.walletAddress });

            if(!userData) {
                throw new Error('User not found');
            }

            userData.lensProfile_id = profile_id;
            userData.lensProfileConnected = true;

            const res = await userData.save();
            return res;
        }
    }
}