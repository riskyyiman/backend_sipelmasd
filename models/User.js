const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: false, // ⬅️ ubah dari `true` ke `false` agar opsional
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'petugas', 'user'],
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
