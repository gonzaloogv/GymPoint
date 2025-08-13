const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

/**
 * Genera un access token con el rol real del usuario.
 * @param {{id_user:number, role:string}} user
 * @returns {string}
 */

const generarToken = (user) => {
  return jwt.sign(
    {
      id: user.id_user,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

module.exports = { generarToken };
