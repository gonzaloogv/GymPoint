const express = require('express');
const router = express.Router();
const controller = require('../controllers/assistance-controller');

// Registrar asistencia con validación GPS + tokens + racha
router.post('/registrar', controller.registrarAsistencia);
router.get('/:id_user', controller.obtenerHistorialAsistencias);


// Podés agregar otros endpoints como historial más adelante

module.exports = router;
