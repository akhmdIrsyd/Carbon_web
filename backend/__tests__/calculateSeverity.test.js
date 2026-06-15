const { calculateSeverity } = require('../src/routes/carbon');

describe('calculateSeverity()', () => {
  it('returns Aman for amount <= 100', () => {
    expect(calculateSeverity(0)).toBe('Aman');
    expect(calculateSeverity(50)).toBe('Aman');
    expect(calculateSeverity(100)).toBe('Aman');
  });

  it('returns Waspada for amount 101-300', () => {
    expect(calculateSeverity(101)).toBe('Waspada');
    expect(calculateSeverity(200)).toBe('Waspada');
    expect(calculateSeverity(300)).toBe('Waspada');
  });

  it('returns Siaga for amount 301-500', () => {
    expect(calculateSeverity(301)).toBe('Siaga');
    expect(calculateSeverity(400)).toBe('Siaga');
    expect(calculateSeverity(500)).toBe('Siaga');
  });

  it('returns Berbahaya for amount 501-700', () => {
    expect(calculateSeverity(501)).toBe('Berbahaya');
    expect(calculateSeverity(600)).toBe('Berbahaya');
    expect(calculateSeverity(700)).toBe('Berbahaya');
  });

  it('returns Sangat Berbahaya for amount > 700', () => {
    expect(calculateSeverity(701)).toBe('Sangat Berbahaya');
    expect(calculateSeverity(1000)).toBe('Sangat Berbahaya');
    expect(calculateSeverity(999999)).toBe('Sangat Berbahaya');
  });

  it('handles string numbers', () => {
    expect(calculateSeverity('50')).toBe('Aman');
    expect(calculateSeverity('150')).toBe('Waspada');
    expect(calculateSeverity('350')).toBe('Siaga');
  });

  it('handles decimal values', () => {
    expect(calculateSeverity(100.5)).toBe('Waspada');
    expect(calculateSeverity(300.1)).toBe('Siaga');
    expect(calculateSeverity(500.99)).toBe('Berbahaya');
  });

  it('handles negative values as Aman', () => {
    expect(calculateSeverity(-1)).toBe('Aman');
    expect(calculateSeverity(-100)).toBe('Aman');
  });
});
