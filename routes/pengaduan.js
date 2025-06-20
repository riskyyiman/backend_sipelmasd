const express = require('express');
const router = express.Router();
const Pengaduan = require('../graphql/models/Pengaduan');

// CREATE
router.post('/', async (req, res) => {
  try {
    const data = await Pengaduan.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const data = await Pengaduan.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// In your backend route for GET /:id
router.get('/:id', async (req, res) => {
  try {
    const data = await Pengaduan.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json({
      pengaduanById: data, // Wrap in the expected GraphQL response structure
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// In your PUT /:id route
router.put('/:id', async (req, res) => {
  try {
    const { judul, kategori, lokasi, deskripsi, status } = req.body;
    const updated = await Pengaduan.findByIdAndUpdate(req.params.id, { judul, kategori, lokasi, deskripsi, status }, { new: true });
    res.json({
      updatePengaduan: updated, // Wrap in expected GraphQL response
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const data = await Pengaduan.findById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Pengaduan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Pengaduan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
