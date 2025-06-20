const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const admin = require('../firebaseAdmin'); // ← Import admin SDK

// 🔐 POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validasi input
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, dan role wajib diisi' });
  }

  // Role hanya boleh admin atau petugas
  if (!['admin', 'petugas'].includes(role)) {
    return res.status(400).json({ message: 'Role harus admin atau petugas' });
  }

  try {
    // Cek apakah user sudah ada
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await newUser.save();

    // Buat JWT token
    const token = jwt.sign({ id: savedUser._id, role: savedUser.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Kirim response
    res.status(201).json({
      token,
      user: {
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('Received data:', req.body); // Log data masuk
  const { email, password } = req.body;

  console.log('LOGIN attempt:', { email, password }); // Tambahkan ini

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password salah' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
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

module.exports = router;
