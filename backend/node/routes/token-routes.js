const express = require('express');
const router = express.Router();
const controller = require('../controllers/token-controller');

router.post('/ganar', controller.otorgarTokens);
router.get('/saldo/:id_user', controller.obtenerResumenTokens);

module.exports = router;
