/**
 * Handler para eventos de usuarios en tiempo real
 * Gestiona actualizaciones de perfil, suscripciones, tokens, etc.
 */

/**
 * Registra los event handlers de usuario
 * @param {Socket} socket - Socket del cliente
 * @param {Server} io - Instancia de Socket.IO
 */
function register(socket, io) {
  const user = socket.user;

  // Usuario se suscribe explícitamente a sus propios eventos de perfil
  socket.on('user:subscribe:profile', () => {
    socket.join(`user-profile:${user.id_user_profile}`);
    socket.emit('user:subscribed:profile', {
      success: true,
      userId: user.id_user_profile,
      message: 'Subscribed to profile updates'
    });
    console.log(`[User] ✅ ${user.email} subscribed to profile updates`);
  });

  // Usuario se desuscribe de eventos de perfil
  socket.on('user:unsubscribe:profile', () => {
    socket.leave(`user-profile:${user.id_user_profile}`);
    socket.emit('user:unsubscribed:profile', {
      success: true,
      message: 'Unsubscribed from profile updates'
    });
    console.log(`[User] User ${user.email} unsubscribed from profile updates`);
  });

  // Usuario se suscribe a eventos de tokens
  socket.on('user:subscribe:tokens', () => {
    socket.join(`user-tokens:${user.id_user_profile}`);
    socket.emit('user:subscribed:tokens', {
      success: true,
      userId: user.id_user_profile,
      message: 'Subscribed to token updates'
    });
    console.log(`[User] ✅ ${user.email} subscribed to token updates`);
  });

  // Usuario se desuscribe de eventos de tokens
  socket.on('user:unsubscribe:tokens', () => {
    socket.leave(`user-tokens:${user.id_user_profile}`);
    socket.emit('user:unsubscribed:tokens', {
      success: true,
      message: 'Unsubscribed from token updates'
    });
    console.log(`[User] User ${user.email} unsubscribed from token updates`);
  });
}

/**
 * Función auxiliar para emitir actualización de tokens a un usuario
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} userId - ID del perfil de usuario
 * @param {Object} tokenData - Datos de la actualización de tokens
 */
function emitUserTokensUpdated(io, userId, tokenData) {
  try {
    console.log(`💰💰💰 [User Handler] TOKENS UPDATED EVENT for user ${userId}! 💰💰💰`);
    console.log(`[User Handler] Previous: ${tokenData.previousBalance}, New: ${tokenData.newBalance}, Delta: ${tokenData.delta}`);
    console.log(`[User Handler] Emitting to rooms: user:${userId} and user-tokens:${userId}`);

    // Emitir a la room del usuario general
    io.to(`user:${userId}`).emit('user:tokens:updated', {
      newBalance: tokenData.newBalance,
      previousBalance: tokenData.previousBalance,
      delta: tokenData.delta,
      reason: tokenData.reason,
      timestamp: tokenData.timestamp || new Date().toISOString()
    });

    // También emitir a la room específica de tokens si el usuario está suscrito
    io.to(`user-tokens:${userId}`).emit('user:tokens:updated', {
      newBalance: tokenData.newBalance,
      previousBalance: tokenData.previousBalance,
      delta: tokenData.delta,
      reason: tokenData.reason,
      timestamp: tokenData.timestamp || new Date().toISOString()
    });

    console.log(`[User Handler] ✅ Tokens event emitted successfully!`);
  } catch (error) {
    console.error(`[User Handler] Error emitting tokens updated:`, error.message);
  }
}

/**
 * Función auxiliar para emitir actualización de suscripción a un usuario
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} userId - ID del perfil de usuario
 * @param {Object} subscriptionData - Datos de la actualización de suscripción
 */
function emitUserSubscriptionUpdated(io, userId, subscriptionData) {
  try {
    console.log(`👑👑👑 [User Handler] SUBSCRIPTION UPDATED EVENT for user ${userId}! 👑👑👑`);
    console.log(`[User Handler] Previous: ${subscriptionData.previousSubscription}, New: ${subscriptionData.newSubscription}`);
    console.log(`[User Handler] Is Premium: ${subscriptionData.isPremium}`);
    console.log(`[User Handler] Emitting to rooms: user:${userId} and user-profile:${userId}`);

    // Emitir a la room del usuario general
    io.to(`user:${userId}`).emit('user:subscription:updated', {
      previousSubscription: subscriptionData.previousSubscription,
      newSubscription: subscriptionData.newSubscription,
      isPremium: subscriptionData.isPremium,
      premiumSince: subscriptionData.premiumSince,
      premiumExpires: subscriptionData.premiumExpires,
      timestamp: subscriptionData.timestamp || new Date().toISOString()
    });

    // También emitir a la room específica de perfil si el usuario está suscrito
    io.to(`user-profile:${userId}`).emit('user:subscription:updated', {
      previousSubscription: subscriptionData.previousSubscription,
      newSubscription: subscriptionData.newSubscription,
      isPremium: subscriptionData.isPremium,
      premiumSince: subscriptionData.premiumSince,
      premiumExpires: subscriptionData.premiumExpires,
      timestamp: subscriptionData.timestamp || new Date().toISOString()
    });

    console.log(`[User Handler] ✅ Subscription event emitted successfully!`);
  } catch (error) {
    console.error(`[User Handler] Error emitting subscription updated:`, error.message);
  }
}

/**
 * Función auxiliar para emitir actualización de perfil a un usuario
 * @param {Server} io - Instancia de Socket.IO
 * @param {number} userId - ID del perfil de usuario
 * @param {Object} profileData - Datos del perfil actualizado
 */
function emitUserProfileUpdated(io, userId, profileData) {
  try {
    io.to(`user:${userId}`).emit('user:profile:updated', {
      profile: profileData,
      timestamp: new Date().toISOString()
    });

    io.to(`user-profile:${userId}`).emit('user:profile:updated', {
      profile: profileData,
      timestamp: new Date().toISOString()
    });

    console.log(`[User] Emitted profile updated to user ${userId}`);
  } catch (error) {
    console.error(`[User] Error emitting profile updated:`, error.message);
  }
}

module.exports = {
  register,
  emitUserTokensUpdated,
  emitUserSubscriptionUpdated,
  emitUserProfileUpdated
};
