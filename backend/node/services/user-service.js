const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ALLOW = new Set(['name', 'lastname', 'gender', 'locality', 'age']);
const filtrarDatos = (datos) =>
  Object.fromEntries(Object.entries(datos).filter(([k]) => ALLOW.has(k)));

const actualizarPerfil = async (id_user, datos) => {
  const usuario = await User.findByPk(id_user);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  return await usuario.update(filtrarDatos(datos));
};

const cambiarPassword = async (id_user, currentPassword, newPassword) => {
  const usuario = await User.findByPk(id_user);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  const coincide = await bcrypt.compare(currentPassword, usuario.password);
  if (!coincide) {
    throw new Error('Contraseña actual incorrecta');
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await usuario.update({ password: hashed });
};

const obtenerUsuario = async (id_user) => {
  const usuario = await User.findByPk(id_user, {
    attributes: { exclude: ['password'] },
  });
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  return usuario;
};

module.exports = {
  actualizarPerfil,
  obtenerUsuario,
  cambiarPassword,
};
