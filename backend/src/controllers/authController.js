const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Inscription
const register = async (req, res) => {
    try {
        const { email, password, nom, prenom, telephone, adresse, raison_sociale, role_id } = req.body;
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
        
        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Créer l'utilisateur
        const userId = await UserModel.create({
            email,
            password: hashedPassword,
            nom,
            prenom,
            telephone,
            adresse,
            raison_sociale,
            role_id: role_id || 4 // Par défaut, rôle "entreprise" (id=4)
        });
        
        // Générer le token JWT
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: userId,
                email,
                nom,
                prenom,
                raison_sociale
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Connexion
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Vérifier si l'utilisateur existe
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
        
        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
        
        // Générer le token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                raison_sociale: user.raison_sociale,
                role: user.role_nom
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Obtenir mon profil (utilisateur connecté)
const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({
            id: user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            telephone: user.telephone,
            adresse: user.adresse,
            raison_sociale: user.raison_sociale,
            role: user.role_nom
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

module.exports = { register, login, getMe };
