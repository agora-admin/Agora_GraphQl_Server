const { gql } = require('apollo-server');

module.exports = gql`

    type Nonce {
        nonce: String!
        newUser: Boolean!
    }

    type LinkMeta {
        ogTitle: String
        ogType: String
        ogUrl: String
        ogDescription: String
        ogImage: OgImage
        requestUrl: String
        success: Boolean
    }

    type OgImage {
        url: String
        width: String
        height: String
        type: String
    }

    type User {
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!
        lastLogin: String!
    }

    type WalletUser {
        address: String!
        username: String!
        token: String!
    }

    type UserData {
        id: ID!
        username: String!
        name: String!
        email: String!
        bio: String!
        img_url: String!
        web_url: String!
        cover_img_url: String!
        emailVerified: Boolean!
        walletAddress: String!
        walletConnected: Boolean!
        followers: [Follow]!
        following: [Follow]!
        updatedAt: String!
        isOnchain: Boolean
        lens: LensProfile
        twitterConnected: Boolean
        twitter: TwitterProfile
    }

    type TwitterProfile {
        twitter_id: String
        twitter_handle: String
        image_url: String
        twitter_name: String
    }

    type Follow {
        username: String!
        onChain: Boolean
        tokenId: Int
    }

    type LensProfile {
        lens_id: Int
        lens_handle: String
        image_url: String
    }

    type LensPub {
        pub_id: Int
        lens_id: Int
        content_url: String
    }

    type NFT {
        title: String
        description: String
        collection: String
        img_url: String
        permalink: String
    }

    type Mirror {
        by: String
        timestamp: String
        org_postId: String
        lens_profileId: Int
        lens_pubId: Int
    }

    type Post {
        id: ID!
        body: String!
        images: [String]!
        author: Author!
        timestamp: String!
        likes: [Like]!
        comments: [Comment]!
        isNFT: Boolean
        nft: NFT
        isOnchain: Boolean
        lens: LensPub
        publisher: String
        isMirrored: Boolean
        mirrorCount: Int
        mirror: Mirror
    }

    type Author {
        name: String!
        username: String!
        img_url: String!
    }

    type Like {
        username: String!
        name: String!
        timestamp: String!
    }

    type Comment {
        isOnchain: Boolean
        lens: LensComment
        username: String!
        name: String!
        body: String!
        timestamp: String!
        img_url: String
        likes: [Like]
    }

    type LensComment {
        profileId: Int
        pubId: Int
        contentURI: String
        profileIdPointed: Int
        pubIdPointed: Int
    }

    input LensProfileInput {
        lens_id: Int!
        lens_handle: String!
        image_url: String!
    }

    input LensPubInput {
        pub_id: Int!
        lens_id: Int!
        content_url: String!
        postId: ID!
    }

    input PostInput {
        body: String!
        images: [String]!
    }

    input NFTPostInput {
        body: String!
        nftTitle: String!
        nftDescription: String!
        nftCollection: String!
        nftImgUrl: String!
        nftPermalink: String!
    }
    
    input UserDataInput {
        name: String!
        email: String!
        bio: String!
        img_url: String!
        web_url: String!
        cover_img_url: String!
        emailVerified: Boolean!
        walletAddress: String!
        walletConnected: Boolean!
        followers: [String]!
        following: [String]!
    }

    input RegisterInput {
        username: String!
        password: String!
        email: String!
        name: String!
    }
    
    type Username {
        username: String!
        available: Boolean!
        message: String!
    }

    type Email {
        email: String!
        available: Boolean!
        message: String!
    }

    type Auth {
        token: String!
        expired: Boolean!
    }

    input DiscourseInput {
        speakers: [SpeakersInput]
        moderator: ModeratorInput
        propId: Int
        chainId: Int
        description: String
        title: String
        prop_description: String
        prop_starter: String
        charityPercent: Int
        irl: Boolean
        initTS: String
        endTS: String
        topics: [String]
        initialFunding: String
        txnHash: String
    }

    input SpeakersInput {
        name: String
        username: String
        address: String
        confirmed: Boolean
        isTwitterHandle: Boolean
        image_url: String
    }

    input ModeratorInput {
        name: String
        username: String
        image_url: String
    }

    input FundInput {
        address: String!
        amount: Int!
        timestamp: String!
    }

    type Discourse {
        id: ID!
        title: String!
        description: String!
        speakers: [Speaker]
        moderator: Moderator
        propId: Int
        chainId: Int
        prop_description: String
        prop_starter: String
        charityPercent: Int
        initTS: String
        endTS: String
        topics: [String]
        funds: [Fund]
        irl: Boolean
        yt_link: String
        link: String
        disable: Boolean
        status: DiscourseStatus
        txnHash: String
        discourse: DiscourseDiscourse
        dVotes: [DVote]
    }

    type DVote {
        address: String!
        txnHash: String!
        timestamp: String!
    }

    type DiscourseDiscourse {
        room_id: String
        meet_date: String
        ended: Boolean
        confirmation: [String],
        c_timestamp: String
    }

    type DiscourseStatus {
        disputed: Boolean
        completed: Boolean
        terminated: Boolean
        speakersConfirmation: Int
        withdrawn: [String]
    }

    type Activity {
        walletAddress: String
        twitter_handle: String
        timestamp: String
        discourseId: ID
        propId: Int
        chainId: Int
        title: String
        type: String
        description: String
        value: String 
    }

    input VenueInput {
        name: String
        address: String
        city: String
        state: String
        zip: String
        country: String
    }

    input EventInput {
        discourseId: ID
        propId: Int
        chainId: Int
        eventTimestamp: String
        venue: VenueInput
    }

    type Event {
        discourseId: ID
        propId: Int
        chainId: Int
        eventTimestamp: String
        venue: Venue
    }

    type Venue {
        name: String
        address: String
        city: String
        state: String
        zip: String
        country: String
    }

    type Participant {
        address: String!
        email: String!
        twitter_handle: String
        timestamp: String!
    }

    type Fund {
        address: String
        amount: String
        timestamp: String
        txnHash: String
    }

    type Speaker {
        name: String
        username: String
        address: String
        confirmed: Boolean
        isTwitterHandle: Boolean
        image_url: String
    }

    type Moderator {
        name: String
        username: String
        image_url: String
    }

    # Lens implementations

    type DaoUser {
        id: ID!
        walletAddress: String
        nonce: String
        lastLogin: String
        lensProfileConnected: Boolean
        lensProfile_id: Int
    }

    type DaoNonce {
        nonce: String!
        newUser: Boolean!
    }

    type DaoSigVerify {
        verified: Boolean!
        token: String
        walletAddress: String
        lensProfileConnected: Boolean
        lensProfile_id: Int
    }

    input DaoPostInput {
        daoId: String!
        daoName: String!
        body: String!
        images: [String]
        pub_id_pointed: Int
        profile_id_pointed: Int
        pub_id: Int
        profile_id: Int
        topics: [String]
    }

    type DaoPost {
        id: ID!
        daoId: String
        daoName: String
        pub_id_pointed: Int
        profile_id_pointed: Int
        pub_id: Int
        profile_id: Int
        walletAddress: String
        body: String
        images: [String]
        timestamp: String
        upVotes: [Vote]
        downVotes: [Vote]
        topics: [String]
        isPoll: Boolean
        pollOptions: [PollOption]
        pollVotes: [PollVote]
    }

    type PollOption {
        body: String
        index: Int
    }

    type PollVote {
        walletAddress: String
        timestamp: String
        optionIndex: Int
    }

    type Vote {
        walletAddress: String
        timestamp: String
    }

    type DaoPostComment {
        id: ID!
        postId: ID!
        pub_id_pointed: Int
        profile_id_pointed: Int
        body: String
        timestamp: String
        walletAddress: String
        pub_id: Int
        profile_id: Int
    }

    input DaoInput {
        daoName: String!
        daoAddress: String!
        governorAddress: String!
        daoDescription: String!
        daoOverview: String!
        daoPurpose: String!
        daoLinks: [DaoLinkInput]
        daoImg: String!
        daoCoverImg: String!
        feeFollow: Boolean
        quorumPercentage: Int
        votingPeriod: Int
        minimumDelay: Int
        daoType: String!
        profile_id: Int
        forum_pub_id: Int
        followCost: Int
        followCurrency: String
        followNFTAddress: String
        
    }

    input DaoLinkInput {
        link: String
        platform: String
    }

    type Dao {
        id: ID!
        daoName: String!
        daoAddress: String!
        governorAddress: String!
        profile_id: Int
        forum_pub_id: Int
        daoOverview: String
        daoDescription: String
        daoPurpose: String
        daoLinks: [
            DaoLinks
        ]
        daoType: String
        daoImg: String
        daoCoverImg: String
        feeFollow: Boolean
        quorumPercentage: Int
        votingPeriod: Int
        minimumDelay: Int
        members: [DaoMember]
        followCost: Int
        followCurrency: String
        followNFTAddress: String
        creator: String
    }

    type DaoLinks {
        platform: String
        link: String
    }

    type DaoMember {
        walletAddress: String
        joiningDate: String
        tokenId: Int
    }

    type TwitterLink {
        twitter_handle: String
        address: String
        connected: Boolean
    }

    input SlotInput {
        propId: Int
        chainId: Int
        slots: [SlotsInput]
    }

    input SlotsInput {
        timestamp: String
        accepted: Boolean
    }

    type Slot {
        id: ID
        propId: Int
        chainId: Int
        proposed: Boolean
        proposer: SlotProposer
        slots: [Slots]
    }

    type Slots {
        timestamp: String
        accepted: Boolean
    }

    type SlotProposer {
        address: String
        timestamp: String
    }

    type MeetToken {
        token: String
        eat: String
        iat: String
    }

    type Stream {
        id: ID!
        propId: Int
        chainId: Int
        name: String
        streamId: String
        streamKey: String
        playbackId: String
        createdAt: String
        streamCreated: Boolean
    }

    type AdBalance {
        aurora: String
        polygon: String
        rinkeby: String
        mumbai: String
    }

    type AdStatus {
        polygon_block: String
        aurora_block: String
        rinkeby_block: String
        mumbai_block: String
        polygon_count: String
        aurora_count: String
        rinkeby_count: String
        mumbai_count: String
    }

    type Session {
        id: String
        recordingStatus: String
        recordingUrl: String
        createdAt: String
    }


    type Query {
        ping: String!
        serverVersion: String!
        findUserName(username: String!): Username!
        findEmail(email: String!): Email!
        getUserData: UserData!
        getPost(postId: ID!): Post!
        getPosts: [Post]!
        getSelfPosts: [Post]!
        getUserPosts(username: String!): [Post]!
        checkAuth: Auth!
        getLinkMeta(url: String!): LinkMeta!
        getUserProfile(username: String!): UserData!
        
        getNonce(walletAddress: String!): Nonce
        getUserWallet : WalletUser!

        getDiscourse(propId: Int!, chainId: Int!): Discourse!
        getDiscourses: [Discourse]!
        getDiscoursesByChainID(chainId: [Int]!): [Discourse]!
        getDiscourseById(id: ID!): Discourse!

        getDaoNonce(walletAddress: String!): DaoNonce!

        getDaoPosts: [DaoPost]
        getDaoPostsOnly(daoId: ID!) : [DaoPost]
        
        getDaos: [Dao]!
        getDao(daoId: ID!): Dao!

        checkTwitterLink(twitterHandle: String!): TwitterLink!

        getDiscourseFromAdmin(id: Int!): String

        getSlot(propId: Int!, chainId: Int!): Slot!
        getSlotById(id: ID!): Slot!

        getMeetToken(id: ID!): MeetToken!

        checkEnv: Boolean!
        checkAS: AdStatus
        checkAdminBalance: AdBalance
        getENVState: String
        getSessions(id: ID!): [Session]

        getUserActivity: [Activity]
        checkTitle(title: String!): Boolean
        getEvent(propId: Int!, chainId: Int!): Event
    }

    type Mutation {
        register(registerInput: RegisterInput): User!
        login(username: String!, password: String!): User!
        createUserData(userDataInput: UserDataInput): UserData!
        refreshToken: Auth!

        updateUserName(name: String!): UserData!
        updateUsername(name: String!, username: String!): UserData!
        updateUserBio(bio: String!): UserData!
        updateUserImgUrl(img_url: String!): UserData!
        updateUserWebUrl(web_url: String!): UserData!
        updateUserCoverImgUrl(cover_img_url: String!): UserData!
        updateUserFollowers(newfollower: String!): UserData!
        updateUserFollowing(newfollowing: String!): UserData!
        updateUserWalletAddress(walletAddress: String!): UserData!

        followProfile(username: String!): UserData!
        followOnchain(username: String!, tokenId: Int!): UserData!

        createPost(postInput: PostInput!): Post!
        createNFTPost(nftPostInput: NFTPostInput!): Post!
        likePost(postId: ID!): Post!
        commentPost(postId: ID!, commentBody: String!): Post!
        commentOnchain(postId: ID!, commentBody: String!, pubId: Int!, contentURI: String, profileIdPointed: Int!, pubIdPointed: Int!): Post!
        likeComment(postId: ID!, commentIndex: Int!): Post!
        deleteCommentPost(postId: ID!, commentIndex: Int!): Post!
        deletePost(postId: ID!): Post!

        mirrorPost(postId: ID!, pub_id: Int!): Post!

        verifySignature(signature: String!, walletAddress: String!): WalletUser!

        profileOnchain(lensProfileInput: LensProfileInput!): UserData!
        postOnchain(lensPubInput: LensPubInput!): Post!

        verifySignatureDao(signature: String!, walletAddress: String!): DaoSigVerify!

        createDaoPost(daoPostInput: DaoPostInput!): DaoPost!
        createDao(daoInput: DaoInput!): Dao!
        joinDao(daoId: ID!, tokenId: Int!): Dao!
        profileMinted(profile_id: Int!): DaoUser!

        createDiscourse(discourseInput: DiscourseInput!): Discourse!
        updateFunding(propId: Int!, chainId: Int!, amount: String!, txn: String!): Discourse!
        participate(id : ID!, email: String!): Discourse!
        linkTwitter(twitterHandle: String!, twitter_name: String!, image_url: String!): TwitterLink!
        setWalletAddress(propId: Int!, chainId: Int): Discourse!
        speakerConfirmation(propId: Int!, chainId: Int!) : Discourse!

        proposeSlot(slotInput: SlotInput!): Slot!
        acceptSlot(slotInput: SlotInput!): Slot!

        endMeet(propId: Int!, chainId: Int!) : String!
        fundWithdrawn(propId: Int!, chainId: Int!) : String!
        terminateDiscourse(propId: Int!, chainId: Int!) : String!
        enterDiscourse(propId: Int!, chainId: Int!) : String!
        disputed(propId: Int!, chainId: Int!, txnHash: String!) : Int!
        
        check(id: ID!): String
        stopRec(id: ID!): Boolean

        # Event mutations
        createEvent(eventInput: EventInput!): Event
    }
`