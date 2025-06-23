const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const admin = require('../firebaseAdmin'); // ← Import admin SDK

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  const name = `${firstName} ${lastName}`;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, 'RAHASIA', {
      expiresIn: '1d',
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat registrasi' });
  }
});

// 🔐 POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('Received data:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint untuk hitung jumlah user
router.get('/user-count', async (req, res) => {
  try {
    let userCount = 0;
    let nextPageToken;

    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      userCount += result.users.length;
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    res.json({ totalUsers: userCount });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ Ambil semua user dari MongoDB
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

// GET /api/users → ambil semua user
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // tidak tampilkan password
    res.json(users);
  } catch (err) {
    console.error('Gagal mengambil data user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users → tambah user
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User sudah ada' });

    const newUser = new User({ name, email, password, role });
    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Gagal menambah user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:id → update user
router.put('/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('Gagal update user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/:id → hapus user
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User dihapus' });
  } catch (err) {
    console.error('Gagal hapus user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/users firebase
router.get('/users', async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      provider: user.providerData[0]?.providerId,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
    }));
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
