const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routine-controller');

router.post('/', routineController.createRoutineWithExercises);
router.get('/user/:id_user', routineController.getRoutinesByUser); // <-- primero
router.get('/:id', routineController.getRoutineWithExercises);
router.put('/:id', routineController.updateRoutine);
router.put('/:id/exercises/:id_exercise', routineController.updateRoutineExercise);
router.delete('/:id', routineController.deleteRoutine);
router.delete('/:id/exercises/:id_exercise', routineController.deleteRoutineExercise);

module.exports = router;
