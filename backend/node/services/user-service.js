const User = require('../models/User');

const actualizarPerfil = async (id_user, datos) => {
  const usuario = await User.findByPk(id_user);
  if (!usuario) throw new Error('Usuario no encontrado');

  return await usuario.update(datos);
};

const obtenerUsuario = async (id_user) => {
  const usuario = await User.findByPk(id_user, {
    attributes: { exclude: ['password'] }
  });
  if (!usuario) throw new Error('Usuario no encontrado');
  return usuario;
};

module.exports = {
  actualizarPerfil,
  obtenerUsuario
};
