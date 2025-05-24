const express = require('express');
const router = express.Router();
const controller = require('../controllers/progress-controller');

router.post('/', controller.registrarProgreso);
router.get('/:id_user/ejercicios/:id_exercise/promedio', controller.obtenerPromedioLevantamiento);
router.get('/:id_user/ejercicios/:id_exercise/mejor', controller.obtenerMejorLevantamiento);
router.get('/:id_user/ejercicios/:id_exercise', controller.obtenerHistorialPorEjercicio);
router.get('/:id_user/ejercicios', controller.obtenerHistorialEjercicios);
router.get('/:id_user/estadistica', controller.obtenerEstadisticaPeso); // primero
router.get('/:id_user', controller.obtenerProgresoPorUsuario);          // después

module.exports = router;
