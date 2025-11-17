const authService = require('../services/auth-service');
const { auth: authMapper } = require('../services/mappers');
const { ConflictError, ValidationError } = require('../utils/errors');

const register = async (req, res) => {
  try {
    const command = authMapper.toRegisterCommand(req.body);
    const result = await authService.register(command, req);
    res.status(201).json(authMapper.toAuthSuccessResponse(result));
  } catch (err) {
    let status = 400;
    let code = 'REGISTER_FAILED';

    if (err instanceof ConflictError) {
      status = 409;
      code = 'EMAIL_ALREADY_EXISTS';
    } else if (err instanceof ValidationError) {
      code = 'INVALID_DATA';
    }

    res.status(status).json({
      error: {
        code,
        message: err.message,
      },
    });
  }
};

const login = async (req, res) => {
  try {
    const command = authMapper.toLoginCommand(req.body);
    const result = await authService.login(command, req);
    res.json(authMapper.toAuthSuccessResponse(result));
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 401;
    res.status(status).json({
      error: {
        code: status === 401 ? 'LOGIN_FAILED' : 'INVALID_DATA',
        message: err.message,
      },
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'El idToken de Google es requerido',
        },
      });
    }

    const result = await authService.googleLogin({ idToken }, req);
    res.json(authMapper.toAuthSuccessResponse(result));
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 401;
    res.status(status).json({
      error: {
        code: status === 401 ? 'GOOGLE_AUTH_FAILED' : 'INVALID_DATA',
        message: err.message,
      },
    });
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.body?.refreshToken ?? req.body?.token;

  if (!refreshToken) {
    return res.status(400).json({
      error: {
        code: 'MISSING_TOKEN',
        message: 'El refresh token es requerido',
      },
    });
  }

  try {
    const command = authMapper.toRefreshTokenCommand({ refresh_token: refreshToken });
    const result = await authService.refreshAccessToken(command);
    res.json(authMapper.toRefreshTokenResponse(result));
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 401;
    res.status(status).json({
      error: {
        code: status === 401 ? 'TOKEN_REFRESH_FAILED' : 'INVALID_DATA',
        message: err.message,
      },
    });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.body?.refreshToken ?? req.body?.token;

  if (!refreshToken) {
    return res.status(400).json({
      error: {
        code: 'MISSING_TOKEN',
        message: 'El refresh token es requerido',
      },
    });
  }

  try {
    const command = authMapper.toLogoutCommand(
      { refresh_token: refreshToken },
      req.account?.id_account ?? null
    );
    await authService.logout(command);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      error: {
        code: 'LOGOUT_FAILED',
        message: err.message,
      },
    });
  }
};

/**
 * Verifica el email usando el token recibido por correo
 * GET /api/auth/verify-email?token=<uuid>
 */
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      error: {
        code: 'MISSING_TOKEN',
        message: 'El token de verificación es requerido',
      },
    });
  }

  try {
    const account = await authService.verifyEmailToken(token);

    // Opción 1: Redirigir a la app móvil con deep link
    if (process.env.APP_DEEP_LINK_SCHEME) {
      return res.redirect(`${process.env.APP_DEEP_LINK_SCHEME}verify-success`);
    }

    // Opción 2: Retornar JSON (útil para testing)
    res.json({
      success: true,
      message: '¡Email verificado exitosamente! Ya puedes iniciar sesión en la aplicación.',
      account: {
        email: account.email,
        verified: account.email_verified,
      },
    });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;

    // Si es desde navegador, mostrar página de error amigable
    if (req.headers.accept?.includes('text/html')) {
      return res.status(status).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error de Verificación - GymPoint</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f3f4f6; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            h1 { color: #dc2626; font-size: 24px; }
            p { color: #6b7280; line-height: 1.6; }
            a { color: #635BFF; text-decoration: none; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error de Verificación</h1>
            <p>${err.message}</p>
            <p>Si necesitas ayuda, contacta con soporte: <a href="mailto:soporte@gympoint.app">soporte@gympoint.app</a></p>
          </div>
        </body>
        </html>
      `);
    }

    // Respuesta JSON para API
    res.status(status).json({
      error: {
        code: 'VERIFICATION_FAILED',
        message: err.message,
      },
    });
  }
};

/**
 * Reenvía el email de verificación
 * POST /api/auth/resend-verification
 * Body: { email: "user@example.com" }
 */
const resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: {
        code: 'MISSING_EMAIL',
        message: 'El email es requerido',
      },
    });
  }

  try {
    await authService.resendVerificationEmail(email);

    res.json({
      success: true,
      message: 'Email de verificación enviado. Revisa tu bandeja de entrada y spam.',
    });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;

    // Caso especial: email ya verificado
    if (err.message.includes('ya está verificado')) {
      return res.status(400).json({
        error: {
          code: 'ALREADY_VERIFIED',
          message: err.message,
        },
      });
    }

    // Caso especial: rate limiting (5 minutos)
    if (err.message.includes('recientemente')) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: err.message,
        },
      });
    }

    res.status(status).json({
      error: {
        code: 'RESEND_FAILED',
        message: err.message,
      },
    });
  }
};

/**
 * Solicita restablecimiento de contraseña
 * POST /api/auth/forgot-password
 * Body: { email: "user@example.com" }
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: {
        code: 'MISSING_EMAIL',
        message: 'El email es requerido',
      },
    });
  }

  try {
    // Extraer metadata (IP, user-agent) para auditoría
    const meta = {
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    };

    await authService.requestPasswordReset(email, meta);

    // SEGURIDAD: Siempre responder con éxito, aunque el email no exista
    // Esto previene enumeration attacks
    res.json({
      success: true,
      message: 'Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y spam.',
    });
  } catch (err) {
    // En caso de error del servidor, no revelar detalles
    console.error('[AuthController] Error en forgotPassword:', err);

    res.status(500).json({
      error: {
        code: 'FORGOT_PASSWORD_FAILED',
        message: 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.',
      },
    });
  }
};

/**
 * Restablece la contraseña usando un token válido
 * POST /api/auth/reset-password
 * Body: { token: "<uuid>", newPassword: "nueva123" }
 */
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token) {
    return res.status(400).json({
      error: {
        code: 'MISSING_TOKEN',
        message: 'El token de restablecimiento es requerido',
      },
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      error: {
        code: 'MISSING_PASSWORD',
        message: 'La nueva contraseña es requerida',
      },
    });
  }

  try {
    // Extraer metadata (IP, user-agent) para email de confirmación
    const meta = {
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    };

    await authService.resetPassword(token, newPassword, meta);

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
    });
  } catch (err) {
    const status = err instanceof ValidationError ? 400 : 500;

    // Casos específicos
    let errorCode = 'RESET_PASSWORD_FAILED';

    if (err.message.includes('inválido') || err.message.includes('expirado')) {
      errorCode = 'INVALID_OR_EXPIRED_TOKEN';
    } else if (err.message.includes('caracteres')) {
      errorCode = 'WEAK_PASSWORD';
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
  register,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
  // Email verification
  verifyEmail,
  resendVerification,
  // Password reset
  forgotPassword,
  resetPassword,
};
