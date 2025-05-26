const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Streak = require('../models/Streak');
const frequencyService = require('../services/frequency-service');

const register = async (data) => {
  const { password, frequency_goal, ...resto } = data;

  // Validar si ya existe un usuario con ese email
  const existente = await User.findOne({ where: { email: resto.email } });
  if (existente) {
    throw new Error('El email ya está registrado');
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el usuario base (sin id_streak todavía)
  const user = await User.create({ ...resto, password: hashedPassword });

  // Crear la frecuencia semanal
  const frecuencia = await frequencyService.crearMetaSemanal({
    id_user: user.id_user,
    goal: frequency_goal
  });

  // Crear la racha vinculada a la frecuencia
  const streak = await Streak.create({
    id_user: user.id_user,
    value: 0,
    last_value: null,
    recovery_items: 0,
    achieved_goal: false,
    id_frequency: frecuencia.id_frequency
  });

  // Asociar la racha al usuario
  user.id_streak = streak.id_streak;
  await user.save();

  return user;
};

const login = async (email, password) => {
  // Buscar el usuario por email
  const user = await User.findOne({ where: { email } });

  // Verificar existencia y contraseña
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Credenciales inválidas. Verificá email y contraseña.');
  }

  // Generar el token JWT
  const token = jwt.sign(
    {
      id: user.id_user,
      rol: user.subscription,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user };
};

module.exports = { register, login };