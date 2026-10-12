const db = require('../config/db');

class DomaineModel {
    // Créer un domaine
    static async create(nom) {
        const [result] = await db.execute(
            'INSERT INTO domaines (nom) VALUES (?)',
            [nom]
        );
        return result.insertId;
    }

    // Récupérer tous les domaines
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM domaines ORDER BY id');
        return rows;
    }

    // Récupérer un domaine par ID
    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM domaines WHERE id = ?', [id]);
        return rows[0];
    }

    // Mettre à jour un domaine
    static async update(id, nom) {
        const [result] = await db.execute(
            'UPDATE domaines SET nom = ? WHERE id = ?',
            [nom, id]
        );
        return result.affectedRows > 0;
    }

    // Supprimer un domaine
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM domaines WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = DomaineModel;
