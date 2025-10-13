const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment-controller');
const { verificarToken, verificarUsuarioApp } = require('../middlewares/auth');

router.use(verificarToken);

router.post('/create-preference', verificarUsuarioApp, controller.crearPreferencia);
router.get('/history', verificarUsuarioApp, controller.historialPagos);
router.get('/:id', controller.obtenerPago);

module.exports = router;

