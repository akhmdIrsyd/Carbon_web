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
const regionsRouter = require('../src/routes/regions');

const app = express();
app.use(express.json());
app.use('/api/regions', regionsRouter);

const mockRegion = {
  id: 1,
  name: 'Jakarta',
  latitude: '-6.2088000',
  longitude: '106.8456000',
  description: '',
  created_at: '2026-06-15T07:13:35.711Z',
  updated_at: '2026-06-15T07:13:35.711Z',
};

const mockRegionWithCarbon = {
  ...mockRegion,
  total_carbon: '250.00',
  latest_severity: 'Waspada',
};

describe('Regions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/regions', () => {
    it('returns all regions with carbon stats', async () => {
      pool.query.mockResolvedValue([[mockRegionWithCarbon], []]);
      const res = await request(app).get('/api/regions');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Jakarta');
      expect(res.body[0].total_carbon).toBe('250.00');
    });

    it('returns empty array when no regions', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app).get('/api/regions');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('handles database errors', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/regions');
      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('GET /api/regions/:id', () => {
    it('returns a region by id', async () => {
      pool.query.mockResolvedValue([[mockRegion], []]);
      const res = await request(app).get('/api/regions/1');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Jakarta');
    });

    it('returns 404 when region not found', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app).get('/api/regions/999');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Region not found');
    });
  });

  describe('POST /api/regions', () => {
    it('creates a new region', async () => {
      pool.query
        .mockResolvedValueOnce([[{ id: 1 }], []])
        .mockResolvedValueOnce([[mockRegion], []]);

      const res = await request(app)
        .post('/api/regions')
        .send({ name: 'Jakarta', latitude: -6.2088, longitude: 106.8456 });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Jakarta');
    });

    it('returns 400 when fields missing', async () => {
      const res = await request(app)
        .post('/api/regions')
        .send({ name: 'Jakarta' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/required/i);
    });

    it('returns 400 when name missing', async () => {
      const res = await request(app)
        .post('/api/regions')
        .send({ latitude: -6.2, longitude: 106.8 });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/regions/:id', () => {
    it('updates an existing region', async () => {
      pool.query
        .mockResolvedValueOnce([[mockRegion], []])
        .mockResolvedValueOnce([[], []])
        .mockResolvedValueOnce([[{ ...mockRegion, name: 'Bandung' }], []]);

      const res = await request(app)
        .put('/api/regions/1')
        .send({ name: 'Bandung' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Bandung');
    });

    it('returns 404 when region not found', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app)
        .put('/api/regions/999')
        .send({ name: 'Bandung' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/regions/:id', () => {
    it('deletes a region', async () => {
      pool.query
        .mockResolvedValueOnce([[mockRegion], []])
        .mockResolvedValueOnce([[], []]);
      const res = await request(app).delete('/api/regions/1');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Region deleted');
    });

    it('returns 404 when region not found', async () => {
      pool.query.mockResolvedValue([[], []]);
      const res = await request(app).delete('/api/regions/999');
      expect(res.status).toBe(404);
    });
  });
});
