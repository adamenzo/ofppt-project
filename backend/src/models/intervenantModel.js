const db = require('../config/db');

class IntervenantModel {
    // Créer un intervenant (lié à un user existant)
    static async create(intervenantData) {
        const { user_id, matricule, type_interne, date_naissance, genre, lieu_affectation } = intervenantData;
        const [result] = await db.execute(
            `INSERT INTO intervenants (user_id, matricule, type_interne, date_naissance, genre, lieu_affectation) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, matricule, type_interne || 1, date_naissance, genre, lieu_affectation]
        );
        return result.insertId;
    }

    // Récupérer tous les intervenants avec leurs infos user
    static async getAll() {
        const [rows] = await db.execute(
            `SELECT i.*, u.email, u.nom, u.prenom, u.telephone, u.adresse
             FROM intervenants i
             JOIN users u ON i.user_id = u.id
             ORDER BY i.id DESC`
        );
        return rows;
    }

    // Récupérer un intervenant par son ID
    static async getById(id) {
        const [rows] = await db.execute(
            `SELECT i.*, u.email, u.nom, u.prenom, u.telephone, u.adresse
             FROM intervenants i
             JOIN users u ON i.user_id = u.id
             WHERE i.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Récupérer un intervenant par user_id
    static async getByUserId(userId) {
        const [rows] = await db.execute(
            `SELECT i.*, u.email, u.nom, u.prenom, u.telephone, u.adresse
             FROM intervenants i
             JOIN users u ON i.user_id = u.id
             WHERE i.user_id = ?`,
            [userId]
        );
        return rows[0];
    }

    // Mettre à jour un intervenant
    static async update(id, intervenantData) {
        const { matricule, type_interne, date_naissance, genre, lieu_affectation } = intervenantData;
        const [result] = await db.execute(
            `UPDATE intervenants 
             SET matricule = ?, type_interne = ?, date_naissance = ?, genre = ?, lieu_affectation = ?
             WHERE id = ?`,
            [matricule, type_interne, date_naissance, genre, lieu_affectation, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer un intervenant (cascade supprimera aussi le user si on veut, attention)
    static async delete(id) {
        // D'abord récupérer le user_id
        const intervenant = await this.getById(id);
        if (!intervenant) return false;
        
        // Supprimer l'intervenant
        await db.execute(`DELETE FROM intervenants WHERE id = ?`, [id]);
        
        // Optionnel : supprimer aussi l'utilisateur associé
        // await db.execute(`DELETE FROM users WHERE id = ?`, [intervenant.user_id]);
        
        return true;
    }

    // Ajouter un diplôme à un intervenant
    static async addDiplome(intervenantId, diplomeId) {
        const [result] = await db.execute(
            `INSERT INTO intervenant_diplome (intervenant_id, diplome_id) VALUES (?, ?)`,
            [intervenantId, diplomeId]
        );
        return result.insertId;
    }

    // Récupérer les diplômes d'un intervenant
    static async getDiplomes(intervenantId) {
        const [rows] = await db.execute(
            `SELECT d.*, id.id as liaison_id
             FROM diplomes d
             JOIN intervenant_diplome id ON d.id = id.diplome_id
             WHERE id.intervenant_id = ?`,
            [intervenantId]
        );
        return rows;
    }

    // Ajouter une certification à un intervenant
    static async addCertification(intervenantId, certificationId) {
        const [result] = await db.execute(
            `INSERT INTO intervenant_certification (intervenant_id, certification_id) VALUES (?, ?)`,
            [intervenantId, certificationId]
        );
        return result.insertId;
    }

    // Récupérer les certifications d'un intervenant
    static async getCertifications(intervenantId) {
        const [rows] = await db.execute(
            `SELECT c.*, ic.id as liaison_id
             FROM certifications c
             JOIN intervenant_certification ic ON c.id = ic.certification_id
             WHERE ic.intervenant_id = ?`,
            [intervenantId]
        );
        return rows;
    }
}

module.exports = IntervenantModel;