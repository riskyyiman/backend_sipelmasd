const Pengaduan = require('../models/Pengaduan');
const { sanitizeInput } = require('../../utils/sanitize');

const resolvers = {
  Query: {
    // ✅ Get semua pengaduan
    daftarPengaduan: async () => {
      try {
        return await Pengaduan.find().sort({ tanggal: -1 });
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // ✅ Get pengaduan berdasarkan ID
    pengaduanById: async (_, { id }) => {
      try {
        return await Pengaduan.findById(id);
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // ✅ Get pengaduan dengan pagination + search + filter status
    pengaduanList: async (_, { page, perPage, search = '', filter = '' }) => {
      try {
        const skip = (page - 1) * perPage;

        let query = {};
        if (search) {
          query.judul = { $regex: search, $options: 'i' };
        }
        if (filter) {
          query.status = filter;
        }

        const items = await Pengaduan.find(query).sort({ tanggal: -1 }).skip(skip).limit(perPage);
        const total = await Pengaduan.countDocuments(query);

        return { items, total };
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // ✅ 🔍 Get pengaduan dengan filter dinamis
    pengaduan: async (_, { filter }) => {
      const query = {};

      if (filter?.status) query.status = filter.status;
      if (filter?.kategori) query.kategori = filter.kategori;
      if (filter?.lokasi) {
        query.lokasi = { $regex: filter.lokasi, $options: 'i' };
      }

      if (filter?.keyword) {
        query.$or = [{ judul: { $regex: filter.keyword, $options: 'i' } }, { deskripsi: { $regex: filter.keyword, $options: 'i' } }];
      }

      return await Pengaduan.find(query).sort({ tanggal: -1 });
    },
  },

  Mutation: {
    // ✅ Tambah pengaduan
    tambahPengaduan: async (_, { judul, kategori, lokasi, deskripsi }, { user }) => {
      // Validasi autentikasi
      if (!user || !user.id) throw new Error('Anda harus login terlebih dahulu');

      try {
        // Sanitasi input pengguna
        const newPengaduan = new Pengaduan({
          judul: sanitizeInput(judul),
          kategori: sanitizeInput(kategori),
          lokasi: sanitizeInput(lokasi),
          deskripsi: sanitizeInput(deskripsi),
          tanggal: new Date().toISOString(),
          status: 'diterima',
          userId: user.id,
        });

        return await newPengaduan.save();
      } catch (err) {
        throw new Error('Gagal menyimpan pengaduan: ' + err.message);
      }
    },

    // ✅ Update pengaduan
    updatePengaduan: async (_, { id, judul, kategori, lokasi, deskripsi, status }) => {
      try {
        const updated = await Pengaduan.findByIdAndUpdate(id, { judul, kategori, lokasi, deskripsi, status }, { new: true });
        return updated;
      } catch (err) {
        throw new Error('Gagal memperbarui pengaduan: ' + err.message);
      }
    },

    // ✅ Hapus pengaduan
    hapusPengaduan: async (_, { id }) => {
      try {
        await Pengaduan.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
};

module.exports = resolvers;
