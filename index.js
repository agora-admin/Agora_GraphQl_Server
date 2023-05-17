const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
const { merge } = require("lodash");

const typeDefs = require("./graphql/typeDefs");
const userResolvers = require("./graphql/resolvers/users");
const systemResolvers = require("./graphql/resolvers/system");
const userDataResolvers = require("./graphql/resolvers/userData");
const postResolvers = require("./graphql/resolvers/post");
const walletResolvers = require("./graphql/resolvers/wallet");
const discourseResolvers = require("./graphql/resolvers/discourse");
const discourseSlotResolvers = require("./graphql/resolvers/slot");
const eventResolvers = require("./graphql/resolvers/events");

const daoWalletResolvers = require("./graphql/resolvers/daoWallet");
const daoPostResolvers = require("./graphql/resolvers/daoPost");
const daoResolvers = require("./graphql/resolvers/dao");
const streamResolvers = require("./graphql/resolvers/stream");

const meetResolvers = require("./graphql/resolvers/meet");
require('dotenv').config();


const MONGODB = process.env.MONGODB;

const PORT = process.env.PORT || 80;
const HOST = "0.0.0.0";

const server = new ApolloServer({
  typeDefs,
  resolvers: merge(
    userResolvers,
    systemResolvers,
    userDataResolvers,
    postResolvers,
    walletResolvers,
    discourseResolvers,
    discourseSlotResolvers,
    eventResolvers,
    daoWalletResolvers,
    daoPostResolvers,
    daoResolvers,
    meetResolvers,
    streamResolvers
  ),
  context: ({ req, res }) => {
    // console.log(req.headers.authorization);
    // const token = req.headers.authorization || "";
    return {
      req: req,
      res: res,
    };
  },
  cors: {
    credentials: true,
    origin: process.env.NODE_ENV === "development"? 
    ["http://localhost:3000", "https://studio.apollographql.com"] 
    : 
    ['https://agorasquare.xyz', 'https://www.agorasquare.xyz','https://discourses.agorasquare.xyz', 'https://testnet.discourses.agorasquare.xyz'],
  },
  introspection: process.env.NODE_ENV === "development" ? true : false,
});

const GetAccessToken = function (request) {
  const token = request.headers.authorization || "";
  return token;
};

mongoose
  .connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to MongoDB");
    mongoose.set("debug", process.env.NODE_ENV === "development");
    return server.listen({ port: PORT, host: HOST });
  })
  .then((res) => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  })
  .catch((err) => {
    console.log(err);
  });
