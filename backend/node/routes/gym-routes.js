const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gym-controller');

router.get('/', gymController.getAllGyms);
router.get('/tipos', gymController.getGymTypes);
router.get('/filtro', gymController.filtrarGimnasios);
router.get('/cercanos', gymController.buscarGimnasiosCercanos);
router.get('/localidad', gymController.getGymsByCity);
router.get('/:id', gymController.getGymById);
router.post('/', gymController.createGym);
router.put('/:id', gymController.updateGym);
router.delete('/:id', gymController.deleteGym);

module.exports = router;
