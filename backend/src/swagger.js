const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Carbon Monitor API',
      version: '1.0.0',
      description: `API untuk monitoring emisi karbon per wilayah.

## Severity Categories

| Rentang Karbon | Kategori |
|----------------|----------|
| ≤ 100          | Aman     |
| 101 – 300      | Waspada  |
| 301 – 500      | Siaga    |
| 501 – 700      | Berbahaya |
| > 700          | Sangat Berbahaya |
`,
      contact: { name: 'Carbon Monitor Team' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan token JWT yang diperoleh dari endpoint login/register',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Region: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            latitude: { type: 'string' },
            longitude: { type: 'string' },
            description: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            total_carbon: { type: 'string' },
            latest_severity: { type: 'string', enum: ['Aman', 'Waspada', 'Siaga', 'Berbahaya', 'Sangat Berbahaya'] },
          },
        },
        CarbonRecord: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            region_id: { type: 'integer' },
            carbon_amount: { type: 'string' },
            severity: { type: 'string', enum: ['Aman', 'Waspada', 'Siaga', 'Berbahaya', 'Sangat Berbahaya'] },
            recorded_at: { type: 'string', format: 'date' },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            region_name: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register user baru',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Admin' },
                    email: { type: 'string', format: 'email', example: 'admin@test.com' },
                    password: { type: 'string', format: 'password', example: 'admin123' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Registrasi berhasil', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } },
            '400': { description: 'Field required atau email sudah terdaftar', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'admin@test.com' },
                    password: { type: 'string', format: 'password', example: 'admin123' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login berhasil', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } },
            '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Ambil data user saat ini',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Data user', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
            '401': { description: 'No token / Invalid token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/regions': {
        get: {
          tags: ['Regions'],
          summary: 'Daftar semua wilayah',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Array of regions', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Region' } } } } },
            '401': { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Regions'],
          summary: 'Tambah wilayah baru',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'latitude', 'longitude'],
                  properties: {
                    name: { type: 'string', example: 'Jakarta' },
                    latitude: { type: 'number', example: -6.2088 },
                    longitude: { type: 'number', example: 106.8456 },
                    description: { type: 'string', example: 'Ibu kota Indonesia' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Region created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Region' } } } },
            '400': { description: 'Name, latitude, longitude required' },
          },
        },
      },
      '/api/regions/{id}': {
        get: {
          tags: ['Regions'],
          summary: 'Detail wilayah',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Region detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/Region' } } } },
            '404': { description: 'Region not found' },
          },
        },
        put: {
          tags: ['Regions'],
          summary: 'Update wilayah',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Region updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Region' } } } },
            '404': { description: 'Region not found' },
          },
        },
        delete: {
          tags: ['Regions'],
          summary: 'Hapus wilayah',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Region deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
            '404': { description: 'Region not found' },
          },
        },
      },
      '/api/carbon': {
        get: {
          tags: ['Carbon Records'],
          summary: 'Daftar record karbon',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'region_id', in: 'query', required: false, schema: { type: 'integer' }, description: 'Filter by region' },
          ],
          responses: {
            '200': { description: 'Array of carbon records', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CarbonRecord' } } } } },
          },
        },
        post: {
          tags: ['Carbon Records'],
          summary: 'Tambah record karbon (severity otomatis)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['region_id', 'carbon_amount'],
                  properties: {
                    region_id: { type: 'integer', example: 1 },
                    carbon_amount: { type: 'number', example: 250 },
                    recorded_at: { type: 'string', format: 'date', example: '2026-06-15' },
                    notes: { type: 'string', example: 'Pengukuran rutin' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Record created', content: { 'application/json': { schema: { $ref: '#/components/schemas/CarbonRecord' } } } },
            '400': { description: 'region_id and carbon_amount required' },
            '404': { description: 'Region not found' },
          },
        },
      },
      '/api/carbon/report/data': {
        get: {
          tags: ['Carbon Records'],
          summary: 'Data laporan karbon dengan filter',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'region_id', in: 'query', required: false, schema: { type: 'integer' } },
            { name: 'month_start', in: 'query', required: false, schema: { type: 'string', pattern: 'YYYY-MM' }, example: '2026-01' },
            { name: 'month_end', in: 'query', required: false, schema: { type: 'string', pattern: 'YYYY-MM' }, example: '2026-06' },
          ],
          responses: {
            '200': {
              description: 'Report data with summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      region_id: { type: 'integer', nullable: true },
                      region_name: { type: 'string' },
                      month_start: { type: 'string' },
                      month_end: { type: 'string' },
                      month_start_label: { type: 'string' },
                      month_end_label: { type: 'string' },
                      summary: {
                        type: 'object',
                        properties: {
                          totalRecords: { type: 'integer' },
                          totalCarbon: { type: 'string' },
                          avgCarbon: { type: 'string' },
                          maxCarbon: { type: 'number' },
                          minCarbon: { type: 'number' },
                        },
                      },
                      records: { type: 'array', items: { $ref: '#/components/schemas/CarbonRecord' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/carbon/{id}': {
        get: {
          tags: ['Carbon Records'],
          summary: 'Detail record karbon',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Carbon record detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/CarbonRecord' } } } },
            '404': { description: 'Record not found' },
          },
        },
        put: {
          tags: ['Carbon Records'],
          summary: 'Update record karbon',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    carbon_amount: { type: 'number' },
                    recorded_at: { type: 'string', format: 'date' },
                    notes: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Record updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/CarbonRecord' } } } },
            '404': { description: 'Record not found' },
          },
        },
        delete: {
          tags: ['Carbon Records'],
          summary: 'Hapus record karbon',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': { description: 'Record deleted' },
            '404': { description: 'Record not found' },
          },
        },
      },
      '/api/dashboard/stats': {
        get: {
          tags: ['Dashboard'],
          summary: 'Statistik dashboard lengkap',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Dashboard stats payload',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      totalRegions: { type: 'string' },
                      totalRecords: { type: 'string' },
                      totalCarbon: { type: 'string' },
                      avgCarbon: { type: 'string' },
                      monthRecords: { type: 'string' },
                      monthCarbon: { type: 'string' },
                      severityCounts: { type: 'array', items: { type: 'object' } },
                      recentRecords: { type: 'array', items: { $ref: '#/components/schemas/CarbonRecord' } },
                      regionSummary: { type: 'array', items: { type: 'object' } },
                      monthRegionSummary: { type: 'array', items: { type: 'object' } },
                      trendData: { type: 'array', items: { type: 'object' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/dashboard/monthly-history': {
        get: {
          tags: ['Dashboard'],
          summary: 'Riwayat bulanan karbon',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'region_id', in: 'query', required: false, schema: { type: 'integer' } },
          ],
          responses: {
            '200': {
              description: 'Monthly aggregated data',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        month: { type: 'string', example: '2026-06' },
                        total: { type: 'string' },
                        count: { type: 'string' },
                        avg: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          responses: {
            '200': { description: 'Server OK', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, timestamp: { type: 'string' } } } } } },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
