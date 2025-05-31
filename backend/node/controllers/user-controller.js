const userService = require('../services/user-service');

const actualizarPerfil = async (req, res) => {
  try {
    const id_user = req.user.id; // ✅ SOLO el del token
    const usuario = await userService.actualizarPerfil(id_user, req.body);
    res.json(usuario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const id_user = req.user.id;
    const usuario = await userService.obtenerUsuario(id_user);
    res.json(usuario);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

module.exports = {
  actualizarPerfil,
  obtenerPerfil
};