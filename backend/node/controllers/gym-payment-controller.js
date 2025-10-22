/**
 * Gym Payment Controller - Lote 4
 * Maneja endpoints de pagos de gimnasios
 */

const gymPaymentService = require('../services/gym-payment-service');
const {
  gymPaymentMappers,
} = require('../services/mappers');

// ============================================================================
// GYM PAYMENTS
// ============================================================================

/**
 * GET /api/users/:userId/gym-payments
 * Lista los pagos de un usuario
 */
const getUserPayments = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { page, limit, status, gymId, from_date, to_date, sortBy, order } = req.query;

    const query = gymPaymentMappers.toGetUserPaymentsQuery({
      userId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      gymId: gymId ? parseInt(gymId, 10) : undefined,
      from_date,
      to_date,
      sortBy,
      order,
    });

    const result = await gymPaymentService.getUserPayments(query);
    const dto = gymPaymentMappers.toPaginatedGymPaymentsDTO(result);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_USER_PAYMENTS_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/gyms/:gymId/payments
 * Lista los pagos de un gimnasio
 */
const getGymPayments = async (req, res) => {
  try {
    const gymId = parseInt(req.params.gymId, 10);
    const { page, limit, status, payment_method, from_date, to_date, sortBy, order } = req.query;

    const query = gymPaymentMappers.toGetGymPaymentsQuery({
      gymId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      payment_method,
      from_date,
      to_date,
      sortBy,
      order,
    });

    const result = await gymPaymentService.getGymPayments(query);
    const dto = gymPaymentMappers.toPaginatedGymPaymentsDTO(result);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_GYM_PAYMENTS_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/payments/:paymentId
 * Obtiene un pago específico
 */
const getGymPayment = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId, 10);

    const query = gymPaymentMappers.toGetGymPaymentQuery(paymentId);
    const payment = await gymPaymentService.getGymPayment(query);

    if (!payment) {
      return res.status(404).json({
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Pago no encontrado',
        },
      });
    }

    const dto = gymPaymentMappers.toGymPaymentDTO(payment);
    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_PAYMENT_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * POST /api/gyms/:gymId/payments
 * Crea un nuevo pago
 */
const createGymPayment = async (req, res) => {
  try {
    const gymId = parseInt(req.params.gymId, 10);
    const userId = req.account?.userProfile?.id_user_profile || req.user?.id_user_profile;

    if (!userId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario autenticado requerido',
        },
      });
    }

    const command = gymPaymentMappers.toCreateGymPaymentCommand(req.body, gymId, userId);
    const payment = await gymPaymentService.createGymPayment(command);
    const dto = gymPaymentMappers.toGymPaymentDTO(payment);

    res.status(201).json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'CREATE_PAYMENT_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * PATCH /api/payments/:paymentId
 * Actualiza un pago
 */
const updateGymPayment = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId, 10);
    const updatedBy = req.account?.userProfile?.id_user_profile;

    const command = gymPaymentMappers.toUpdateGymPaymentCommand(req.body, paymentId, updatedBy);
    const payment = await gymPaymentService.updateGymPayment(command);
    const dto = gymPaymentMappers.toGymPaymentDTO(payment);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'UPDATE_PAYMENT_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * DELETE /api/payments/:paymentId
 * Elimina un pago
 */
const deleteGymPayment = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId, 10);
    const deletedBy = req.account?.userProfile?.id_user_profile;

    const command = gymPaymentMappers.toDeleteGymPaymentCommand(paymentId, deletedBy);
    await gymPaymentService.deleteGymPayment(command);

    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'DELETE_PAYMENT_FAILED',
        message: error.message,
      },
    });
  }
};

// ============================================================================
// PAYMENT STATS
// ============================================================================

/**
 * GET /api/gyms/:gymId/payments/revenue
 * Obtiene los ingresos totales de un gimnasio
 */
const getGymTotalRevenue = async (req, res) => {
  try {
    const gymId = parseInt(req.params.gymId, 10);
    const { status, from_date, to_date } = req.query;

    const query = gymPaymentMappers.toGetGymTotalRevenueQuery({
      gymId,
      status,
      from_date,
      to_date,
    });

    const revenue = await gymPaymentService.getGymTotalRevenue(query);
    const dto = gymPaymentMappers.toGymRevenueDTO(revenue);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_REVENUE_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/users/:userId/gyms/:gymId/pending-payments/count
 * Cuenta los pagos pendientes de un usuario en un gimnasio
 */
const countPendingPayments = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const gymId = parseInt(req.params.gymId, 10);

    const query = gymPaymentMappers.toCountPendingPaymentsQuery(userId, gymId);
    const count = await gymPaymentService.countPendingPayments(query);

    res.json({ count });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'COUNT_PENDING_FAILED',
        message: error.message,
      },
    });
  }
};

module.exports = {
  // Payments
  getUserPayments,
  getGymPayments,
  getGymPayment,
  createGymPayment,
  updateGymPayment,
  deleteGymPayment,

  // Stats
  getGymTotalRevenue,
  countPendingPayments,

  // Legacy compatibility (old function names)
  registrarPago: createGymPayment,
  obtenerPagosPorUsuario: getUserPayments,
  obtenerPagosPorGimnasio: getGymPayments,
  actualizarEstadoPago: updateGymPayment,
};
