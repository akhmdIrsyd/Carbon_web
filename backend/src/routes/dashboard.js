const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    const [[{ totalregions: totalRegions }]] = await pool.query('SELECT COUNT(*) AS totalregions FROM regions');
    const [[{ totalrecords: totalRecords }]] = await pool.query('SELECT COUNT(*) AS totalrecords FROM carbon_records');
    const [[{ totalcarbon: totalCarbon }]] = await pool.query('SELECT COALESCE(SUM(carbon_amount), 0) AS totalcarbon FROM carbon_records');
    const [[{ avgcarbon: avgCarbon }]] = await pool.query('SELECT COALESCE(AVG(carbon_amount), 0) AS avgcarbon FROM carbon_records');
    const [[{ monthrecords: monthRecords }]] = await pool.query(
      'SELECT COUNT(*) AS monthrecords FROM carbon_records WHERE recorded_at BETWEEN ? AND ?',
      [firstDay, lastDay]
    );
    const [[{ monthcarbon: monthCarbon }]] = await pool.query(
      'SELECT COALESCE(SUM(carbon_amount), 0) AS monthcarbon FROM carbon_records WHERE recorded_at BETWEEN ? AND ?',
      [firstDay, lastDay]
    );

    const [severityCounts] = await pool.query(
      `SELECT severity, COUNT(*) AS count, COALESCE(SUM(total_carbon), 0) AS total
       FROM (
         SELECT r.id,
           CASE
             WHEN COALESCE(SUM(c.carbon_amount), 0) <= 100 THEN 'Aman'
             WHEN COALESCE(SUM(c.carbon_amount), 0) <= 300 THEN 'Waspada'
             WHEN COALESCE(SUM(c.carbon_amount), 0) <= 500 THEN 'Siaga'
             WHEN COALESCE(SUM(c.carbon_amount), 0) <= 700 THEN 'Berbahaya'
             ELSE 'Sangat Berbahaya'
           END AS severity,
           COALESCE(SUM(c.carbon_amount), 0) AS total_carbon
         FROM regions r
         LEFT JOIN carbon_records c ON r.id = c.region_id AND c.recorded_at BETWEEN ? AND ?
         GROUP BY r.id
       ) sub
       GROUP BY severity
        ORDER BY CASE severity WHEN 'Aman' THEN 1 WHEN 'Waspada' THEN 2 WHEN 'Siaga' THEN 3 WHEN 'Berbahaya' THEN 4 ELSE 5 END`,
      [firstDay, lastDay]
    );

    const [recentRecords] = await pool.query(
      `SELECT c.*, r.name AS region_name, r.latitude, r.longitude
       FROM carbon_records c JOIN regions r ON c.region_id = r.id
       ORDER BY c.created_at DESC LIMIT 10`
    );

    const [regionSummary] = await pool.query(
      `SELECT r.id, r.name, r.latitude, r.longitude,
              COALESCE(SUM(c.carbon_amount), 0) AS total_carbon,
              COUNT(c.id) AS record_count,
              CASE
                WHEN COALESCE(SUM(c.carbon_amount), 0) <= 100 THEN 'Aman'
                WHEN COALESCE(SUM(c.carbon_amount), 0) <= 300 THEN 'Waspada'
                WHEN COALESCE(SUM(c.carbon_amount), 0) <= 500 THEN 'Siaga'
                WHEN COALESCE(SUM(c.carbon_amount), 0) <= 700 THEN 'Berbahaya'
                ELSE 'Sangat Berbahaya'
              END AS latest_severity
       FROM regions r LEFT JOIN carbon_records c ON r.id = c.region_id
       GROUP BY r.id ORDER BY total_carbon DESC`
    );

    const [monthRegionSummary] = await pool.query(
      `SELECT r.id, r.name, r.latitude, r.longitude,
              COALESCE(SUM(c.carbon_amount), 0) AS total_carbon,
              COUNT(c.id) AS record_count,
              CASE
                WHEN COALESCE(SUM(c.carbon_amount), 0) <= 100 THEN 'Aman'
                WHEN COALESCE(SUM(c.carbon_amount), 0) <= 300 THEN 'Waspada'
                WHEN COALESCE(SUM(c.carbon_amount), 0) <= 500 THEN 'Siaga'
                WHEN COALESCE(SUM(c.carbon_amount), 0) <= 700 THEN 'Berbahaya'
                ELSE 'Sangat Berbahaya'
              END AS latest_severity
       FROM regions r LEFT JOIN carbon_records c ON r.id = c.region_id AND c.recorded_at BETWEEN ? AND ?
       GROUP BY r.id ORDER BY total_carbon DESC`,
      [firstDay, lastDay]
    );

    const [trendData] = await pool.query(
      `SELECT recorded_at::DATE AS date, COALESCE(SUM(carbon_amount), 0) AS total
       FROM carbon_records
       GROUP BY recorded_at::DATE
       ORDER BY date ASC LIMIT 30`
    );

    res.json({
      totalRegions,
      totalRecords,
      totalCarbon: Number(totalCarbon).toFixed(2),
      avgCarbon: Number(avgCarbon).toFixed(2),
      monthRecords,
      monthCarbon: Number(monthCarbon).toFixed(2),
      severityCounts: severityCounts.map(s => ({ ...s, count: Number(s.count), total: Number(s.total) })),
      recentRecords,
      regionSummary: regionSummary.map(r => ({ ...r, total_carbon: Number(r.total_carbon), record_count: Number(r.record_count) })),
      monthRegionSummary: monthRegionSummary.map(r => ({ ...r, total_carbon: Number(r.total_carbon), record_count: Number(r.record_count) })),
      trendData,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/monthly-history', async (req, res) => {
  try {
    const { region_id } = req.query;
    let query = `
      SELECT TO_CHAR(recorded_at, 'YYYY-MM') AS month,
             COALESCE(SUM(carbon_amount), 0) AS total,
             COUNT(*) AS count,
             COALESCE(AVG(carbon_amount), 0) AS avg
      FROM carbon_records
    `;
    const params = [];
    if (region_id) {
      query += ' WHERE region_id = ?';
      params.push(region_id);
    }
    query += ' GROUP BY TO_CHAR(recorded_at, \'YYYY-MM\') ORDER BY month ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
