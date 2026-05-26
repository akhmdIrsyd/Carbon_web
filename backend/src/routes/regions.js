const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*,
        (SELECT COALESCE(SUM(carbon_amount), 0) FROM carbon_records WHERE region_id = r.id) AS total_carbon,
        (SELECT severity FROM carbon_records WHERE region_id = r.id ORDER BY recorded_at DESC LIMIT 1) AS latest_severity
      FROM regions r ORDER BY r.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM regions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Region not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, latitude, longitude, description } = req.body;
    if (!name || latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Name, latitude, longitude required' });
    }
    const [result] = await pool.query(
      'INSERT INTO regions (name, latitude, longitude, description) VALUES (?, ?, ?, ?)',
      [name, latitude, longitude, description || '']
    );
    const [created] = await pool.query('SELECT * FROM regions WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, latitude, longitude, description } = req.body;
    const [existing] = await pool.query('SELECT * FROM regions WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Region not found' });
    await pool.query(
      'UPDATE regions SET name = ?, latitude = ?, longitude = ?, description = ? WHERE id = ?',
      [
        name || existing[0].name,
        latitude != null ? latitude : existing[0].latitude,
        longitude != null ? longitude : existing[0].longitude,
        description != null ? description : existing[0].description,
        req.params.id,
      ]
    );
    const [updated] = await pool.query('SELECT * FROM regions WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM regions WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Region not found' });
    await pool.query('DELETE FROM regions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Region deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
