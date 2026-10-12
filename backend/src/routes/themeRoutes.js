const express = require('express');
const { createTheme, getAllThemes, getThemeById, updateTheme, deleteTheme } = require('../controllers/themeController');
const { protect, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(checkRole(['admin_central']));

router.post('/', createTheme);
router.get('/', getAllThemes);
router.get('/:id', getThemeById);
router.put('/:id', updateTheme);
router.delete('/:id', deleteTheme);

module.exports = router;