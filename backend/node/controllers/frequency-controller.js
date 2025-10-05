const frequencyService = require('../services/frequency-service');

const crearMeta = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile; 
    const { goal } = req.body;

    if (!goal) {
      return res.status(400).json({ error: 'Falta la meta semanal.' });
    }

    const meta = await frequencyService.crearMetaSemanal({ id_user, goal });
    res.status(201).json({ message: 'Meta semanal creada con éxito', data: meta });
  } catch (err) {
    res.status(400).json({ error: { code: 'CREATE_FREQUENCY_FAILED', message: err.message } });
  }
};

// GET /frequency/me
const consultarMetaSemanal = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile;
    const resultado = await frequencyService.consultarMetaSemanal(id_user);
    res.json({ data: resultado, message: 'Meta semanal obtenida con éxito' });
  } catch (err) {
    res.status(404).json({ error: { code: 'GET_FREQUENCY_FAILED', message: err.message } });
  }
};

// POST /frequency/reset (admin)
const reiniciarSemana = async (req, res) => {
  try {
    await frequencyService.reiniciarSemana(); // esto reinicia todas, solo ADMIN rol
    res.json({ message: 'Todas las metas fueron reiniciadas' });
  } catch (err) {
    res.status(500).json({ error: { code: 'RESET_FREQUENCY_FAILED', message: err.message } });
  }
};

module.exports = {
  crearMeta,
  consultarMetaSemanal,
  reiniciarSemana
};
