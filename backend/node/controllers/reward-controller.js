/**
 * Reward Controller - Lote 5
 * Maneja endpoints de recompensas y canjes
 */

const rewardService = require('../services/reward-service');
const { rewardMappers } = require('../services/mappers');

// ============================================================================
// REWARDS
// ============================================================================

/**
 * GET /api/rewards
 * Lista recompensas disponibles
 */
const listRewards = async (req, res) => {
  try {
    const query = rewardMappers.toListRewardsQuery(req.query);
    const result = await rewardService.listRewards(query);
    const dto = rewardMappers.toPaginatedRewardsDTO(result);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'LIST_REWARDS_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/rewards/:rewardId
 * Obtiene una recompensa específica
 */
const getReward = async (req, res) => {
  try {
    const rewardId = Number.parseInt(req.params.rewardId, 10);
    const query = rewardMappers.toGetRewardByIdQuery(rewardId);
    const reward = await rewardService.getReward(query);
    const dto = rewardMappers.toRewardDTO(reward);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_REWARD_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * POST /api/rewards
 * Crea una nueva recompensa (admin)
 */
const createReward = async (req, res) => {
  try {
    const createdBy = req.account?.userProfile?.id_user_profile;
    const gymId = req.body.id_gym || null;

    const command = rewardMappers.toCreateRewardCommand(req.body, createdBy, gymId);
    const reward = await rewardService.createReward(command);
    const dto = rewardMappers.toRewardDTO(reward);

    res.status(201).json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'CREATE_REWARD_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * PATCH /api/rewards/:rewardId
 * Actualiza una recompensa (admin)
 */
const updateReward = async (req, res) => {
  try {
    const rewardId = Number.parseInt(req.params.rewardId, 10);
    const updatedBy = req.account?.userProfile?.id_user_profile;

    const command = rewardMappers.toUpdateRewardCommand(req.body, rewardId, updatedBy);
    const reward = await rewardService.updateReward(command);
    const dto = rewardMappers.toRewardDTO(reward);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'UPDATE_REWARD_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * DELETE /api/rewards/:rewardId
 * Elimina una recompensa (admin)
 */
const deleteReward = async (req, res) => {
  try {
    const rewardId = Number.parseInt(req.params.rewardId, 10);
    const deletedBy = req.account?.userProfile?.id_user_profile;

    const command = rewardMappers.toDeleteRewardCommand(rewardId, deletedBy);
    await rewardService.deleteReward(command);

    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'DELETE_REWARD_FAILED',
        message: error.message,
      },
    });
  }
};

// ============================================================================
// REWARD CODES
// ============================================================================

/**
 * GET /api/rewards/:rewardId/codes
 * Lista códigos de una recompensa (admin)
 */
const listRewardCodes = async (req, res) => {
  try {
    const rewardId = Number.parseInt(req.params.rewardId, 10);
    const query = rewardMappers.toListRewardCodesQuery(rewardId, req.query);
    const codes = await rewardService.listRewardCodes(query);

    res.json({ items: codes.map(rewardMappers.toRewardCodeDTO) });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'LIST_CODES_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * POST /api/rewards/:rewardId/codes
 * Crea un código de recompensa (admin)
 */
const createRewardCode = async (req, res) => {
  try {
    const rewardId = Number.parseInt(req.params.rewardId, 10);
    const createdBy = req.account?.userProfile?.id_user_profile;

    const command = rewardMappers.toCreateRewardCodeCommand(req.body, rewardId, createdBy);
    const code = await rewardService.createRewardCode(command);
    const dto = rewardMappers.toRewardCodeDTO(code);

    res.status(201).json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'CREATE_CODE_FAILED',
        message: error.message,
      },
    });
  }
};

// ============================================================================
// CLAIMED REWARDS
// ============================================================================

/**
 * GET /api/users/:userId/claimed-rewards
 * Lista recompensas canjeadas por un usuario
 */
const listClaimedRewards = async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.userId, 10);
    const query = rewardMappers.toListClaimedRewardsQuery(userId, req.query);
    const result = await rewardService.listClaimedRewards(query);
    const dto = rewardMappers.toPaginatedClaimedRewardsDTO(result);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'LIST_CLAIMED_REWARDS_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/claimed-rewards/:claimedRewardId
 * Obtiene una recompensa canjeada específica
 */
const getClaimedReward = async (req, res) => {
  try {
    const claimedRewardId = Number.parseInt(req.params.claimedRewardId, 10);
    const userId = req.account?.userProfile?.id_user_profile;

    const query = rewardMappers.toGetClaimedRewardByIdQuery(claimedRewardId, userId);
    const claimed = await rewardService.getClaimedReward(query);
    const dto = rewardMappers.toClaimedRewardDTO(claimed);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_CLAIMED_REWARD_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * POST /api/rewards/:rewardId/claim
 * Canjea una recompensa por tokens
 */
const claimReward = async (req, res) => {
  try {
    const rewardId = Number.parseInt(req.params.rewardId, 10);
    const userId = req.account?.userProfile?.id_user_profile;

    if (!userId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario autenticado requerido',
        },
      });
    }

    const command = rewardMappers.toClaimRewardCommand(req.body, userId, rewardId);
    const claimed = await rewardService.claimReward(command);
    const dto = rewardMappers.toClaimedRewardDTO(claimed);

    res.status(201).json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'CLAIM_REWARD_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * POST /api/claimed-rewards/:claimedRewardId/use
 * Marca una recompensa canjeada como usada
 */
const markClaimedRewardAsUsed = async (req, res) => {
  try {
    const claimedRewardId = Number.parseInt(req.params.claimedRewardId, 10);
    const userId = req.account?.userProfile?.id_user_profile;

    if (!userId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario autenticado requerido',
        },
      });
    }

    const command = rewardMappers.toMarkClaimedRewardUsedCommand(claimedRewardId, userId);
    const claimed = await rewardService.markClaimedRewardAsUsed(command);
    const dto = rewardMappers.toClaimedRewardDTO(claimed);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'MARK_USED_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/rewards/inventory/me
 * Devuelve el inventario de recompensas del usuario autenticado
 */
const getMyRewardInventory = async (req, res) => {
  try {
    const userId = req.account?.userProfile?.id_user_profile;
    if (!userId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario autenticado requerido',
        },
      });
    }

    const items = await rewardService.getUserRewardInventory(userId);
    const dto = rewardMappers.toUserRewardInventoryDTO(items);
    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_INVENTORY_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/rewards/effects/active
 * Devuelve los efectos activos del usuario autenticado
 */
const getMyActiveEffects = async (req, res) => {
  try {
    const userId = req.account?.userProfile?.id_user_profile;
    if (!userId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario autenticado requerido',
        },
      });
    }

    const payload = await rewardService.getActiveEffectsForUser(userId);
    const dto = rewardMappers.toActiveEffectsResponseDTO(payload);
    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_ACTIVE_EFFECTS_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/rewards/available
 * Lista recompensas disponibles para el usuario autenticado (con contexto)
 */
const listAvailableRewardsForUser = async (req, res) => {
  try {
    const userId = req.account?.userProfile?.id_user_profile;
    if (!userId) {
      return res.status(403).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario autenticado requerido',
        },
      });
    }

    const result = await rewardService.getAvailableRewardsForUser(userId);
    const dto = rewardMappers.toPaginatedRewardsDTO(result);
    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'LIST_AVAILABLE_REWARDS_FAILED',
        message: error.message,
      },
    });
  }
};

module.exports = {
  // Rewards
  listRewards,
  getReward,
  createReward,
  updateReward,
  deleteReward,

  // Reward codes
  listRewardCodes,
  createRewardCode,

  // Claimed rewards
  listClaimedRewards,
  getClaimedReward,
  claimReward,
  markClaimedRewardAsUsed,
  getMyRewardInventory,
  getMyActiveEffects,
  listAvailableRewardsForUser,

  // Legacy aliases (Spanish) for backward compatibility
  listarTodasLasRecompensas: listRewards,
  obtenerRecompensaPorId: getReward,
  crearRecompensa: createReward,
  actualizarRecompensa: updateReward,
  eliminarRecompensa: deleteReward,
  obtenerEstadisticasDeRecompensas: async (req, res) => {
    // Placeholder - returns empty array for now
    res.json({ message: 'Estadísticas no disponibles', data: [] });
  },
};
