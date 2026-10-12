const express = require('express');
const { createOffre, getAllOffres, getOffreById, updateOffre, deleteOffre } = require('../controllers/offreController');
const { protect, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin seulement pour la gestion des offres
router.use(protect);
router.use(checkRole(['admin_central', 'gestionnaire_regional']));

router.post('/', createOffre);
router.get('/', getAllOffres);
router.get('/:id', getOffreById);
router.put('/:id', updateOffre);
router.delete('/:id', deleteOffre);

module.exports = router;
