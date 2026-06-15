const request = require('supertest');
const express = require('express');

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
}));
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 1, name: 'Test', email: 'test@test.com' };
    next();
  },
  JWT_SECRET: 'test-secret',
}));

const pool = require('../src/config/db');
const dashboardRouter = require('../src/routes/dashboard');

const app = express();
app.use(express.json());
app.use('/api/dashboard', dashboardRouter);

const mockRecord = {
  id: 1,
  region_id: 1,
  carbon_amount: '250.00',
  severity: 'Waspada',
  recorded_at: '2026-06-15T00:00:00.000Z',
  notes: 'Test',
  created_at: '2026-06-15T07:13:53.052Z',
  region_name: 'Jakarta',
  latitude: '-6.2088000',
  longitude: '106.8456000',
};

describe('Dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/stats', () => {
    it('returns complete dashboard payload', async () => {
      pool.query
        .mockResolvedValueOnce([[{ totalregions: '2' }], []])
        .mockResolvedValueOnce([[{ totalrecords: '5' }], []])
        .mockResolvedValueOnce([[{ totalcarbon: '1250.00' }], []])
        .mockResolvedValueOnce([[{ avgcarbon: '250.00' }], []])
        .mockResolvedValueOnce([[{ monthrecords: '3' }], []])
        .mockResolvedValueOnce([[{ monthcarbon: '750.00' }], []])
        .mockResolvedValueOnce([[{ severity: 'Waspada', count: '2', total: '500.00' }], []])
        .mockResolvedValueOnce([[mockRecord], []])
        .mockResolvedValueOnce([[{ id: 1, name: 'Jakarta', total_carbon: '1250.00', record_count: '5', latest_severity: 'Waspada' }], []])
        .mockResolvedValueOnce([[{ id: 1, name: 'Jakarta', total_carbon: '750.00', record_count: '3', latest_severity: 'Waspada' }], []])
        .mockResolvedValueOnce([[{ date: '2026-06-15', total: '250.00' }], []]);

      const res = await request(app).get('/api/dashboard/stats');
      expect(res.status).toBe(200);
      expect(res.body.totalRegions).toBe('2');
      expect(res.body.totalRecords).toBe('5');
      expect(res.body.totalCarbon).toBe('1250.00');
      expect(res.body.avgCarbon).toBe('250.00');
      expect(res.body.monthRecords).toBe('3');
      expect(res.body.monthCarbon).toBe('750.00');
      expect(res.body.severityCounts).toEqual([{ severity: 'Waspada', count: 2, total: 500 }]);
      expect(res.body.recentRecords).toHaveLength(1);
      expect(res.body.regionSummary).toHaveLength(1);
      expect(res.body.monthRegionSummary).toHaveLength(1);
      expect(res.body.trendData).toHaveLength(1);
    });

    it('handles zero records gracefully', async () => {
      pool.query
        .mockResolvedValueOnce([[{ totalregions: '0' }], []])
        .mockResolvedValueOnce([[{ totalrecords: '0' }], []])
        .mockResolvedValueOnce([[{ totalcarbon: '0' }], []])
        .mockResolvedValueOnce([[{ avgcarbon: '0' }], []])
        .mockResolvedValueOnce([[{ monthrecords: '0' }], []])
        .mockResolvedValueOnce([[{ monthcarbon: '0' }], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[], []]);

      const res = await request(app).get('/api/dashboard/stats');
      expect(res.status).toBe(200);
      expect(res.body.totalRegions).toBe('0');
      expect(res.body.totalCarbon).toBe('0.00');
      expect(res.body.severityCounts).toEqual([]);
    });

    it('handles database errors', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/dashboard/stats');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('GET /api/dashboard/monthly-history', () => {
    it('returns monthly history', async () => {
      pool.query.mockResolvedValueOnce([
        [{ month: '2026-06', total: '250.00', count: '1', avg: '250.00' }],
        [],
      ]);
      const res = await request(app).get('/api/dashboard/monthly-history');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].month).toBe('2026-06');
    });

    it('filters by region_id', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app).get('/api/dashboard/monthly-history?region_id=1');
      expect(res.status).toBe(200);
      expect(pool.query.mock.calls[0][1]).toEqual(['1']);
    });

    it('returns empty array when no data', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app).get('/api/dashboard/monthly-history');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('handles database errors', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/dashboard/monthly-history');
      expect(res.status).toBe(500);
    });
  });

  describe('dates computation', () => {
    it('computes correct firstDay/lastDay for current month', async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const expectedFirst = `${year}-${String(month).padStart(2, '0')}-01`;
      const expectedLast = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

      pool.query
        .mockResolvedValueOnce([[{ totalregions: '0' }], []])
        .mockResolvedValueOnce([[{ totalrecords: '0' }], []])
        .mockResolvedValueOnce([[{ totalcarbon: '0' }], []])
        .mockResolvedValueOnce([[{ avgcarbon: '0' }], []])
        .mockResolvedValueOnce([[{ monthrecords: '0' }], []])
        .mockResolvedValueOnce([[{ monthcarbon: '0' }], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[], []]);

      await request(app).get('/api/dashboard/stats');

      const calls = pool.query.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(5);
      const betweenCall = calls.find(c =>
        c[0] && c[0].includes('BETWEEN') && c[0].includes('monthrecords')
      );
      expect(betweenCall).toBeDefined();
      expect(betweenCall[1]).toEqual([expectedFirst, expectedLast]);
    });
  });
});
