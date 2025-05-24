const express = require('express');
const router = express.Router();
const controller = require('../controllers/frequency-controller');

router.post('/', controller.crearMeta);
router.get('/:id_user', controller.consultarMetaSemanal);
router.put('/reset', controller.reiniciarSemana);

module.exports = router;
