const { Account, UserProfile, AdminProfile, Role, AccountRole } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Obtener estadísticas generales del sistema
 * @returns {Promise<Object>} Estadísticas
 */
const obtenerEstadisticas = async () => {
  // Contar usuarios por suscripción
  const [subscriptionStats] = await sequelize.query(`
    SELECT
      app_tier as subscription,
      COUNT(*) as count
    FROM user_profiles
    GROUP BY app_tier
  `);

  // Contar usuarios por rol
  const [roleStats] = await sequelize.query(`
    SELECT 
      r.role_name,
      COUNT(*) as count
    FROM account_roles ar
    JOIN roles r ON ar.id_role = r.id_role
    GROUP BY r.role_name
  `);

  // Total de usuarios activos
  const totalActive = await Account.count({
    where: { is_active: true },
    include: {
      model: UserProfile,
      as: 'userProfile',
      required: true
    }
  });

  // Total de admins
  const totalAdmins = await AdminProfile.count();

  // Registros recientes (últimos 30 días)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUsers = await UserProfile.count({
    where: {
      created_at: {
        [Op.gte]: thirtyDaysAgo
      }
    }
  });

  // Total de tokens en circulación
  const [tokensResult] = await sequelize.query(`
    SELECT SUM(tokens) as total_tokens
    FROM user_profiles
  `);

  return {
    users: {
      total: totalActive,
      by_subscription: subscriptionStats,
      recent_registrations: recentUsers
    },
    admins: {
      total: totalAdmins
    },
    roles: roleStats,
    tokens: {
      total_in_circulation: tokensResult[0]?.total_tokens || 0
    },
    timestamp: new Date()
  };
};

/**
 * Listar todos los usuarios con paginación y filtros
 * @param {Object} options - Opciones de listado
 * @param {number} options.page - Página (default: 1)
 * @param {number} options.limit - Límite por página (default: 20, max: 100)
 * @param {string} options.subscription - Filtrar por suscripción (FREE, PREMIUM)
 * @param {string} options.search - Buscar por nombre, apellido o email
 * @param {string} options.sortBy - Campo para ordenar (created_at, tokens, name)
 * @param {string} options.order - Orden (ASC, DESC)
 * @returns {Promise<Object>} Lista paginada de usuarios
 */
const listarUsuarios = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    subscription,
    search,
    sortBy = 'created_at',
    order = 'DESC'
  } = options;

  // Validar límite
  const validLimit = Math.min(Math.max(1, parseInt(limit)), 100);
  const offset = (parseInt(page) - 1) * validLimit;

  // Construir filtros
  const where = {};
  if (subscription) {
    where.app_tier = subscription;
  }

  // Búsqueda
  const includeWhere = {};
  if (search) {
    includeWhere.email = {
      [Op.like]: `%${search}%`
    };
  }

  // Búsqueda en nombre/apellido
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { lastname: { [Op.like]: `%${search}%` } }
    ];
  }

  // Obtener usuarios
  const { count, rows } = await UserProfile.findAndCountAll({
    where,
    include: {
      model: Account,
      as: 'account',
      attributes: ['id_account', 'email', 'auth_provider', 'is_active', 'last_login'],
      where: Object.keys(includeWhere).length > 0 ? includeWhere : undefined
    },
    order: [[sortBy, order]],
    limit: validLimit,
    offset
  });

  // Mapear resultados
  const users = rows.map(profile => ({
    id_user_profile: profile.id_user_profile,
    id_account: profile.id_account,
    email: profile.account.email,
    name: profile.name,
    lastname: profile.lastname,
    subscription: profile.app_tier,
    tokens: profile.tokens,
    is_active: profile.account.is_active,
    auth_provider: profile.account.auth_provider,
    last_login: profile.account.last_login,
    created_at: profile.created_at
  }));

  return {
    users,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: validLimit,
      total_pages: Math.ceil(count / validLimit)
    }
  };
};

/**
 * Buscar usuario por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Usuario encontrado
 */
const buscarUsuarioPorEmail = async (email) => {
  const account = await Account.findOne({
    where: { email },
    include: [
      {
        model: UserProfile,
        as: 'userProfile',
        required: false
      },
      {
        model: AdminProfile,
        as: 'adminProfile',
        required: false
      },
      {
        model: Role,
        as: 'roles',
        through: { attributes: [] }
      }
    ]
  });

  if (!account) {
    throw new Error('Usuario no encontrado');
  }

  const profile = account.userProfile || account.adminProfile;
  const isAdmin = account.roles.some(r => r.role_name === 'ADMIN');

  return {
    id_account: account.id_account,
    email: account.email,
    auth_provider: account.auth_provider,
    is_active: account.is_active,
    email_verified: account.email_verified,
    last_login: account.last_login,
    roles: account.roles.map(r => r.role_name),
    profile: profile ? {
      id: isAdmin ? profile.id_admin_profile : profile.id_user_profile,
      name: profile.name,
      lastname: profile.lastname,
      type: isAdmin ? 'admin' : 'user',
      ...(profile.app_tier && { subscription: profile.app_tier }),
      ...(profile.tokens !== undefined && { tokens: profile.tokens }),
      ...(profile.department && { department: profile.department })
    } : null
  };
};

/**
 * Desactivar cuenta de usuario
 * @param {number} idAccount - ID del account
 * @returns {Promise<void>}
 */
const desactivarCuenta = async (idAccount) => {
  const account = await Account.findByPk(idAccount);
  
  if (!account) {
    throw new Error('Cuenta no encontrada');
  }

  if (!account.is_active) {
    throw new Error('La cuenta ya está desactivada');
  }

  await account.update({ is_active: false });

  // Revocar refresh tokens
  const RefreshToken = require('../models/RefreshToken');
  const userProfile = await UserProfile.findOne({ where: { id_account: idAccount } });
  
  if (userProfile) {
    await RefreshToken.update(
      { revoked: true },
      { where: { id_user: userProfile.id_user_profile } }
    );
  }
};

/**
 * Activar cuenta de usuario
 * @param {number} idAccount - ID del account
 * @returns {Promise<void>}
 */
const activarCuenta = async (idAccount) => {
  const account = await Account.findByPk(idAccount);
  
  if (!account) {
    throw new Error('Cuenta no encontrada');
  }

  if (account.is_active) {
    throw new Error('La cuenta ya está activa');
  }

  await account.update({ is_active: true });
};

/**
 * Obtener actividad reciente del sistema
 * @param {number} days - Días hacia atrás (default: 7)
 * @returns {Promise<Array>} Actividad reciente
 */
const obtenerActividadReciente = async (days = 7) => {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  // Registros de usuarios
  const newUsers = await UserProfile.findAll({
    where: {
      created_at: {
        [Op.gte]: dateFrom
      }
    },
    include: {
      model: Account,
      as: 'account',
      attributes: ['email']
    },
    order: [['created_at', 'DESC']],
    limit: 50
  });

  // Últimos logins
  const recentLogins = await Account.findAll({
    where: {
      last_login: {
        [Op.gte]: dateFrom
      }
    },
    include: [
      {
        model: UserProfile,
        as: 'userProfile',
        attributes: ['name', 'lastname'],
        required: false
      },
      {
        model: AdminProfile,
        as: 'adminProfile',
        attributes: ['name', 'lastname'],
        required: false
      }
    ],
    order: [['last_login', 'DESC']],
    limit: 50
  });

  return {
    new_users: newUsers.map(u => ({
      id_user_profile: u.id_user_profile,
      email: u.account.email,
      name: `${u.name} ${u.lastname}`,
      created_at: u.created_at
    })),
    recent_logins: recentLogins.map(a => ({
      email: a.email,
      name: a.userProfile 
        ? `${a.userProfile.name} ${a.userProfile.lastname}`
        : a.adminProfile
        ? `${a.adminProfile.name} ${a.adminProfile.lastname} (Admin)`
        : 'Unknown',
      last_login: a.last_login
    }))
  };
};

/**
 * Obtener logs de transacciones de tokens
 * @param {number} idUserProfile - ID del user_profile (opcional)
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<Array>} Transacciones
 */
const obtenerTransacciones = async (idUserProfile = null, options = {}) => {
  const { TokenLedger } = require('../models');
  const { limit = 50, page = 1 } = options;

  const where = idUserProfile ? { id_user_profile: idUserProfile } : {};
  const offset = (page - 1) * limit;

  const { count, rows } = await TokenLedger.findAndCountAll({
    where,
    include: {
      model: UserProfile,
      as: 'userProfile',
      attributes: ['name', 'lastname'],
      include: {
        model: Account,
        as: 'account',
        attributes: ['email']
      }
    },
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  return {
    transactions: rows.map(t => ({
      id_ledger: t.id_ledger,
      id_user_profile: t.id_user_profile,
      user: t.userProfile ? {
        name: `${t.userProfile.name} ${t.userProfile.lastname}`,
        email: t.userProfile.account?.email
      } : null,
      delta: t.delta,
      reason: t.reason,
      ref_type: t.ref_type,
      ref_id: t.ref_id,
      balance_after: t.balance_after,
      created_at: t.created_at
    })),
    pagination: {
      total: count,
      page,
      limit,
      total_pages: Math.ceil(count / limit)
    }
  };
};

module.exports = {
  obtenerEstadisticas,
  listarUsuarios,
  buscarUsuarioPorEmail,
  desactivarCuenta,
  activarCuenta,
  obtenerActividadReciente,
  obtenerTransacciones
};

