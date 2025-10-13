const express = require('express');
const router = express.Router();
const controller = require('../controllers/webhook-controller');

router.post('/mercadopago', controller.mercadopagoWebhook);

module.exports = router;

