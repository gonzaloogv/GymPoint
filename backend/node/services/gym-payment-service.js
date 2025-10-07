const GymPayment = require('../models/GymPayment');

const registrarPago = async ({ id_user, id_gym, mount, payment_method, payment_date, status }) => {
  return await GymPayment.create({
    id_user,
    id_gym,
    mount,
    payment_method,
    payment_date,
    status
  });
};

const obtenerPagosPorUsuario = async (id_user) => {
  return await GymPayment.findAll({
    where: { id_user },
    order: [['payment_date', 'DESC']]
  });
};

const obtenerPagosPorGimnasio = async (id_gym) => {
    const { UserProfile } = require('../models');
    return await GymPayment.findAll({
      where: { id_gym },
      include: {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['name', 'lastname']
      },
      order: [['payment_date', 'DESC']]
    });
};

const actualizarEstadoPago = async (id_payment, nuevoEstado) => {
    const pago = await GymPayment.findByPk(id_payment);
    if (!pago) throw new Error('Pago no encontrado.');
  
    pago.status = nuevoEstado;
    await pago.save();
  
    return pago;
};
  
module.exports = {
    registrarPago,
    obtenerPagosPorUsuario,
    obtenerPagosPorGimnasio,
    actualizarEstadoPago
};  