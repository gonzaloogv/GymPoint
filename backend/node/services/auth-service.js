const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (data) => {
  // Validar si ya existe un usuario con ese email
  const existente = await User.findOne({ where: { email: data.email } });
  if (existente) {
    throw new Error('El email ya está registrado');
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Crear el nuevo usuario
  const user = await User.create({ ...data, password: hashedPassword });

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