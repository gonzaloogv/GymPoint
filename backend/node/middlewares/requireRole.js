/**
 * Middleware simplificado: Require Role
 * 
 * Verifica que el usuario tenga el rol especificado.
 * Debe usarse despuÃ©s de verificarToken.
 * 
 * @param {string} role - Rol requerido ('ADMIN', 'USER', 'PREMIUM')
 * @returns {Function} Middleware function
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user?.roles?.includes(role)) {
      return res.status(403).json({ 
        error: { 
          code: 'FORBIDDEN', 
          message: 'Insufficient role' 
        } 
      });
    }
    next();
  };
};

module.exports = requireRole;
