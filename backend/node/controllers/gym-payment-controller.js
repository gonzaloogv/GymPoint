const service = require('../services/gym-payment-service');

const registrarPago = async (req, res) => {
  try {
    const { id_gym, mount, payment_method, payment_date, status } = req.body;
    const id_user = req.user.id_user_profile; // id del autenticado

    if (!id_gym || !mount || !payment_method || !payment_date || !status) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const pago = await service.registrarPago({
      id_user,
      id_gym,
      mount,
      payment_method,
      payment_date,
      status
    });

    res.status(201).json({ data: pago, message: 'Pago registrado con éxito' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const obtenerPagosPorUsuario = async (req, res) => {
  try {
    const id_user = req.user.id_user_profile;
    const pagos = await service.obtenerPagosPorUsuario(id_user);
    res.json({ data: pagos, message: 'Pagos obtenidos con éxito' });
  } catch (err) {
    res.status(400).json({ error: { code: 'GET_PAYMENTS_FAILED', message: err.message } });
  }
};

const obtenerPagosPorGimnasio = async (req, res) => {
  try {
    const pagos = await service.obtenerPagosPorGimnasio(req.params.id_gym);
    res.json({ data: pagos, message: 'Pagos del gimnasio obtenidos con éxito' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const actualizarEstadoPago = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Falta el campo "status".' });

    const pagoActualizado = await service.actualizarEstadoPago(req.params.id_payment, status);
    res.json({ message: 'Pago actualizado con éxito', data: pagoActualizado });
  } catch (err) {
    res.status(400).json({ error: { code: 'UPDATE_PAYMENT_FAILED', message: err.message } });
  }
};

module.exports = {
  registrarPago,
  obtenerPagosPorUsuario,
  obtenerPagosPorGimnasio,
  actualizarEstadoPago
};
