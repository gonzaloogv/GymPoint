const transactionService = require('../services/transaction-service');

/**
 * Obtener transacciones de un usuario específico (Admin)
 * @route GET /api/transactions/:id_user
 * @access Private (Admin)
 */
const obtenerTransaccionesPorUsuario = async (req, res) => {
  try {
    const id_user_profile = req.params.id_user; // ID del user_profile
    const transacciones = await transactionService.obtenerTransaccionesPorUsuario(id_user_profile);
    
    res.json({
      message: 'Transacciones obtenidas con éxito',
      data: transacciones
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_TRANSACTIONS_FAILED', 
        message: err.message 
      } 
    });
  }
};

/**
 * Obtener transacciones del usuario autenticado
 * @route GET /api/transactions/me
 * @access Private (Usuario app)
 */
const obtenerTransaccionesAutenticado = async (req, res) => {
  try {
    const id_user_profile = req.user.id_user_profile;
    const transacciones = await transactionService.obtenerTransaccionesPorUsuario(id_user_profile);
    
    res.json({
      message: 'Transacciones obtenidas con éxito',
      data: transacciones
    });
  } catch (err) {
    res.status(400).json({ 
      error: { 
        code: 'GET_TRANSACTIONS_FAILED', 
        message: err.message 
      } 
    });
  }
};

module.exports = {
  obtenerTransaccionesPorUsuario,
  obtenerTransaccionesAutenticado
};