describe('Swagger API Documentation', () => {
  it('loads swagger spec without error', () => {
    expect(() => {
      const spec = require('../src/swagger');
      expect(spec).toBeDefined();
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBe('Carbon Monitor API');
    }).not.toThrow();
  });

  it('has all expected paths', () => {
    const spec = require('../src/swagger');
    const paths = spec.paths;
    expect(paths['/api/auth/register']).toBeDefined();
    expect(paths['/api/auth/login']).toBeDefined();
    expect(paths['/api/auth/me']).toBeDefined();
    expect(paths['/api/regions']).toBeDefined();
    expect(paths['/api/regions/{id}']).toBeDefined();
    expect(paths['/api/carbon']).toBeDefined();
    expect(paths['/api/carbon/{id}']).toBeDefined();
    expect(paths['/api/carbon/report/data']).toBeDefined();
    expect(paths['/api/dashboard/stats']).toBeDefined();
    expect(paths['/api/dashboard/monthly-history']).toBeDefined();
    expect(paths['/api/health']).toBeDefined();
  });

  it('has JWT security scheme defined', () => {
    const spec = require('../src/swagger');
    expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
    expect(spec.components.securitySchemes.bearerAuth.type).toBe('http');
    expect(spec.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
  });
});
