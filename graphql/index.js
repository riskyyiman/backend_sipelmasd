// server/graphql/index.js
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./schemas/pengaduan.schema');
const resolvers = require('./resolvers/pengaduan.resolver');
const Pengaduan = require('./models/Pengaduan');

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    // Untuk authentication (jika diperlukan)
    const token = req.headers.authorization || '';
    return { userId: 'user-id-dari-token' }; // Ganti dengan logic auth sesungguhnya
  },
});

module.exports = server;
