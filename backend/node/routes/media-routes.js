const express = require('express');
const router = express.Router();
const controller = require('../controllers/media-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

router.get('/:entity_type/:entity_id', controller.listarMedia);
router.get('/', controller.listarMedia);
router.post('/', verificarToken, verificarUsuarioApp, controller.crearMedia);
router.post('/:id_media/primary', verificarToken, verificarUsuarioApp, controller.establecerPrincipal);
router.delete('/:id_media', verificarToken, verificarUsuarioApp, controller.eliminarMedia);

module.exports = router;
