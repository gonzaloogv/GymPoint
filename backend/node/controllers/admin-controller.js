const adminService = require('../services/admin-service');
const userService = require('../services/user-service');

/**
 * Obtener estadísticas generales del sistema
 * GET /api/admin/stats
 */
const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await adminService.obtenerEstadisticas();
    res.json(stats);
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'STATS_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Listar todos los usuarios
 * GET /api/admin/users
 * 
 * Query params: page, limit, subscription, search, sortBy, order
 */
const listarUsuarios = async (req, res) => {
  try {
    const result = await adminService.listarUsuarios(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'LIST_USERS_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Buscar usuario por email
 * GET /api/admin/users/search
 * 
 * Query params: email
 */
const buscarUsuario = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email es requerido'
        }
      });
    }

    const user = await adminService.buscarUsuarioPorEmail(email);
    res.json(user);
  } catch (err) {
    res.status(404).json({
      error: {
        code: 'USER_NOT_FOUND',
        message: err.message
      }
    });
  }
};

/**
 * Otorgar tokens a un usuario
 * POST /api/admin/users/:id/tokens
 * 
 * Body: { delta, reason }
 */
const otorgarTokens = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta, reason } = req.body;

    if (delta === undefined) {
      return res.status(400).json({
        error: {
          code: 'MISSING_DELTA',
          message: 'Delta es requerido'
        }
      });
    }

    const newBalance = await userService.actualizarTokens(
      parseInt(id),
      parseInt(delta),
      reason || `Admin: ${req.user.email}`
    );

    res.json({
      id_user_profile: parseInt(id),
      new_balance: newBalance,
      delta: parseInt(delta),
      reason: reason || 'Admin adjustment'
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'TOKEN_GRANT_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Actualizar suscripción de un usuario
 * PUT /api/admin/users/:id/subscription
 * 
 * Body: { subscription: 'FREE' | 'PREMIUM' }
 */
const actualizarSuscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({
        error: {
          code: 'MISSING_SUBSCRIPTION',
          message: 'Subscription es requerido'
        }
      });
    }

    const result = await userService.actualizarSuscripcion(
      parseInt(id),
      subscription
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'SUBSCRIPTION_UPDATE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Desactivar cuenta de usuario
 * POST /api/admin/users/:id/deactivate
 */
const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.desactivarCuenta(parseInt(id));

    res.json({
      message: 'Usuario desactivado correctamente',
      id_account: parseInt(id)
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'DEACTIVATE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Activar cuenta de usuario
 * POST /api/admin/users/:id/activate
 */
const activarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.activarCuenta(parseInt(id));

    res.json({
      message: 'Usuario activado correctamente',
      id_account: parseInt(id)
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'ACTIVATE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Obtener actividad reciente del sistema
 * GET /api/admin/activity
 * 
 * Query params: days (default: 7)
 */
const obtenerActividad = async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;
    const activity = await adminService.obtenerActividadReciente(days);
    res.json(activity);
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'ACTIVITY_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Obtener log de transacciones de tokens
 * GET /api/admin/transactions
 * 
 * Query params: user_id, limit, page
 */
const obtenerTransacciones = async (req, res) => {
  try {
    const userId = req.query.user_id ? parseInt(req.query.user_id) : null;
    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      page: req.query.page ? parseInt(req.query.page) : 1
    };

    const result = await adminService.obtenerTransacciones(userId, options);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'TRANSACTIONS_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Obtener perfil del admin actual
 * GET /api/admin/me
 */
const obtenerPerfilAdmin = async (req, res) => {
  try {
    const adminProfile = req.profile; // Ya cargado por middleware

    res.json({
      id_admin_profile: adminProfile.id_admin_profile,
      id_account: adminProfile.id_account,
      email: req.account.email,
      name: adminProfile.name,
      lastname: adminProfile.lastname,
      department: adminProfile.department,
      notes: adminProfile.notes,
      created_at: adminProfile.created_at
    });
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'PROFILE_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  obtenerEstadisticas,
  listarUsuarios,
  buscarUsuario,
  otorgarTokens,
  actualizarSuscripcion,
  desactivarUsuario,
  activarUsuario,
  obtenerActividad,
  obtenerTransacciones,
  obtenerPerfilAdmin
};

