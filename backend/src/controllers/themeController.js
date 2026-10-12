const ThemeModel = require('../models/themeModel');

const createTheme = async (req, res) => {
    try {
        const { domaine_id, intitule, nb_jours, nb_max_participants } = req.body;
        if (!domaine_id || !intitule) {
            return res.status(400).json({ message: 'Domaine et intitulé requis' });
        }
        
        const id = await ThemeModel.create({ domaine_id, intitule, nb_jours, nb_max_participants });
        res.status(201).json({ message: 'Thème créé', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getAllThemes = async (req, res) => {
    try {
        const themes = await ThemeModel.getAll();
        res.json(themes);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getThemeById = async (req, res) => {
    try {
        const theme = await ThemeModel.getById(req.params.id);
        if (!theme) return res.status(404).json({ message: 'Thème non trouvé' });
        res.json(theme);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const updateTheme = async (req, res) => {
    try {
        const updated = await ThemeModel.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Thème non trouvé' });
        res.json({ message: 'Thème mis à jour' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const deleteTheme = async (req, res) => {
    try {
        const deleted = await ThemeModel.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Thème non trouvé' });
        res.json({ message: 'Thème supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { createTheme, getAllThemes, getThemeById, updateTheme, deleteTheme };
