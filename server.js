require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schemas/pengaduan.schema');
const resolvers = require('./graphql/resolvers/pengaduan.resolver');
const admin = require('./firebaseAdmin');

const authRoutes = require('./routes/auth');
const pengaduanRoutes = require('./routes/pengaduan');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

// REST routes
app.use('/api/auth', authRoutes);
app.use('/api/pengaduan', pengaduanRoutes);
app.use('/api/users', userRoutes);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

// Apollo Server
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.split(' ')[1];

      if (token) {
        try {
          const decoded = await admin.auth().verifyIdToken(token);
          return { user: { id: decoded.uid } };
        } catch (err) {
          console.error('Token tidak valid:', err.message);
        }
      }

      return { user: null };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startApolloServer().catch((err) => console.error('Apollo error:', err));
