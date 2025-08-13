const transactionService = require('../services/transaction-service');

const obtenerTransaccionesPorUsuario = async (req, res) => {
  try {
    const transacciones = await transactionService.obtenerTransaccionesPorUsuario(
      req.params.id_user
    );
    res.json(transacciones);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerTransaccionesAutenticado = async (req, res) => {
  try {
    const transacciones = await transactionService.obtenerTransaccionesPorUsuario(req.user.id);
    res.json(transacciones);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  obtenerTransaccionesPorUsuario,
  obtenerTransaccionesAutenticado,
};
