const db = require('../config/db');

class ThemeModel {
    // Créer un thème
    static async create(themeData) {
        const { domaine_id, intitule, nb_jours, nb_max_participants } = themeData;
        const [result] = await db.execute(
            `INSERT INTO themes_formation (domaine_id, intitule, nb_jours, nb_max_participants) 
             VALUES (?, ?, ?, ?)`,
            [domaine_id, intitule, nb_jours, nb_max_participants]
        );
        return result.insertId;
    }

    // Récupérer tous les thèmes avec leur domaine
    static async getAll() {
        const [rows] = await db.execute(
            `SELECT t.*, d.nom as domaine_nom 
             FROM themes_formation t
             JOIN domaines d ON t.domaine_id = d.id
             ORDER BY t.id DESC`
        );
        return rows;
    }

    // Récupérer un thème par ID
    static async getById(id) {
        const [rows] = await db.execute(
            `SELECT t.*, d.nom as domaine_nom 
             FROM themes_formation t
             JOIN domaines d ON t.domaine_id = d.id
             WHERE t.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Récupérer les thèmes par domaine
    static async getByDomaine(domaineId) {
        const [rows] = await db.execute(
            'SELECT * FROM themes_formation WHERE domaine_id = ?',
            [domaineId]
        );
        return rows;
    }

    // Mettre à jour un thème
    static async update(id, themeData) {
        const { domaine_id, intitule, nb_jours, nb_max_participants } = themeData;
        const [result] = await db.execute(
            `UPDATE themes_formation 
             SET domaine_id = ?, intitule = ?, nb_jours = ?, nb_max_participants = ?
             WHERE id = ?`,
            [domaine_id, intitule, nb_jours, nb_max_participants, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer un thème
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM themes_formation WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = ThemeModel;
