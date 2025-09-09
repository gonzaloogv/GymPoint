const frequencyService = require('../services/frequency-service');

const crearMeta = async (req, res) => {
  try {
    const id_user = req.user.id; 
    const { goal } = req.body;

    if (!goal) {
      return res.status(400).json({ error: 'Falta la meta semanal.' });
    }

    const meta = await frequencyService.crearMetaSemanal({ id_user, goal });
    res.status(201).json(meta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /frequency/me
const consultarMetaSemanal = async (req, res) => {
  try {
    const id_user = req.user.id;
    const resultado = await frequencyService.consultarMetaSemanal(id_user);
    res.json(resultado);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// POST /frequency/reset (admin)
const reiniciarSemana = async (req, res) => {
  try {
    await frequencyService.reiniciarSemana(); // esto reinicia todas, solo ADMIN rol
    res.json({ mensaje: 'Todas las metas fueron reiniciadas.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  crearMeta,
  consultarMetaSemanal,
  reiniciarSemana
};
