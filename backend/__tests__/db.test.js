const mockQuery = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: mockQuery,
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  })),
}));

const pool = require('../src/config/db');

describe('db.js query wrapper', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('converts ? placeholders to $N', async () => {
    const mockRows = [{ id: 1, name: 'test' }];
    mockQuery.mockResolvedValue({ rows: mockRows, fields: [] });

    const [rows, fields] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND name = ?',
      [1, 'test']
    );

    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = $1 AND name = $2',
      [1, 'test']
    );
    expect(rows).toEqual(mockRows);
    expect(fields).toEqual([]);
  });

  it('passes queries without params unchanged', async () => {
    const mockRows = [{ count: 5 }];
    mockQuery.mockResolvedValue({ rows: mockRows, fields: [] });

    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM regions');

    expect(mockQuery).toHaveBeenCalledWith('SELECT COUNT(*) AS count FROM regions', undefined);
    expect(rows).toEqual(mockRows);
  });

  it('handles queries with ? but no params array', async () => {
    mockQuery.mockResolvedValue({ rows: [], fields: [] });

    await pool.query('SELECT 1');

    expect(mockQuery).toHaveBeenCalledWith('SELECT 1', undefined);
  });

  it('does not replace ? when params is not an array', async () => {
    mockQuery.mockResolvedValue({ rows: [], fields: [] });

    await pool.query('SELECT ?', 'string');

    expect(mockQuery).toHaveBeenCalledWith('SELECT ?', 'string');
  });

  it('handles no ? placeholders with params array', async () => {
    mockQuery.mockResolvedValue({ rows: [], fields: [] });

    await pool.query('SELECT NOW()', []);

    expect(mockQuery).toHaveBeenCalledWith('SELECT NOW()', []);
  });

  it('returns [rows, fields] tuple', async () => {
    const mockRows = [{ a: 1 }];
    const mockFields = [{ name: 'a' }];
    mockQuery.mockResolvedValue({ rows: mockRows, fields: mockFields });

    const result = await pool.query('SELECT a');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(mockRows);
    expect(result[1]).toEqual(mockFields);
  });

  it('re-throws errors from pg', async () => {
    const dbError = new Error('connection refused');
    mockQuery.mockRejectedValue(dbError);

    await expect(pool.query('SELECT 1')).rejects.toThrow('connection refused');
  });
});
