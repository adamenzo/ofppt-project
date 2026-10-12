const db = require('../config/db');

class OffreModel {
    // Créer une offre
    static async create(offreData) {
        const { annee, theme_id, region_id } = offreData;
        const [result] = await db.execute(
            `INSERT INTO offre_formation (annee, theme_id, region_id) 
             VALUES (?, ?, ?)`,
            [annee, theme_id, region_id || null]
        );
        return result.insertId;
    }

    // Récupérer toutes les offres
    static async getAll() {
        const [rows] = await db.execute(
            `SELECT o.*, t.intitule as theme_intitule, t.nb_jours, t.nb_max_participants, d.nom as domaine_nom
             FROM offre_formation o
             JOIN themes_formation t ON o.theme_id = t.id
             JOIN domaines d ON t.domaine_id = d.id
             ORDER BY o.annee DESC, o.id DESC`
        );
        return rows;
    }

    // Récupérer une offre par ID
    static async getById(id) {
        const [rows] = await db.execute(
            `SELECT o.*, t.intitule as theme_intitule, t.nb_jours, t.nb_max_participants, d.nom as domaine_nom
             FROM offre_formation o
             JOIN themes_formation t ON o.theme_id = t.id
             JOIN domaines d ON t.domaine_id = d.id
             WHERE o.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Récupérer les offres par année
    static async getByAnnee(annee) {
        const [rows] = await db.execute(
            `SELECT o.*, t.intitule as theme_intitule
             FROM offre_formation o
             JOIN themes_formation t ON o.theme_id = t.id
             WHERE o.annee = ?`,
            [annee]
        );
        return rows;
    }

    // Récupérer les offres par région
    static async getByRegion(regionId) {
        const [rows] = await db.execute(
            `SELECT o.*, t.intitule as theme_intitule
             FROM offre_formation o
             JOIN themes_formation t ON o.theme_id = t.id
             WHERE o.region_id = ? OR o.region_id IS NULL`,
            [regionId]
        );
        return rows;
    }

    // Mettre à jour une offre
    static async update(id, offreData) {
        const { annee, theme_id, region_id } = offreData;
        const [result] = await db.execute(
            `UPDATE offre_formation 
             SET annee = ?, theme_id = ?, region_id = ?
             WHERE id = ?`,
            [annee, theme_id, region_id || null, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer une offre
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM offre_formation WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = OffreModel;
