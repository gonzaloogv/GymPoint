const authService = require('../services/auth-service');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Registrar un nuevo usuario con email y contraseña
 */
const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ 
      error: {
        code: 'REGISTER_FAILED',
        message: err.message 
      }
    });
  }
};

/**
 * Login con email y contraseña
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, refreshToken, user } = await authService.login(email, password, req);

    res.json({ accessToken: token, refreshToken, user });
  } catch (err) {
    res.status(401).json({ 
      error: {
        code: 'LOGIN_FAILED',
        message: err.message 
      }
    });
  }
};

/**
 * Login con Google OAuth2
 */
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ 
        error: {
          code: 'MISSING_TOKEN',
          message: 'El idToken de Google es requerido' 
        }
      });
    }

    const { token, refreshToken, user } = await authService.googleLogin(idToken, req);

    res.json({ 
      accessToken: token, 
      refreshToken, 
      user 
    });
  } catch (err) {
    res.status(401).json({ 
      error: {
        code: 'GOOGLE_AUTH_FAILED',
        message: err.message 
      }
    });
  }
};

/**
 * Refrescar access token usando refresh token
 */
const refreshAccessToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ 
      error: {
        code: 'MISSING_TOKEN',
        message: 'El refresh token es requerido' 
      }
    });
  }

  try {
    const registro = await RefreshToken.findOne({ where: { token, revoked: false } });

    if (!registro || new Date(registro.expires_at) < new Date()) {
      return res.status(403).json({ 
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token inválido o expirado' 
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id_user);

    if (!user) {
      return res.status(404).json({ 
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado' 
        }
      });
    }

    const accessToken = authService.generateAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ 
      error: {
        code: 'TOKEN_VERIFICATION_FAILED',
        message: 'Token inválido o expirado' 
      }
    });
  }
};

/**
 * Logout - Revocar refresh token
 */
const logout = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ 
      error: {
        code: 'MISSING_TOKEN',
        message: 'El refresh token es requerido' 
      }
    });
  }

  try {
    const [affectedRows] = await RefreshToken.update(
      { revoked: true },
      { where: { token } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ 
        error: {
          code: 'TOKEN_NOT_FOUND',
          message: 'Refresh token no encontrado o ya revocado' 
        }
      });
    }

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      error: {
        code: 'LOGOUT_FAILED',
        message: 'Error al cerrar sesión' 
      }
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  refreshAccessToken,
  logout
};
