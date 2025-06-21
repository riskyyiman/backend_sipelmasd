const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ✅ GET semua user (tanpa password)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    console.error('Gagal mengambil data user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST - Tambah user baru
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  try {
    // Cek user sudah ada
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User dengan email ini sudah ada' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru
    const newUser = new User({ name, email, password: hashedPassword, role });
    const savedUser = await newUser.save();

    res.status(201).json({
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
    });
  } catch (err) {
    console.error('Gagal menambahkan user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ PUT - Update user
router.put('/:id', async (req, res) => {
  const { name, email, role, password } = req.body;

  try {
    const updateData = { name, email, role };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (err) {
    console.error('Gagal mengupdate user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ DELETE - Hapus user
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    console.error('Gagal menghapus user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
