/**
 * Token Controller - Lote 5
 * Maneja endpoints de tokens (balance, historial, operaciones)
 */

const tokenService = require('../services/token-service');
const { rewardMappers } = require('../services/mappers');

// ============================================================================
// TOKEN OPERATIONS
// ============================================================================

/**
 * POST /api/users/:userId/tokens/add
 * Añade tokens a un usuario (admin)
 */
const addTokens = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const command = rewardMappers.toAddTokensCommand(req.body, userId);
    const result = await tokenService.addTokens(command);

    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'ADD_TOKENS_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * POST /api/users/:userId/tokens/spend
 * Gasta tokens de un usuario (admin/system)
 */
const spendTokens = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const command = rewardMappers.toSpendTokensCommand(req.body, userId);
    const result = await tokenService.spendTokens(command);

    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      error: {
        code: error.code || 'SPEND_TOKENS_FAILED',
        message: error.message,
      },
    });
  }
};

// ============================================================================
// TOKEN QUERIES
// ============================================================================

/**
 * GET /api/users/:userId/tokens/balance
 * Obtiene el balance de tokens de un usuario
 */
const getTokenBalance = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const query = rewardMappers.toGetTokenBalanceQuery(userId);
    const balance = await tokenService.getTokenBalance(query);
    const dto = rewardMappers.toTokenBalanceDTO(balance.userId, balance.balance);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_BALANCE_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/users/:userId/tokens/ledger
 * Lista el historial de movimientos de tokens
 */
const listTokenLedger = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const query = rewardMappers.toListTokenLedgerQuery(userId, req.query);
    const result = await tokenService.listTokenLedger(query);
    const dto = rewardMappers.toPaginatedTokenLedgerDTO(result);

    res.json(dto);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_LEDGER_FAILED',
        message: error.message,
      },
    });
  }
};

/**
 * GET /api/users/:userId/tokens/stats
 * Obtiene estadísticas de tokens de un usuario
 */
const getTokenStats = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const query = rewardMappers.toGetTokenBalanceQuery(userId);
    const stats = await tokenService.getTokenStats(query);

    res.json(stats);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'GET_STATS_FAILED',
        message: error.message,
      },
    });
  }
};

module.exports = {
  addTokens,
  spendTokens,
  getTokenBalance,
  listTokenLedger,
  getTokenStats,
};
