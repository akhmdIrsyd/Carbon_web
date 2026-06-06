const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

function calculateSeverity(amount) {
  if (amount <= 100) return 'Aman';
  if (amount <= 300) return 'Waspada';
  if (amount <= 500) return 'Siaga';
  if (amount <= 700) return 'Berbahaya';
  return 'Sangat Berbahaya';
}

router.get('/', async (req, res) => {
  try {
    const { region_id } = req.query;
    let query = `
      SELECT c.*, r.name AS region_name, r.latitude, r.longitude
      FROM carbon_records c
      JOIN regions r ON c.region_id = r.id
    `;
    const params = [];
    if (region_id) {
      query += ' WHERE c.region_id = ?';
      params.push(region_id);
    }
    query += ' ORDER BY c.recorded_at DESC, c.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/report/data', async (req, res) => {
  try {
    const { region_id, month_start, month_end } = req.query;
    let query = `
      SELECT c.*, r.name AS region_name
      FROM carbon_records c
      JOIN regions r ON c.region_id = r.id
    `;
    const conditions = [];
    const params = [];
    if (region_id) {
      conditions.push('c.region_id = ?');
      params.push(region_id);
    }
    if (month_start && month_end) {
      const lastDay = `${month_end}-${new Date(parseInt(month_end.split('-')[0]), parseInt(month_end.split('-')[1]), 0).getDate()}`;
      conditions.push('c.recorded_at BETWEEN ? AND ?');
      params.push(month_start + '-01', lastDay);
    } else if (month_start) {
      conditions.push('c.recorded_at >= ?');
      params.push(month_start + '-01');
    } else if (month_end) {
      const lastDay = `${month_end}-${new Date(parseInt(month_end.split('-')[0]), parseInt(month_end.split('-')[1]), 0).getDate()}`;
      conditions.push('c.recorded_at <= ?');
      params.push(lastDay);
    }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY c.recorded_at ASC, c.created_at ASC';

    const [rows] = await pool.query(query, params);

    const totalRecords = rows.length;
    const totalCarbon = rows.reduce((s, r) => s + Number(r.carbon_amount), 0);
    const avgCarbon = totalRecords > 0 ? totalCarbon / totalRecords : 0;
    const amounts = rows.map((r) => Number(r.carbon_amount));
    const maxCarbon = amounts.length > 0 ? Math.max(...amounts) : 0;
    const minCarbon = amounts.length > 0 ? Math.min(...amounts) : 0;

    const formatMonth = (m) => {
      if (!m) return 'Semua';
      const [y, mo] = m.split('-');
      const names = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${names[parseInt(mo)]} ${y}`;
    };

    res.json({
      region_id: region_id ? Number(region_id) : null,
      region_name: rows[0]?.region_name || '',
      month_start: month_start || '',
      month_end: month_end || '',
      month_start_label: formatMonth(month_start),
      month_end_label: formatMonth(month_end),
      summary: { totalRecords, totalCarbon: totalCarbon.toFixed(2), avgCarbon: avgCarbon.toFixed(2), maxCarbon, minCarbon },
      records: rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, r.name AS region_name FROM carbon_records c
       JOIN regions r ON c.region_id = r.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { region_id, carbon_amount, recorded_at, notes } = req.body;
    if (!region_id || carbon_amount == null) {
      return res.status(400).json({ message: 'region_id and carbon_amount required' });
    }
    const [region] = await pool.query('SELECT id FROM regions WHERE id = ?', [region_id]);
    if (region.length === 0) {
      return res.status(404).json({ message: 'Region not found' });
    }
    const severity = calculateSeverity(Number(carbon_amount));
    const date = recorded_at || new Date().toISOString().split('T')[0];
    const [result] = await pool.query(
      'INSERT INTO carbon_records (region_id, carbon_amount, severity, recorded_at, notes) VALUES (?, ?, ?, ?, ?)',
      [region_id, carbon_amount, severity, date, notes || '']
    );
    const [created] = await pool.query(
      `SELECT c.*, r.name AS region_name FROM carbon_records c
       JOIN regions r ON c.region_id = r.id WHERE c.id = ?`,
      [result.insertId]
    );
    res.status(201).json(created[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { carbon_amount, recorded_at, notes } = req.body;
    const [existing] = await pool.query('SELECT * FROM carbon_records WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Record not found' });
    const amount = carbon_amount != null ? carbon_amount : existing[0].carbon_amount;
    const severity = calculateSeverity(Number(amount));
    await pool.query(
      'UPDATE carbon_records SET carbon_amount = ?, severity = ?, recorded_at = ?, notes = ? WHERE id = ?',
      [
        amount,
        severity,
        recorded_at || existing[0].recorded_at,
        notes != null ? notes : existing[0].notes,
        req.params.id,
      ]
    );
    const [updated] = await pool.query(
      `SELECT c.*, r.name AS region_name FROM carbon_records c
       JOIN regions r ON c.region_id = r.id WHERE c.id = ?`,
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM carbon_records WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Record not found' });
    await pool.query('DELETE FROM carbon_records WHERE id = ?', [req.params.id]);
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
