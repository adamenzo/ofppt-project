const UserModel = require('../models/userModel');
const IntervenantModel = require('../models/intervenantModel');
const bcrypt = require('bcryptjs');

// Créer un intervenant (avec création automatique du compte user)
const createIntervenant = async (req, res) => {
    try {
        const {
            email, password, nom, prenom, telephone, adresse,
            matricule, type_interne, date_naissance, genre, lieu_affectation
        } = req.body;

        // Vérifier si l'email existe déjà
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Créer l'utilisateur (rôle intervenant = 5)
        const userId = await UserModel.create({
            email,
            password: hashedPassword,
            nom,
            prenom,
            telephone,
            adresse,
            raison_sociale: null,
            role_id: 5  // rôle intervenant
        });

        // Créer l'intervenant
        const intervenantId = await IntervenantModel.create({
            user_id: userId,
            matricule,
            type_interne: type_interne || 1,
            date_naissance,
            genre,
            lieu_affectation
        });

        res.status(201).json({
            message: 'Intervenant créé avec succès',
            intervenant: { id: intervenantId, matricule, nom, prenom, email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer tous les intervenants
const getAllIntervenants = async (req, res) => {
    try {
        const intervenants = await IntervenantModel.getAll();
        res.json(intervenants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Récupérer un intervenant par ID
const getIntervenantById = async (req, res) => {
    try {
        const { id } = req.params;
        const intervenant = await IntervenantModel.getById(id);
        
        if (!intervenant) {
            return res.status(404).json({ message: 'Intervenant non trouvé' });
        }
        
        // Récupérer ses diplômes et certifications
        const diplomes = await IntervenantModel.getDiplomes(id);
        const certifications = await IntervenantModel.getCertifications(id);
        
        res.json({
            ...intervenant,
            diplomes,
            certifications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Mettre à jour un intervenant
const updateIntervenant = async (req, res) => {
    try {
        const { id } = req.params;
        const { matricule, type_interne, date_naissance, genre, lieu_affectation } = req.body;
        
        const updated = await IntervenantModel.update(id, {
            matricule, type_interne, date_naissance, genre, lieu_affectation
        });
        
        if (!updated) {
            return res.status(404).json({ message: 'Intervenant non trouvé' });
        }
        
        res.json({ message: 'Intervenant mis à jour avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Supprimer un intervenant
const deleteIntervenant = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await IntervenantModel.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ message: 'Intervenant non trouvé' });
        }
        
        res.json({ message: 'Intervenant supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Ajouter un diplôme à un intervenant
const addDiplomeToIntervenant = async (req, res) => {
    try {
        const { id } = req.params;
        const { diplome_id } = req.body;
        
        const result = await IntervenantModel.addDiplome(id, diplome_id);
        res.status(201).json({ message: 'Diplôme ajouté avec succès', liaison_id: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Ajouter une certification à un intervenant
const addCertificationToIntervenant = async (req, res) => {
    try {
        const { id } = req.params;
        const { certification_id } = req.body;
        
        const result = await IntervenantModel.addCertification(id, certification_id);
        res.status(201).json({ message: 'Certification ajoutée avec succès', liaison_id: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = {
    createIntervenant,
    getAllIntervenants,
    getIntervenantById,
    updateIntervenant,
    deleteIntervenant,
    addDiplomeToIntervenant,
    addCertificationToIntervenant
};