const PlanificationModel = require('../models/planificationModel');

// Créer une planification (entreprise)
const createPlanification = async (req, res) => {
    try {
        const { offre_formation_id, nb_groupes, date_debut_prevue } = req.body;
        
        if (!offre_formation_id || !date_debut_prevue) {
            return res.status(400).json({ message: 'Offre et date début requises' });
        }
        
        const id = await PlanificationModel.create({
            entreprise_id: req.user.id,
            offre_formation_id,
            nb_groupes,
            date_debut_prevue
        });
        
        res.status(201).json({ 
            message: 'Planification créée avec succès, en attente de validation', 
            planification_id: id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer toutes les planifications (admin/régional)
const getAllPlanifications = async (req, res) => {
    try {
        const planifications = await PlanificationModel.getAll();
        res.json(planifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer mes planifications (entreprise connectée)
const getMesPlanifications = async (req, res) => {
    try {
        const planifications = await PlanificationModel.getByEntreprise(req.user.id);
        res.json(planifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer une planification par ID
const getPlanificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const planification = await PlanificationModel.getById(id);
        
        if (!planification) {
            return res.status(404).json({ message: 'Planification non trouvée' });
        }
        
        // Vérifier les droits : entreprise ne voit que ses propres planifications
        if (req.user.role_nom === 'entreprise' && planification.entreprise_id !== req.user.id) {
            return res.status(403).json({ message: 'Accès refusé' });
        }
        
        res.json(planification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Valider une planification (admin/régional)
const validerPlanification = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await PlanificationModel.updateStatut(id, 'validee');
        
        if (!updated) {
            return res.status(404).json({ message: 'Planification non trouvée' });
        }
        
        res.json({ message: 'Planification validée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Annuler une planification (entreprise ou admin)
const annulerPlanification = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Vérifier les droits
        const planif = await PlanificationModel.getById(id);
        if (!planif) {
            return res.status(404).json({ message: 'Planification non trouvée' });
        }
        
        if (req.user.role_nom === 'entreprise' && planif.entreprise_id !== req.user.id) {
            return res.status(403).json({ message: 'Vous ne pouvez annuler que vos propres planifications' });
        }
        
        const annulee = await PlanificationModel.annuler(id);
        
        if (!annulee) {
            return res.status(400).json({ message: 'Impossible d\'annuler cette planification' });
        }
        
        res.json({ message: 'Planification annulée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Erreur serveur' });
    }
};

// Mettre à jour une planification (entreprise, tant qu'en attente)
const updatePlanification = async (req, res) => {
    try {
        const { id } = req.params;
        const { nb_groupes, date_debut_prevue } = req.body;
        
        const planif = await PlanificationModel.getById(id);
        if (!planif) {
            return res.status(404).json({ message: 'Planification non trouvée' });
        }
        
        if (planif.entreprise_id !== req.user.id) {
            return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres planifications' });
        }
        
        if (planif.statut !== 'en_attente') {
            return res.status(400).json({ message: 'Seules les planifications en attente peuvent être modifiées' });
        }
        
        const updated = await PlanificationModel.update(id, { nb_groupes, date_debut_prevue });
        
        if (!updated) {
            return res.status(400).json({ message: 'Aucune modification effectuée' });
        }
        
        res.json({ message: 'Planification mise à jour' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Supprimer une planification (admin seulement)
const deletePlanification = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await PlanificationModel.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ message: 'Planification non trouvée' });
        }
        
        res.json({ message: 'Planification supprimée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    createPlanification,
    getAllPlanifications,
    getMesPlanifications,
    getPlanificationById,
    validerPlanification,
    annulerPlanification,
    updatePlanification,
    deletePlanification
};