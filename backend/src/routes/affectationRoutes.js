const express = require('express');
const {
    proposerIntervenant,
    getAllAffectations,
    getAffectationsByPlanification,
    getAffectationsByIntervenant,
    getMesAffectations,
    validerAffectation,
    refuserAffectation,
    deleteAffectation
} = require('../controllers/affectationController');
const { protect, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Toutes les routes nécessitent d'être connecté
router.use(protect);

// Routes accessibles aux gestionnaires et admins
router.post('/', checkRole(['admin_central', 'gestionnaire_regional']), proposerIntervenant);
router.get('/', checkRole(['admin_central', 'gestionnaire_regional']), getAllAffectations);
router.get('/planification/:planificationId', checkRole(['admin_central', 'gestionnaire_regional']), getAffectationsByPlanification);
router.get('/intervenant/:intervenantId', checkRole(['admin_central', 'gestionnaire_regional']), getAffectationsByIntervenant);
router.put('/:id/valider', checkRole(['admin_central', 'gestionnaire_regional']), validerAffectation);
router.put('/:id/refuser', checkRole(['admin_central', 'gestionnaire_regional']), refuserAffectation);
router.delete('/:id', checkRole(['admin_central']), deleteAffectation);

// Route pour l'intervenant connecté
router.get('/mes-affectations', getMesAffectations);

module.exports = router;