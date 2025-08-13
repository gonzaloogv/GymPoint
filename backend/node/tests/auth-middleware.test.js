process.env.JWT_SECRET = 'test_secret';
const { verificarRol } = require('../middlewares/auth');

describe('verificarRol', () => {
  it('allows when role is permitted', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    verificarRol('ADMIN')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('denies when role is not permitted', () => {
    const req = { user: { role: 'USER' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    verificarRol('ADMIN')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
