const express = require('express');
const router = express.Router();
const controller = require('../controllers/user-routine-controller');

router.get('/:id_user/active-routine', controller.getActiveRoutineWithExercises); // Primero
router.post('/', controller.assignRoutineToUser);
router.get('/:id_user', controller.getActiveRoutine); // Luego
router.put('/:id_user/end', controller.endUserRoutine);

module.exports = router;
