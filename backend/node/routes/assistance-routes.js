const express = require('express');
const router = express.Router();
const assistanceController = require('../controllers/assistance-controller');

router.post('/', assistanceController.registrarAsistencia);

module.exports = router;
