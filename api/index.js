// api/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const dotenv = require('dotenv');
const typeDefs = require('../graphql/schemas/pengaduan.schema');
const resolvers = require('../graphql/resolvers/pengaduan.resolver');
const admin = require('../firebaseAdmin');

const authRoutes = require('../routes/auth');
const pengaduanRoutes = require('../routes/pengaduan');
const userRoutes = require('../routes/users');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pengaduan', pengaduanRoutes);
app.use('/api/users', userRoutes);

// MongoDB connect
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('✅ MongoDB Connected');
}

// Apollo setup
async function setupApolloServer() {
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
          console.error('❌ Invalid token:', err.message);
        }
      }
      return { user: null };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/api/graphql' });
}

(async () => {
  await connectToDatabase();
  await setupApolloServer();

  // ✅ Jalankan server hanya di lokal (bukan di Vercel)
  if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📡 GraphQL: http://localhost:${PORT}/api/graphql`);
    });
  }
})();

// Tambahkan sebelum module.exports = app;
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is working ✅', uptime: process.uptime() });
});

// Untuk Vercel
module.exports = app;
