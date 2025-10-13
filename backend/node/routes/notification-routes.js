const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/notification-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

router.use(verificarToken, verificarUsuarioApp);

router.get('/', controller.listarNotificaciones);
router.get('/unread-count', controller.contarNoLeidas);
router.get('/settings', controller.obtenerConfiguraciones);
router.put('/settings', controller.actualizarConfiguraciones);
router.put('/mark-all-read', controller.marcarTodasComoLeidas);
router.put('/:id/read', controller.marcarComoLeida);

module.exports = router;

