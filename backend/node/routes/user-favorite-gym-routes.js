/**
 * UserFavoriteGym Routes - Lote 9
 * Rutas para gestión de gimnasios favoritos
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-favorite-gym-controller');
const { verificarToken, verificarUsuarioApp, verificarAdmin } = require('../middlewares/auth');

// ============================================================================
// USER FAVORITE GYMS
// ============================================================================

/**
 * GET /api/favorites
 * Lista los gimnasios favoritos del usuario autenticado
 */
router.get('/', verificarToken, verificarUsuarioApp, controller.listFavoriteGyms);

/**
 * POST /api/favorites
 * Añade un gimnasio a favoritos
 */
router.post('/', verificarToken, verificarUsuarioApp, controller.addFavoriteGym);

/**
 * DELETE /api/favorites/:gymId
 * Elimina un gimnasio de favoritos
 */
router.delete('/:gymId', verificarToken, verificarUsuarioApp, controller.removeFavoriteGym);

/**
 * GET /api/favorites/:gymId/check
 * Verifica si un gimnasio es favorito
 */
router.get('/:gymId/check', verificarToken, verificarUsuarioApp, controller.checkIsFavorite);

/**
 * GET /api/favorites/count
 * Cuenta los gimnasios favoritos del usuario
 */
router.get('/count', verificarToken, verificarUsuarioApp, controller.countFavoriteGyms);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * GET /api/favorites/gym/:gymId/users
 * Lista usuarios que marcaron un gimnasio como favorito (Admin)
 */
router.get('/gym/:gymId/users', verificarToken, verificarAdmin, controller.listUsersWhoFavorited);

module.exports = router;
