const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'carbon_user',
  password: process.env.DB_PASSWORD || 'carbon_pass',
  database: process.env.DB_NAME || 'carbon_monitor',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 10,
});

const origQuery = pool.query.bind(pool);
pool.query = (text, params) => {
  if (params && Array.isArray(params) && text.includes('?')) {
    let i = 0;
    text = text.replace(/\?/g, () => `$${++i}`);
  }
  return origQuery(text, params).then((r) => [r.rows, r.fields]);
};

module.exports = pool;
