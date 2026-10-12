const express = require('express');
const { createDomaine, getAllDomaines, getDomaineById, updateDomaine, deleteDomaine } = require('../controllers/domaineController');
const { protect, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(checkRole(['admin_central']));

router.post('/', createDomaine);
router.get('/', getAllDomaines);
router.get('/:id', getDomaineById);
router.put('/:id', updateDomaine);
router.delete('/:id', deleteDomaine);

module.exports = router;
