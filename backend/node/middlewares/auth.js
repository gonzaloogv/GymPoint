const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) throw new Error('JWT_SECRET is required');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

const verificarRol = (rolPermitido) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== rolPermitido) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};

const verificarRolMultiple = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol,
  verificarRolMultiple
};
