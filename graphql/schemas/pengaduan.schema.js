const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Pengaduan {
    id: ID!
    judul: String!
    kategori: String
    lokasi: String
    deskripsi: String!
    tanggal: String!
    status: String!
    userId: String!
  }

  type PengaduanListResult {
    items: [Pengaduan]
    total: Int
  }

  type Query {
    daftarPengaduan: [Pengaduan]
    pengaduanById(id: ID!): Pengaduan
    pengaduanList(page: Int!, perPage: Int!, search: String, filter: String): PengaduanListResult
  }

  type Mutation {
    hapusPengaduan(id: ID!): Boolean
    tambahPengaduan(judul: String!, kategori: String, lokasi: String, deskripsi: String!): Pengaduan
    updatePengaduan(id: ID!, judul: String!, kategori: String!, lokasi: String, deskripsi: String!, status: String!): Pengaduan

    # ✅ Tambahan baru
    ubahStatusPengaduan(id: ID!, status: String!): Pengaduan
  }
`;

module.exports = typeDefs;
