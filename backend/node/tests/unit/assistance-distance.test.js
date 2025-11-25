process.env.NODE_ENV = 'test';

describe('assistance-service.calculateDistance (unit)', () => {
  it('aproxima 111.3 km por grado en ecuador (lat)', () => {
    const svc = require('../../services/assistance-service');
    const d = svc.calculateDistance(0, 0, 1, 0); // 1° latitud ~ 111.3 km
    expect(d).toBeGreaterThan(110000);
    expect(d).toBeLessThan(112000);
  });

  it('aproxima 111.3 km por grado en ecuador (lon)', () => {
    const svc = require('../../services/assistance-service');
    const d = svc.calculateDistance(0, 0, 0, 1); // 1° longitud ~ 111.3 km
    expect(d).toBeGreaterThan(110000);
    expect(d).toBeLessThan(112000);
  });
});

