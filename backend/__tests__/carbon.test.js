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
const carbonRouter = require('../src/routes/carbon');

const app = express();
app.use(express.json());
app.use('/api/carbon', carbonRouter);

const mockRecord = {
  id: 1,
  region_id: 1,
  carbon_amount: '250.00',
  severity: 'Waspada',
  recorded_at: '2026-06-15T00:00:00.000Z',
  notes: 'Test record',
  created_at: '2026-06-15T07:13:53.052Z',
  region_name: 'Jakarta',
};

describe('Carbon Records API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/carbon', () => {
    it('returns all records', async () => {
      pool.query.mockResolvedValue([[mockRecord], []]);
      const res = await request(app).get('/api/carbon');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].severity).toBe('Waspada');
    });

    it('filters by region_id', async () => {
      pool.query.mockResolvedValue([[mockRecord], []]);
      const res = await request(app).get('/api/carbon?region_id=1');
      expect(res.status).toBe(200);
      expect(pool.query.mock.calls[0][1]).toEqual(['1']);
    });

    it('returns empty array when no records', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app).get('/api/carbon');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/carbon/:id', () => {
    it('returns a record by id', async () => {
      pool.query.mockResolvedValue([[mockRecord], []]);
      const res = await request(app).get('/api/carbon/1');
      expect(res.status).toBe(200);
      expect(res.body.carbon_amount).toBe('250.00');
    });

    it('returns 404 when not found', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app).get('/api/carbon/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/carbon', () => {
    it('creates a record with auto severity', async () => {
      pool.query
        .mockResolvedValueOnce([[{ id: 1 }], []])
        .mockResolvedValueOnce([[{ id: 1 }], []])
        .mockResolvedValueOnce([[mockRecord], []]);

      const res = await request(app)
        .post('/api/carbon')
        .send({ region_id: 1, carbon_amount: 250, recorded_at: '2026-06-15', notes: 'Test' });
      expect(res.status).toBe(201);
      expect(res.body.severity).toBe('Waspada');
    });

    it('returns 400 when fields missing', async () => {
      const res = await request(app)
        .post('/api/carbon')
        .send({ region_id: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/required/i);
    });

    it('returns 404 when region not found', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app)
        .post('/api/carbon')
        .send({ region_id: 999, carbon_amount: 100 });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Region not found');
    });
  });

  describe('PUT /api/carbon/:id', () => {
    it('updates an existing record', async () => {
      pool.query
        .mockResolvedValueOnce([[mockRecord], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[{ ...mockRecord, carbon_amount: '500.00', severity: 'Siaga' }], []]);

      const res = await request(app)
        .put('/api/carbon/1')
        .send({ carbon_amount: 500 });
      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app)
        .put('/api/carbon/999')
        .send({ carbon_amount: 200 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/carbon/:id', () => {
    it('deletes a record', async () => {
      pool.query
        .mockResolvedValueOnce([[mockRecord], []])
        .mockResolvedValueOnce([[], []]);
      const res = await request(app).delete('/api/carbon/1');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Record deleted');
    });

    it('returns 404 when not found', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app).delete('/api/carbon/999');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/carbon/report/data', () => {
    it('returns report data without filters', async () => {
      pool.query.mockResolvedValue([[mockRecord], []]);
      const res = await request(app).get('/api/carbon/report/data');
      expect(res.status).toBe(200);
      expect(res.body.summary.totalRecords).toBe(1);
      expect(res.body.summary.totalCarbon).toBe('250.00');
    });

    it('filters by region_id and month range', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app)
        .get('/api/carbon/report/data?region_id=1&month_start=2026-01&month_end=2026-06');
      expect(res.status).toBe(200);
      expect(res.body.summary.totalRecords).toBe(0);
    });

    it('returns empty summary for no records', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app).get('/api/carbon/report/data');
      expect(res.status).toBe(200);
      expect(res.body.summary.totalCarbon).toBe('0.00');
      expect(res.body.summary.avgCarbon).toBe('0.00');
      expect(res.body.summary.maxCarbon).toBe(0);
      expect(res.body.summary.minCarbon).toBe(0);
    });
  });
});
