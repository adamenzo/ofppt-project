const AffectationModel = require('../models/affectationModel');
const PlanificationModel = require('../models/planificationModel');
const IntervenantModel = require('../models/intervenantModel');

// Proposer un intervenant pour une planification
const proposerIntervenant = async (req, res) => {
    try {
        const { planification_id, intervenant_id } = req.body;
        
        if (!planification_id || !intervenant_id) {
            return res.status(400).json({ message: 'Planification et intervenant requis' });
        }
        
        // Vérifier si la planification existe
        const planification = await PlanificationModel.getById(planification_id);
        if (!planification) {
            return res.status(404).json({ message: 'Planification non trouvée' });
        }
        
        // Vérifier si l'intervenant existe
        const intervenant = await IntervenantModel.getById(intervenant_id);
        if (!intervenant) {
            return res.status(404).json({ message: 'Intervenant non trouvé' });
        }
        
        // Vérifier si déjà affecté
        const alreadyAffected = await AffectationModel.isAlreadyAffected(planification_id, intervenant_id);
        if (alreadyAffected) {
            return res.status(400).json({ message: 'Cet intervenant est déjà affecté à cette planification' });
        }
        
        const id = await AffectationModel.create({ planification_id, intervenant_id });
        
        res.status(201).json({ 
            message: 'Intervenant proposé avec succès', 
            affectation_id: id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer toutes les affectations (admin/régional)
const getAllAffectations = async (req, res) => {
    try {
        const affectations = await AffectationModel.getAll();
        res.json(affectations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer les affectations d'une planification
const getAffectationsByPlanification = async (req, res) => {
    try {
        const { planificationId } = req.params;
        const affectations = await AffectationModel.getByPlanification(planificationId);
        res.json(affectations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer les affectations d'un intervenant
const getAffectationsByIntervenant = async (req, res) => {
    try {
        const { intervenantId } = req.params;
        const affectations = await AffectationModel.getByIntervenant(intervenantId);
        res.json(affectations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer mes affectations (intervenant connecté)
const getMesAffectations = async (req, res) => {
    try {
        // Récupérer l'intervenant lié à l'utilisateur connecté
        const intervenant = await IntervenantModel.getByUserId(req.user.id);
        if (!intervenant) {
            return res.status(404).json({ message: 'Vous n\'êtes pas enregistré comme intervenant' });
        }
        
        const affectations = await AffectationModel.getByIntervenant(intervenant.id);
        res.json(affectations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Valider une affectation
const validerAffectation = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await AffectationModel.valider(id);
        
        if (!updated) {
            return res.status(404).json({ message: 'Affectation non trouvée' });
        }
        
        res.json({ message: 'Affectation validée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Refuser une affectation
const refuserAffectation = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await AffectationModel.refuser(id);
        
        if (!updated) {
            return res.status(404).json({ message: 'Affectation non trouvée' });
        }
        
        res.json({ message: 'Affectation refusée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Supprimer une affectation
const deleteAffectation = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await AffectationModel.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ message: 'Affectation non trouvée' });
        }
        
        res.json({ message: 'Affectation supprimée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    proposerIntervenant,
    getAllAffectations,
    getAffectationsByPlanification,
    getAffectationsByIntervenant,
    getMesAffectations,
    validerAffectation,
    refuserAffectation,
    deleteAffectation
};
