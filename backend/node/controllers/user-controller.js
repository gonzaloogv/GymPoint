const userService = require('../services/user-service');
const { user: userMapper } = require('../services/mappers');

/**
 * Obtener perfil del usuario actual
 * GET /api/users/me
 */
const obtenerPerfil = async (req, res) => {
  try {
    // req.user.id contiene id_account gracias al middleware
    const query = userMapper.toGetUserByAccountIdQuery({ accountId: req.user.id });
    const usuario = await userService.getUserByAccountId(query);
    res.json(userMapper.toUserProfileResponse(usuario));
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
 * Actualizar perfil del usuario actual
 * PUT /api/users/me
 *
 * Body: { name, lastname, gender, birth_date, locality, profile_picture_url }
 */
const actualizarPerfil = async (req, res) => {
  try {
    // Usar id_user_profile del token
    const idUserProfile = req.user.id_user_profile;

    if (!idUserProfile) {
      return res.status(403).json({
        error: {
          code: 'USER_PROFILE_REQUIRED',
          message: 'Solo usuarios pueden actualizar perfil'
        }
      });
    }

    const command = userMapper.toUpdateUserProfileCommand(req.body, idUserProfile);
    const usuario = await userService.updateUserProfile(command);
    res.json(userMapper.toUserProfileResponse(usuario));
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'UPDATE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Actualizar email del usuario actual
 * PUT /api/users/me/email
 *
 * Body: { email }
 */
const actualizarEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email es requerido'
        }
      });
    }

    const command = userMapper.toUpdateEmailCommand({ email, accountId: req.user.id_account });
    const result = await userService.updateEmail(command);
    res.json(userMapper.toEmailUpdateResponse(result));
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'EMAIL_UPDATE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Solicitar eliminación de cuenta (programada con período de gracia)
 * DELETE /api/users/me
 */
const solicitarEliminacionCuenta = async (req, res) => {
  try {
    const reason = req.body?.reason || req.query?.reason || null;
    const command = userMapper.toRequestAccountDeletionCommand({
      accountId: req.user.id_account,
      reason
    });
    const request = await userService.requestAccountDeletion(command);

    const graceDays = request?.metadata?.grace_period_days;
    const messageParts = [
      'Solicitud de eliminación registrada.',
      request?.scheduled_deletion_date
        ? `La cuenta será eliminada el ${request.scheduled_deletion_date}.`
        : null,
      graceDays ? `Período de gracia: ${graceDays} días.` : null
    ].filter(Boolean);

    res.json({
      message: messageParts.join(' '),
      request: userMapper.toAccountDeletionResponse(request)
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: {
        code: err.code || 'DELETE_REQUEST_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Obtener estado de la solicitud de eliminación
 * GET /api/users/me/deletion-request
 */
const obtenerEstadoEliminacion = async (req, res) => {
  try {
    const query = userMapper.toGetAccountDeletionStatusQuery({ accountId: req.user.id_account });
    const request = await userService.getAccountDeletionStatus(query);
    res.json({
      request: request ? userMapper.toAccountDeletionResponse(request) : null,
      has_active_request: request?.status === 'PENDING'
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: {
        code: err.code || 'DELETE_STATUS_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Cancelar solicitud de eliminación vigente
 * DELETE /api/users/me/deletion-request
 */
const cancelarSolicitudEliminacion = async (req, res) => {
  try {
    const command = userMapper.toCancelAccountDeletionCommand({ accountId: req.user.id_account });
    const request = await userService.cancelAccountDeletion(command);
    res.json({
      message: 'Solicitud de eliminación cancelada correctamente',
      request: userMapper.toAccountDeletionResponse(request)
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: {
        code: err.code || 'DELETE_CANCEL_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Obtener perfil de otro usuario (solo admin)
 * GET /api/users/:id
 */
const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const query = userMapper.toGetUserProfileByIdQuery({ userProfileId: parseInt(id) });
    const usuario = await userService.getUserProfileById(query);
    res.json(userMapper.toUserProfileResponse(usuario));
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
 * Actualizar tokens de un usuario (solo admin)
 * POST /api/users/:id/tokens
 *
 * Body: { delta, reason }
 */
const actualizarTokens = async (req, res) => {
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

    const command = userMapper.toUpdateUserTokensCommand({
      userProfileId: parseInt(id),
      delta: parseInt(delta),
      reason
    });

    const newBalance = await userService.updateUserTokens(command);

    res.json({
      id_user_profile: parseInt(id),
      new_balance: newBalance,
      delta: parseInt(delta)
    });
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'TOKEN_UPDATE_FAILED',
        message: err.message
      }
    });
  }
};

/**
 * Actualizar suscripción de un usuario (solo admin)
 * PUT /api/users/:id/subscription
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

    const command = userMapper.toUpdateUserSubscriptionCommand({
      userProfileId: parseInt(id),
      subscription
    });

    const result = await userService.updateUserSubscription(command);

    res.json(userMapper.toUserProfileResponse(result));
  } catch (err) {
    res.status(400).json({
      error: {
        code: 'SUBSCRIPTION_UPDATE_FAILED',
        message: err.message
      }
    });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  actualizarEmail,
  solicitarEliminacionCuenta,
  obtenerEstadoEliminacion,
  cancelarSolicitudEliminacion,
  obtenerUsuarioPorId,
  actualizarTokens,
  actualizarSuscripcion
};
