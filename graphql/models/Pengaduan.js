const mongoose = require('mongoose');

const pengaduanSchema = new mongoose.Schema({
  judul: String,
  kategori: String,
  lokasi: String,
  deskripsi: String,
  tanggal: String,
  status: {
    type: String,
    enum: ['diterima', 'diproses', 'selesai'],
    default: 'diterima',
  },
  userId: {
    type: String, // HARUS String karena dari Firebase UID
    required: true,
  },
});

module.exports = mongoose.model('Pengaduan', pengaduanSchema);
