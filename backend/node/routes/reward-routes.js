const express = require('express');
const router = express.Router();
const controller = require('../controllers/reward-controller');

router.get('/', controller.listarRecompensas);
router.post('/canjear', controller.canjearRecompensa);
router.get('/historial/:id_user', controller.obtenerHistorialRecompensas);

module.exports = router;
