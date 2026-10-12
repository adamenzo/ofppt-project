const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Vérifier si l'utilisateur est authentifié
const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await UserModel.findById(decoded.id);
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Non autorisé, token invalide' });
        }
    }
    
    if (!token) {
        return res.status(401).json({ message: 'Non autorisé, pas de token' });
    }
};

// Vérifier le rôle (admin, gestionnaire, etc.)
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Non autorisé' });
        }
        if (roles.includes(req.user.role_nom)) {
            next();
        } else {
            res.status(403).json({ message: 'Accès refusé, rôle insuffisant' });
        }
    };
};

module.exports = { protect, checkRole };
