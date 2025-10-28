const jwt = require('jsonwebtoken');
const { Account, Role, UserProfile, AdminProfile } = require('../models');

const SECRET = process.env.JWT_SECRET || 'gympoint_secret_key';

/**
 * Middleware: Verificar Token JWT
 * 
 * Decodifica el token y carga el Account + perfil correspondiente.
 * Adjunta al request: req.account, req.profile, req.user (retrocompat)
 */
const verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: { 
        code: 'AUTH_REQUIRED', 
        message: 'Token requerido' 
      } 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Decodificar token
    const decoded = jwt.verify(token, SECRET);
    
    // Cargar Account completo con roles y perfil
    const account = await Account.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        },
        {
          model: UserProfile,
          as: 'userProfile',
          required: false
        },
        {
          model: AdminProfile,
          as: 'adminProfile',
          required: false
        }
      ]
    });

    if (!account) {
      return res.status(401).json({ 
        error: { 
          code: 'ACCOUNT_NOT_FOUND', 
          message: 'Cuenta no encontrada' 
        } 
      });
    }

    if (!account.is_active) {
      return res.status(403).json({ 
        error: { 
          code: 'ACCOUNT_DISABLED', 
          message: 'Cuenta deshabilitada' 
        } 
      });
    }

    // Adjuntar al request
    req.account = account;
    req.profile = account.userProfile || account.adminProfile;
    req.roles = account.roles.map(r => r.role_name);

    // Retrocompatibilidad con cÃ³digo existente
    req.user = {
      id: decoded.id,
      id_account: account.id_account,
      id_user_profile: account.userProfile?.id_user_profile,
      id_admin_profile: account.adminProfile?.id_admin_profile,
      email: account.email,
      roles: req.roles,
      subscription: account.userProfile?.app_tier || null
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: { 
          code: 'TOKEN_EXPIRED', 
          message: 'Token expirado' 
        } 
      });
    }
    
    return res.status(403).json({ 
      error: { 
        code: 'TOKEN_INVALID', 
        message: 'Token invalido' 
      } 
    });
  }
};

/**
 * Middleware: Verificar Rol Ãšnico
 * 
 * Verifica que el usuario tenga un rol especÃ­fico.
 * 
 * @param {string} rolRequerido - Rol requerido (USER, ADMIN)
 */
const verificarRol = (rolRequerido) => {
  return (req, res, next) => {
    if (!req.roles || !req.roles.includes(rolRequerido)) {
      return res.status(403).json({ 
        error: { 
          code: 'INSUFFICIENT_PERMISSIONS', 
          message: `Requiere rol: ${rolRequerido}` 
        } 
      });
    }
    next();
  };
};

/**
 * Middleware: Verificar MÃºltiples Roles
 * 
 * Verifica que el usuario tenga al menos uno de los roles especificados.
 * 
 * @param {string[]} rolesPermitidos - Array de roles permitidos
 */
const verificarRolMultiple = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.roles || !req.roles.some(r => rolesPermitidos.includes(r))) {
      return res.status(403).json({ 
        error: { 
          code: 'INSUFFICIENT_PERMISSIONS', 
          message: `Requiere uno de los roles: ${rolesPermitidos.join(', ')}` 
        } 
      });
    }
    next();
  };
};

/**
 * Middleware: Verificar Admin
 * 
 * Verifica que el usuario sea administrador del sistema.
 */
const verificarAdmin = (req, res, next) => {
  if (!req.roles || !req.roles.includes('ADMIN')) {
    return res.status(403).json({ 
      error: { 
        code: 'ADMIN_REQUIRED', 
        message: 'Requiere permisos de administrador' 
      } 
    });
  }
  
  if (!req.account.adminProfile) {
    return res.status(403).json({ 
      error: { 
        code: 'ADMIN_PROFILE_REQUIRED', 
        message: 'Perfil de administrador no encontrado' 
      } 
    });
  }
  
  next();
};

/**
 * Middleware: Verificar Usuario de App
 * 
 * Verifica que el usuario sea un usuario final (no admin).
 */
const verificarUsuarioApp = (req, res, next) => {
  if (!req.roles || !req.roles.includes('USER')) {
    return res.status(403).json({ 
      error: { 
        code: 'USER_REQUIRED', 
        message: 'Requiere cuenta de usuario' 
      } 
    });
  }
  
  if (!req.account.userProfile) {
    return res.status(403).json({ 
      error: { 
        code: 'USER_PROFILE_REQUIRED', 
        message: 'Perfil de usuario no encontrado' 
      } 
    });
  }
  
  next();
};

/**
 * Middleware: Verificar SuscripciÃ³n
 * 
 * Verifica que el usuario tenga una suscripciÃ³n especÃ­fica.
 * 
 * @param {string} nivelRequerido - Nivel requerido (FREE, PREMIUM)
 */
const verificarSuscripcion = (nivelRequerido) => {
  return (req, res, next) => {
    // Primero verificar que sea usuario
    if (!req.roles || !req.roles.includes('USER')) {
      return res.status(403).json({ 
        error: { 
          code: 'USER_REQUIRED', 
          message: 'Solo disponible para usuarios' 
        } 
      });
    }

    if (!req.account.userProfile) {
      return res.status(403).json({ 
        error: { 
          code: 'USER_PROFILE_REQUIRED', 
          message: 'Perfil de usuario no encontrado' 
        } 
      });
    }

    const subscription = req.account.userProfile.app_tier;

    // Si requiere PREMIUM, FREE no es suficiente
    if (nivelRequerido === 'PREMIUM' && subscription !== 'PREMIUM') {
      return res.status(403).json({ 
        error: { 
          code: 'PREMIUM_REQUIRED', 
          message: 'Requiere suscripciÃ³n Premium' 
        } 
      });
    }

    next();
  };
};

/**
 * Shortcut: Verificar Premium
 */
const verificarPremium = verificarSuscripcion('PREMIUM');

/**
 * Middleware: Verificar Propiedad del Recurso
 * 
 * Verifica que el usuario sea dueÃ±o del recurso.
 * El ID del recurso se obtiene de req.params.id o el campo especificado.
 * 
 * @param {string} idField - Campo del request que contiene el ID del propietario (default: 'id_user_profile')
 */
const verificarPropiedad = (idField = 'id_user_profile') => {
  return (req, res, next) => {
    const userProfileId = req.account?.userProfile?.id_user_profile;
    const resourceOwnerId = req.params[idField] || req.body[idField];

    if (!userProfileId) {
      return res.status(403).json({ 
        error: { 
          code: 'USER_PROFILE_REQUIRED', 
          message: 'Perfil de usuario no encontrado' 
        } 
      });
    }

    // Admin puede acceder a todo
    if (req.roles && req.roles.includes('ADMIN')) {
      return next();
    }

    // Verificar que el recurso pertenezca al usuario
    if (parseInt(resourceOwnerId) !== userProfileId) {
      return res.status(403).json({ 
        error: { 
          code: 'RESOURCE_FORBIDDEN', 
          message: 'No tienes permiso para acceder a este recurso' 
        } 
      });
    }

    next();
  };
};



/**
 * Alias simplificado para verificarRol
 */
const requireRole = verificarRol;

module.exports = {
  requireRole,
  verificarToken,
  verificarRol,
  verificarRolMultiple,
  verificarAdmin,
  verificarUsuarioApp,
  verificarSuscripcion,
  verificarPremium,
  verificarPropiedad
};



