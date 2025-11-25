const jwt = require('jsonwebtoken');
const { Account, UserProfile } = require('../../models');

const SECRET = process.env.JWT_SECRET || 'gympoint_secret_key';

/**
 * Middleware de autenticación para WebSocket
 * Valida el token JWT y adjunta la información del usuario al socket
 */
async function authenticateSocket(socket, next) {
  try {
    // Obtener token desde handshake (auth object o headers)
    const token = socket.handshake.auth.token ||
                  socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, SECRET);

    // Cargar cuenta y perfil del usuario
    const account = await Account.findByPk(decoded.id, {
      include: [{
        model: UserProfile,
        as: 'userProfile',
        required: false
      }]
    });

    if (!account || !account.is_active) {
      return next(new Error('Invalid or inactive account'));
    }

    // Adjuntar información del usuario al socket
    socket.user = {
      id_account: account.id_account,
      id_user_profile: account.userProfile?.id_user_profile,
      email: account.email,
      roles: decoded.roles || [],
      subscription_type: account.userProfile?.subscription_type || 'FREE'
    };

    console.log(`[WebSocket] User authenticated: ${account.email} (Account: ${account.id_account})`);
    next();
  } catch (error) {
    console.error('[WebSocket] Authentication failed:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token expired'));
    }

    return next(new Error('Authentication failed'));
  }
}

module.exports = { authenticateSocket };
