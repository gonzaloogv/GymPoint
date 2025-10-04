const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Streak = require('../models/Streak');
const RefreshToken = require('../models/RefreshToken');
const frequencyService = require('../services/frequency-service');
const GoogleAuthProvider = require('../utils/auth-providers/google-provider');

const ACCESS_EXPIRATION = '15m';
const REFRESH_EXPIRATION_DAYS = 30;

// Instanciar el provider de Google
const googleProvider = new GoogleAuthProvider();

const register = async (data) => {
  const { password, frequency_goal, ...resto } = data;

  const existente = await User.findOne({ where: { email: resto.email } });
  if (existente) throw new Error('El email ya está registrado');

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ 
    ...resto, 
    password: hashedPassword,
    auth_provider: 'local'
  });

  const frecuencia = await frequencyService.crearMetaSemanal({
    id_user: user.id_user,
    goal: frequency_goal
  });

  const streak = await Streak.create({
    id_user: user.id_user,
    value: 0,
    last_value: null,
    recovery_items: 0,
    achieved_goal: false,
    id_frequency: frecuencia.id_frequency
  });

  user.id_streak = streak.id_streak;
  await user.save();

  return user;
};

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id_user,
      rol: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRATION }
  );
};

const generateRefreshToken = async (user, req) => {
  const refreshToken = jwt.sign(
    { id_user: user.id_user },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: `${REFRESH_EXPIRATION_DAYS}d` }
  );

  await RefreshToken.create({
    id_user: user.id_user,
    token: refreshToken,
    user_agent: req.headers['user-agent'] || '',
    ip_address:
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.ip ||
      '',
    expires_at: new Date(Date.now() + REFRESH_EXPIRATION_DAYS * 86400000)
  });

  return refreshToken;
};

const login = async (email, password, req) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // Verificar que el usuario no sea de Google
  if (user.auth_provider === 'google') {
    throw new Error('Esta cuenta fue creada con Google. Por favor, inicia sesión con Google.');
  }

  // Verificar contraseña
  if (!user.password || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Credenciales inválidas');
  }

  const token = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user, req);

  return { token, refreshToken, user };
};

/**
 * Autenticación con Google OAuth2
 * @param {string} idToken - Token de ID de Google
 * @param {object} req - Request object para obtener metadata
 * @returns {Promise<{token: string, refreshToken: string, user: User}>}
 */
const googleLogin = async (idToken, req) => {
  // Verificar token de Google
  const googleUser = await googleProvider.verifyToken(idToken);
  googleProvider.validateGoogleUser(googleUser);

  // Buscar usuario existente por email o google_id
  let user = await User.findOne({ 
    where: { 
      email: googleUser.email 
    } 
  });

  if (user) {
    // Usuario existe - verificar proveedor
    if (user.auth_provider === 'local') {
      // Usuario tiene cuenta local - vincular con Google
      user.auth_provider = 'google';
      user.google_id = googleUser.googleId;
      await user.save();
    } else if (user.google_id !== googleUser.googleId) {
      // Actualizar google_id si cambió
      user.google_id = googleUser.googleId;
      await user.save();
    }
  } else {
    // Crear nuevo usuario con Google
    // Crear frecuencia por defecto de 3 días
    const frecuencia = await frequencyService.crearMetaSemanal({
      id_user: null, // Se actualizará después
      goal: 3
    });

    // Crear usuario
    user = await User.create({
      name: googleUser.name || 'Usuario',
      lastname: googleUser.lastName || '',
      email: googleUser.email,
      gender: 'O',
      locality: '',
      age: 0,
      role: 'USER',
      tokens: 0,
      auth_provider: 'google',
      google_id: googleUser.googleId,
      password: null // No tiene contraseña
    });

    // Actualizar frecuencia con el id del usuario
    await frequencyService.actualizarUsuarioFrecuencia(
      frecuencia.id_frequency, 
      user.id_user
    );

    // Crear streak inicial
    const streak = await Streak.create({
      id_user: user.id_user,
      value: 0,
      last_value: null,
      recovery_items: 0,
      achieved_goal: false,
      id_frequency: frecuencia.id_frequency
    });

    // Actualizar usuario con el streak
    user.id_streak = streak.id_streak;
    await user.save();
  }

  // Generar tokens JWT
  const token = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user, req);

  return { token, refreshToken, user };
};

module.exports = { 
  register, 
  login,
  googleLogin,
  generateAccessToken,
  generateRefreshToken
};
