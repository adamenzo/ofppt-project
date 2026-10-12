const express = require('express');
const {
    createIntervenant,
    getAllIntervenants,
    getIntervenantById,
    updateIntervenant,
    deleteIntervenant,
    addDiplomeToIntervenant,
    addCertificationToIntervenant
} = require('../controllers/intervenantController');
const { protect, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Toutes les routes nécessitent d'être connecté
// Seul l'admin central peut gérer les intervenants
router.use(protect);
router.use(checkRole(['admin_central']));

router.post('/', createIntervenant);
router.get('/', getAllIntervenants);
router.get('/:id', getIntervenantById);
router.put('/:id', updateIntervenant);
router.delete('/:id', deleteIntervenant);
router.post('/:id/diplomes', addDiplomeToIntervenant);
router.post('/:id/certifications', addCertificationToIntervenant);

module.exports = router;