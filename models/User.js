const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'petugas'], required: true },
});

module.exports = mongoose.model('User', userSchema);
