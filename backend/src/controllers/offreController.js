const OffreModel = require('../models/offreModel');

const createOffre = async (req, res) => {
    try {
        const { annee, theme_id, region_id } = req.body;
        if (!annee || !theme_id) {
            return res.status(400).json({ message: 'Année et thème requis' });
        }
        
        const id = await OffreModel.create({ annee, theme_id, region_id });
        res.status(201).json({ message: 'Offre créée', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getAllOffres = async (req, res) => {
    try {
        const offres = await OffreModel.getAll();
        res.json(offres);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getOffreById = async (req, res) => {
    try {
        const offre = await OffreModel.getById(req.params.id);
        if (!offre) return res.status(404).json({ message: 'Offre non trouvée' });
        res.json(offre);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const updateOffre = async (req, res) => {
    try {
        const updated = await OffreModel.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Offre non trouvée' });
        res.json({ message: 'Offre mise à jour' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const deleteOffre = async (req, res) => {
    try {
        const deleted = await OffreModel.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Offre non trouvée' });
        res.json({ message: 'Offre supprimée' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { createOffre, getAllOffres, getOffreById, updateOffre, deleteOffre };
