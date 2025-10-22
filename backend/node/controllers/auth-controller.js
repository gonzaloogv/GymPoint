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
      status = 400;
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

module.exports = {
  register,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
};
