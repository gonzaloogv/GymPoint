const authService = require('../services/auth-service');

/**
 * Registrar un nuevo usuario con email y contraseña
 * 
 * Body esperado:
 * - email, password, name, lastname
 * - frequency_goal (opcional, default: 3)
 * - gender, locality, age (opcionales)
 */
const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    
    // Retornar datos para el cliente
    res.status(201).json({
      message: 'Usuario registrado con éxito',
      data: {
        id: result.id_user,
        email: result.email,
        name: result.name,
        lastname: result.lastname,
        subscription: result.subscription
      }
    });
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
    const { token, refreshToken, account, profile } = await authService.login(email, password, req);

    // Construir respuesta según el tipo de perfil
    const user = {
      id: account.id_account,
      email: account.email,
      roles: account.roles.map(r => r.role_name)
    };

    // Agregar datos del perfil
    if (profile) {
      user.name = profile.name;
      user.lastname = profile.lastname;
      
      if (profile.subscription) {
        // Es UserProfile
        user.subscription = profile.subscription;
        user.tokens = profile.tokens;
        user.id_user_profile = profile.id_user_profile;
      } else if (profile.department) {
        // Es AdminProfile
        user.department = profile.department;
        user.id_admin_profile = profile.id_admin_profile;
      }
    }

    res.json({
      message: 'Login exitoso',
      data: { accessToken: token, refreshToken, user }
    });
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

    const { token, refreshToken, account, profile } = await authService.googleLogin(idToken, req);

    // Construir respuesta
    const user = {
      id: account.id_account,
      email: account.email,
      name: profile.name,
      lastname: profile.lastname,
      subscription: profile.subscription,
      tokens: profile.tokens,
      id_user_profile: profile.id_user_profile,
      roles: account.roles.map(r => r.role_name)
    };

    res.json({
      message: 'Login con Google exitoso',
      data: { 
        accessToken: token, 
        refreshToken, 
        user 
      }
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
    // Usar el nuevo método del service
    const result = await authService.refreshAccessToken(token);
    res.json({
      message: 'Token refrescado con éxito',
      data: result
    });
  } catch (err) {
    res.status(401).json({ 
      error: {
        code: 'TOKEN_REFRESH_FAILED',
        message: err.message 
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
    // Usar el nuevo método del service
    await authService.logout(token);
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
