const jwt = require('jsonwebtoken');
const { generarToken } = require('../utils/jwt');

describe('generarToken', () => {
  it('should generate a token with correct payload', () => {
    const user = { id_user: 1, subscription: 'FREE' };
    const token = generarToken(user);
    const SECRET = process.env.JWT_SECRET || 'gympoint_secret';
    const payload = jwt.verify(token, SECRET);

    expect(payload.id).toBe(user.id_user);
    expect(payload.rol).toBe(user.subscription);
  });
});