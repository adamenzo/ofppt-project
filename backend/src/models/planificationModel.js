const db = require('../config/db');

class PlanificationModel {
    // Créer une planification
    static async create(planificationData) {
        const { entreprise_id, offre_formation_id, nb_groupes, date_debut_prevue } = planificationData;
        const [result] = await db.execute(
            `INSERT INTO planifications (entreprise_id, offre_formation_id, nb_groupes, date_debut_prevue, statut) 
             VALUES (?, ?, ?, ?, 'en_attente')`,
            [entreprise_id, offre_formation_id, nb_groupes || 1, date_debut_prevue]
        );
        return result.insertId;
    }

    // Récupérer toutes les planifications (admin/régional)
    static async getAll() {
        const [rows] = await db.execute(
            `SELECT p.*, 
                    u.raison_sociale as entreprise_nom,
                    t.intitule as theme_intitule,
                    t.nb_jours,
                    d.nom as domaine_nom
             FROM planifications p
             JOIN users u ON p.entreprise_id = u.id
             JOIN offre_formation o ON p.offre_formation_id = o.id
             JOIN themes_formation t ON o.theme_id = t.id
             JOIN domaines d ON t.domaine_id = d.id
             ORDER BY p.created_at DESC`
        );
        return rows;
    }

    // Récupérer les planifications d'une entreprise spécifique
    static async getByEntreprise(entrepriseId) {
        const [rows] = await db.execute(
            `SELECT p.*, 
                    t.intitule as theme_intitule,
                    t.nb_jours,
                    t.nb_max_participants,
                    d.nom as domaine_nom
             FROM planifications p
             JOIN offre_formation o ON p.offre_formation_id = o.id
             JOIN themes_formation t ON o.theme_id = t.id
             JOIN domaines d ON t.domaine_id = d.id
             WHERE p.entreprise_id = ?
             ORDER BY p.created_at DESC`,
            [entrepriseId]
        );
        return rows;
    }

    // Récupérer une planification par ID
    static async getById(id) {
        const [rows] = await db.execute(
            `SELECT p.*, 
                    u.raison_sociale as entreprise_nom,
                    u.email as entreprise_email,
                    t.intitule as theme_intitule,
                    t.nb_jours,
                    t.nb_max_participants,
                    d.nom as domaine_nom
             FROM planifications p
             JOIN users u ON p.entreprise_id = u.id
             JOIN offre_formation o ON p.offre_formation_id = o.id
             JOIN themes_formation t ON o.theme_id = t.id
             JOIN domaines d ON t.domaine_id = d.id
             WHERE p.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Mettre à jour le statut d'une planification
    static async updateStatut(id, statut) {
        const [result] = await db.execute(
            `UPDATE planifications SET statut = ? WHERE id = ?`,
            [statut, id]
        );
        return result.affectedRows > 0;
    }

    // Annuler une planification (uniquement si non démarrée)
    static async annuler(id) {
        const [planif] = await db.execute(
            `SELECT statut, date_debut_prevue FROM planifications WHERE id = ?`,
            [id]
        );
        
        if (planif.length === 0) return false;
        
        // Vérifier si la formation n'a pas encore démarré
        const today = new Date().toISOString().split('T')[0];
        if (planif[0].date_debut_prevue < today && planif[0].statut !== 'en_attente') {
            throw new Error('Impossible d\'annuler une formation déjà démarrée');
        }
        
        const [result] = await db.execute(
            `UPDATE planifications SET statut = 'annulee' WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }

    // Mettre à jour une planification (dates, nb groupes)
    static async update(id, updateData) {
        const { nb_groupes, date_debut_prevue } = updateData;
        const [result] = await db.execute(
            `UPDATE planifications 
             SET nb_groupes = ?, date_debut_prevue = ?
             WHERE id = ? AND statut = 'en_attente'`,
            [nb_groupes, date_debut_prevue, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer une planification (admin seulement)
    static async delete(id) {
        const [result] = await db.execute(`DELETE FROM planifications WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = PlanificationModel;
