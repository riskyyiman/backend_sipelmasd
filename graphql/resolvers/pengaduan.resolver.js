const Pengaduan = require('../models/Pengaduan');

const resolvers = {
  Query: {
    daftarPengaduan: async () => {
      try {
        return await Pengaduan.find().sort({ tanggal: -1 });
      } catch (err) {
        throw new Error(err.message);
      }
    },

    pengaduanById: async (_, { id }) => {
      try {
        return await Pengaduan.findById(id);
      } catch (err) {
        throw new Error(err.message);
      }
    },

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
  },

  Mutation: {
    hapusPengaduan: async (_, { id }) => {
      try {
        await Pengaduan.findByIdAndDelete(id);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    updatePengaduan: async (_, { id, judul, kategori, lokasi, deskripsi, status }, context) => {
      try {
        const updated = await Pengaduan.findByIdAndUpdate(id, { judul, kategori, lokasi, deskripsi, status }, { new: true });
        return updated;
      } catch (err) {
        throw new Error('Gagal memperbarui pengaduan: ' + err.message);
      }
    },

    tambahPengaduan: async (_, { judul, kategori, lokasi, deskripsi }, { user }) => {
      if (!user || !user.id) throw new Error('Anda harus login terlebih dahulu');

      try {
        const newPengaduan = new Pengaduan({
          judul,
          kategori,
          lokasi,
          deskripsi,
          tanggal: new Date().toISOString(),
          status: 'diterima',
          userId: user.id,
        });

        return await newPengaduan.save();
      } catch (err) {
        throw new Error('Gagal menyimpan pengaduan: ' + err.message);
      }
    },
  },
};
module.exports = resolvers;
