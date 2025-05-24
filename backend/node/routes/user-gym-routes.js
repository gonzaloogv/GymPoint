const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-gym-controller');

router.post('/alta', controller.darAltaEnGimnasio);
router.put('/baja', controller.darBajaEnGimnasio);
router.get('/gimnasio/:id_gym/conteo', controller.contarUsuariosActivosEnGimnasio);
router.get('/historial/:id_user', controller.obtenerHistorialGimnasiosPorUsuario);
router.get('/gimnasio/:id_gym', controller.obtenerHistorialUsuariosPorGimnasio);
router.get('/activos/:id_user', controller.obtenerGimnasiosActivos);

module.exports = router;
