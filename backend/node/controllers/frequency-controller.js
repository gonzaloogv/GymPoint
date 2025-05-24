const frequencyService = require('../services/frequency-service');

const crearMeta = async (req, res) => {
  try {
    const { id_user, goal } = req.body;
    if (!id_user || !goal) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const meta = await frequencyService.crearMetaSemanal({ id_user, goal });
    res.status(201).json(meta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const consultarMetaSemanal = async (req, res) => {
    try {
      const resultado = await frequencyService.consultarMetaSemanal(req.params.id_user);
      res.json(resultado);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
};
  
const reiniciarSemana = async (req, res) => {
    try {
      await frequencyService.reiniciarSemana();
      res.json({ mensaje: 'Todas las metas fueron reiniciadas.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

module.exports = {
    crearMeta,
    consultarMetaSemanal,
    reiniciarSemana
}
