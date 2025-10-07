module.exports = {
  // Tokens
  TOKENS: {
    ATTENDANCE: parseInt(process.env.TOKENS_ATTENDANCE || '10'),
    ROUTINE_COMPLETE: parseInt(process.env.TOKENS_ROUTINE_COMPLETED || '15'),
    WEEKLY_BONUS: parseInt(process.env.WEEKLY_GOAL_BONUS || '20')
  },

  // Proximity
  PROXIMITY_METERS: parseInt(process.env.PROXIMITY_M || '180'),

  // Pagination
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,

  // Auth
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || '15m',
  REFRESH_TOKEN_TTL_DAYS: 30,

  // Gym search
  MAX_SEARCH_RADIUS_KM: 100,
  DEFAULT_SEARCH_RADIUS_KM: 5,

  // Token reasons
  TOKEN_REASONS: {
    ATTENDANCE: 'ATTENDANCE',
    ROUTINE_COMPLETE: 'ROUTINE_COMPLETE',
    REWARD_CLAIM: 'REWARD_CLAIM',
    WEEKLY_BONUS: 'WEEKLY_BONUS',
    ADMIN_ADJUSTMENT: 'ADMIN_ADJUSTMENT',
    STREAK_RECOVERY: 'STREAK_RECOVERY'
  },

  // Reward providers
  REWARD_PROVIDERS: {
    SYSTEM: 'system',
    GYM: 'gym'
  },

  // Subscription types
  SUBSCRIPTION_TYPES: {
    FREE: 'FREE',
    PREMIUM: 'PREMIUM'
  },

  // User roles
  ROLES: {
    USER: 'USER',
    ADMIN: 'ADMIN'
  }
};
