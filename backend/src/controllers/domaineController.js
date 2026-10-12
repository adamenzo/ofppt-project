const DomaineModel = require('../models/domaineModel');

const createDomaine = async (req, res) => {
    try {
        const { nom } = req.body;
        if (!nom) return res.status(400).json({ message: 'Le nom est requis' });
        
        const id = await DomaineModel.create(nom);
        res.status(201).json({ message: 'Domaine créé', id, nom });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getAllDomaines = async (req, res) => {
    try {
        const domaines = await DomaineModel.getAll();
        res.json(domaines);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getDomaineById = async (req, res) => {
    try {
        const domaine = await DomaineModel.getById(req.params.id);
        if (!domaine) return res.status(404).json({ message: 'Domaine non trouvé' });
        res.json(domaine);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const updateDomaine = async (req, res) => {
    try {
        const updated = await DomaineModel.update(req.params.id, req.body.nom);
        if (!updated) return res.status(404).json({ message: 'Domaine non trouvé' });
        res.json({ message: 'Domaine mis à jour' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const deleteDomaine = async (req, res) => {
    try {
        const deleted = await DomaineModel.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Domaine non trouvé' });
        res.json({ message: 'Domaine supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { createDomaine, getAllDomaines, getDomaineById, updateDomaine, deleteDomaine };
