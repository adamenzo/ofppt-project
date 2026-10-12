const db = require('../config/db');

class UserModel {
    // Créer un utilisateur
    static async create(userData) {
        const { email, password, nom, prenom, telephone, adresse, raison_sociale, role_id } = userData;
        const [result] = await db.execute(
            `INSERT INTO users (email, password, nom, prenom, telephone, adresse, raison_sociale, role_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [email, password, nom, prenom, telephone, adresse, raison_sociale, role_id]
        );
        return result.insertId;
    }

    // Trouver un utilisateur par email
    static async findByEmail(email) {
        const [rows] = await db.execute(
            `SELECT u.*, r.nom as role_nom 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.email = ?`,
            [email]
        );
        return rows[0];
    }

    // Trouver un utilisateur par ID
    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT u.*, r.nom as role_nom 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Récupérer tous les utilisateurs (admin)
    static async getAll() {
        const [rows] = await db.execute(
            `SELECT u.id, u.email, u.nom, u.prenom, u.telephone, u.adresse, u.raison_sociale, r.nom as role_nom, u.created_at
             FROM users u 
             JOIN roles r ON u.role_id = r.id`
        );
        return rows;
    }
}

module.exports = UserModel;
