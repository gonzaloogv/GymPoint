const express = require('express');
const router = express.Router();
const controller = require('../controllers/transaction-controller');

router.get('/:id_user', controller.obtenerTransaccionesPorUsuario);

module.exports = router;
