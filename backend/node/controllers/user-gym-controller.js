const userGymService = require('../services/user-gym-service');

const darAltaEnGimnasio = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { id_gym, plan } = req.body;

    if (!id_gym || !plan) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const alta = await userGymService.darAltaEnGimnasio({ id_user, id_gym, plan });
    res.status(201).json(alta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const darBajaEnGimnasio = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { id_gym } = req.body;

    if (!id_gym) {
      return res.status(400).json({ error: 'Falta el ID del gimnasio.' });
    }

    const baja = await userGymService.darBajaEnGimnasio({ id_user, id_gym });
    res.json(baja);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerGimnasiosActivos = async (req, res) => {
  try {
    const id_user = req.user.id;
    const resultado = await userGymService.obtenerGimnasiosActivos(id_user);
    res.json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerHistorialGimnasiosPorUsuario = async (req, res) => {
  try {
    const id_user = req.user.id;
    const { active } = req.query;

    const historial = await userGymService.obtenerHistorialGimnasiosPorUsuario(id_user, active);
    res.json(historial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerHistorialUsuariosPorGimnasio = async (req, res) => {
  try {
    const { id_gym } = req.params;
    const { active } = req.query;

    const historial = await userGymService.obtenerHistorialUsuariosPorGimnasio(id_gym, active);
    res.json(historial);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const contarUsuariosActivosEnGimnasio = async (req, res) => {
  try {
    const total = await userGymService.contarUsuariosActivosEnGimnasio(req.params.id_gym);
    res.json({ id_gym: req.params.id_gym, usuarios_activos: total });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  darAltaEnGimnasio,
  darBajaEnGimnasio,
  obtenerGimnasiosActivos,
  obtenerHistorialGimnasiosPorUsuario,
  obtenerHistorialUsuariosPorGimnasio,
  contarUsuariosActivosEnGimnasio,
};
