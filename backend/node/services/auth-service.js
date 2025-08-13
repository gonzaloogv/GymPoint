const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Streak = require('../models/Streak');
const RefreshToken = require('../models/RefreshToken');
const frequencyService = require('../services/frequency-service');

const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets are required');
}

const ACCESS_EXPIRATION = '15m';
const REFRESH_EXPIRATION_DAYS = 30;

const register = async (data) => {
  const { password, frequency_goal, ...resto } = data;

  const existente = await User.findOne({ where: { email: resto.email } });
  if (existente) {
    throw new Error('El email ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ ...resto, password: hashedPassword, role: 'USER' });

  const frecuencia = await frequencyService.crearMetaSemanal({
    id_user: user.id_user,
    goal: frequency_goal,
  });

  const streak = await Streak.create({
    id_user: user.id_user,
    value: 0,
    last_value: null,
    recovery_items: 0,
    achieved_goal: false,
    id_frequency: frecuencia.id_frequency,
  });

  user.id_streak = streak.id_streak;
  await user.save();

  return user;
};

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id_user,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRATION }
  );
};

const generateRefreshToken = async (user, req) => {
  const refreshToken = jwt.sign({ id_user: user.id_user }, JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_EXPIRATION_DAYS}d`,
  });

  await RefreshToken.create({
    id_user: user.id_user,
    token: refreshToken,
    user_agent: req.headers['user-agent'] || '',
    ip_address:
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.ip ||
      '',
    expires_at: new Date(Date.now() + REFRESH_EXPIRATION_DAYS * 86400000),
  });

  return refreshToken;
};

const login = async (email, password, req) => {
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Credenciales inválidas');
  }

  const token = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user, req);

  return { token, refreshToken, user };
};

module.exports = { register, login };
