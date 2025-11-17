const userService = require('../services/user-service');
const authService = require('../services/auth-service');
const { user: userMapper } = require('../services/mappers');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

/**
 * Obtener perfil del usuario actual
 * GET /api/users/me
 */
const obtenerPerfil = async (req, res) => {
  try {
    // req.user.id contiene id_account gracias al middleware
    const query = userMapper.toGetUserByAccountIdQuery(req.user.id);
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
    const accountId = req.user?.id_account || req.user?.id || req.account?.id_account;

    if (!accountId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ACCOUNT_ID',
          message: 'No se pudo determinar el ID de la cuenta'
        }
      });
    }

    const command = userMapper.toRequestAccountDeletionCommand(
      { reason },
      accountId
    );
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
    const query = userMapper.toGetAccountDeletionStatusQuery(req.user.id_account);
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
    const command = userMapper.toCancelAccountDeletionCommand(req.user.id_account);
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
    const query = userMapper.toGetUserProfileByIdQuery({ userProfileId: Number.parseInt(id) });
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
      userProfileId: Number.parseInt(id),
      delta: Number.parseInt(delta),
      reason
    });

    const newBalance = await userService.updateUserTokens(command);

    res.json({
      id_user_profile: Number.parseInt(id),
      new_balance: newBalance,
      delta: Number.parseInt(delta)
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
      userProfileId: Number.parseInt(id),
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

/**
 * Cambiar contraseña del usuario autenticado
 * POST /api/users/me/change-password
 *
 * Body: { currentPassword, newPassword, confirmPassword }
 */
const cambiarContrasena = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validar campos requeridos
    if (!currentPassword) {
      return res.status(400).json({
        error: {
          code: 'MISSING_CURRENT_PASSWORD',
          message: 'La contraseña actual es requerida',
        },
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        error: {
          code: 'MISSING_NEW_PASSWORD',
          message: 'La nueva contraseña es requerida',
        },
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        error: {
          code: 'MISSING_CONFIRM_PASSWORD',
          message: 'La confirmación de contraseña es requerida',
        },
      });
    }

    // Validar que la nueva contraseña coincida con la confirmación
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: {
          code: 'PASSWORD_MISMATCH',
          message: 'La nueva contraseña y su confirmación no coinciden',
        },
      });
    }

    // Obtener ID de cuenta del token JWT
    const accountId = req.user?.id_account || req.user?.id || req.account?.id_account;

    if (!accountId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'No se pudo identificar la cuenta',
        },
      });
    }

    // Llamar al servicio de autenticación
    await authService.changePassword({
      accountId,
      currentPassword,
      newPassword,
    });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Se han cerrado todas tus sesiones activas por seguridad.',
    });
  } catch (err) {
    // Manejar errores específicos
    let status = 500;
    let errorCode = 'CHANGE_PASSWORD_FAILED';

    if (err instanceof ValidationError) {
      status = 400;
      if (err.message.includes('Google')) {
        errorCode = 'GOOGLE_ACCOUNT';
      } else if (err.message.includes('diferente')) {
        errorCode = 'SAME_AS_CURRENT';
      } else if (err.message.includes('caracteres')) {
        errorCode = 'WEAK_PASSWORD';
      } else {
        errorCode = 'INVALID_DATA';
      }
    } else if (err instanceof UnauthorizedError) {
      status = 401;
      errorCode = 'INCORRECT_CURRENT_PASSWORD';
    }

    res.status(status).json({
      error: {
        code: errorCode,
        message: err.message,
      },
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
  actualizarSuscripcion,
  cambiarContrasena,
};
