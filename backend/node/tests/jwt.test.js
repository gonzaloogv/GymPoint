const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test_secret';
const { generarToken } = require('../utils/jwt');

describe('generarToken', () => {
  it('should generate a token with correct payload', () => {
    const user = { id_user: 1, role: 'USER' };
    const token = generarToken(user);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    expect(payload.id).toBe(user.id_user);
    expect(payload.role).toBe(user.role);
    });
});