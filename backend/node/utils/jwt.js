const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'gympoint_secret';

const generarToken = (user) => {
  return jwt.sign(
    {
      id: user.id_user,
      rol: user.subscription
    },
    SECRET,
    { expiresIn: '15m' } // ✅ Access token corto
  );
};

module.exports = { generarToken };
