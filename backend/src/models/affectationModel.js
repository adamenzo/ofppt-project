const db = require('../config/db');

class AffectationModel {
    // Créer une affectation (proposition d'intervenant)
    static async create(affectationData) {
        const { planification_id, intervenant_id } = affectationData;
        const [result] = await db.execute(
            `INSERT INTO affectations (planification_id, intervenant_id, statut_validation) 
             VALUES (?, ?, 'propose')`,
            [planification_id, intervenant_id]
        );
        return result.insertId;
    }

    // Récupérer toutes les affectations
    static async getAll() {
        const [rows] = await db.execute(
            `SELECT a.*, 
                    p.date_debut_prevue, p.statut as planification_statut,
                    u.raison_sociale as entreprise_nom,
                    t.intitule as theme_intitule,
                    i.matricule, i.type_interne,
                    iu.nom as intervenant_nom, iu.prenom as intervenant_prenom, iu.email as intervenant_email
             FROM affectations a
             JOIN planifications p ON a.planification_id = p.id
             JOIN users u ON p.entreprise_id = u.id
             JOIN offre_formation o ON p.offre_formation_id = o.id
             JOIN themes_formation t ON o.theme_id = t.id
             JOIN intervenants i ON a.intervenant_id = i.id
             JOIN users iu ON i.user_id = iu.id
             ORDER BY a.id DESC`
        );
        return rows;
    }

    // Récupérer les affectations par planification
    static async getByPlanification(planificationId) {
        const [rows] = await db.execute(
            `SELECT a.*, 
                    i.matricule, i.type_interne,
                    iu.nom, iu.prenom, iu.email, iu.telephone
             FROM affectations a
             JOIN intervenants i ON a.intervenant_id = i.id
             JOIN users iu ON i.user_id = iu.id
             WHERE a.planification_id = ?
             ORDER BY a.id DESC`,
            [planificationId]
        );
        return rows;
    }

    // Récupérer les affectations par intervenant
    static async getByIntervenant(intervenantId) {
        const [rows] = await db.execute(
            `SELECT a.*, 
                    p.date_debut_prevue, p.statut as planification_statut,
                    u.raison_sociale as entreprise_nom,
                    t.intitule as theme_intitule
             FROM affectations a
             JOIN planifications p ON a.planification_id = p.id
             JOIN users u ON p.entreprise_id = u.id
             JOIN offre_formation o ON p.offre_formation_id = o.id
             JOIN themes_formation t ON o.theme_id = t.id
             WHERE a.intervenant_id = ?
             ORDER BY a.id DESC`,
            [intervenantId]
        );
        return rows;
    }

    // Récupérer une affectation par ID
    static async getById(id) {
        const [rows] = await db.execute(
            `SELECT a.*, 
                    p.date_debut_prevue,
                    i.matricule,
                    iu.nom as intervenant_nom, iu.prenom as intervenant_prenom
             FROM affectations a
             JOIN planifications p ON a.planification_id = p.id
             JOIN intervenants i ON a.intervenant_id = i.id
             JOIN users iu ON i.user_id = iu.id
             WHERE a.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Valider une affectation (gestionnaire)
    static async valider(id) {
        const [result] = await db.execute(
            `UPDATE affectations SET statut_validation = 'valide' WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }

    // Refuser une affectation (gestionnaire)
    static async refuser(id) {
        const [result] = await db.execute(
            `UPDATE affectations SET statut_validation = 'refuse' WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer une affectation
    static async delete(id) {
        const [result] = await db.execute(`DELETE FROM affectations WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }

    // Vérifier si un intervenant est déjà affecté à une planification
    static async isAlreadyAffected(planificationId, intervenantId) {
        const [rows] = await db.execute(
            `SELECT id FROM affectations 
             WHERE planification_id = ? AND intervenant_id = ? 
             AND statut_validation != 'refuse'`,
            [planificationId, intervenantId]
        );
        return rows.length > 0;
    }
}

module.exports = AffectationModel;
