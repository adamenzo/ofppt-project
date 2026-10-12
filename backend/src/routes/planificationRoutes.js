const express = require('express');
const {
    createPlanification,
    getAllPlanifications,
    getMesPlanifications,
    getPlanificationById,
    validerPlanification,
    annulerPlanification,
    updatePlanification,
    deletePlanification
} = require('../controllers/planificationController');
const { protect, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Toutes les routes nécessitent d'être connecté
router.use(protect);

// Routes accessibles aux entreprises
router.post('/', createPlanification);
router.get('/mes-planifications', getMesPlanifications);
router.put('/:id', updatePlanification);
router.post('/:id/annuler', annulerPlanification);

// Routes accessibles uniquement aux admins et gestionnaires
router.get('/', checkRole(['admin_central', 'gestionnaire_regional', 'gestionnaire_local']), getAllPlanifications);
router.get('/:id', getPlanificationById); // Avec vérification des droits dans le contrôleur
router.put('/:id/valider', checkRole(['admin_central', 'gestionnaire_regional']), validerPlanification);
router.delete('/:id', checkRole(['admin_central']), deletePlanification);

module.exports = router;
