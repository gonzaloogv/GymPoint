const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'gympoint_secret';

const generarToken = (user) => {
  return jwt.sign(
    {
      id: user.id_user,
      rol: user.subscription // FREE, PREMIUM, ADMIN
    },
    SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { generarToken };
