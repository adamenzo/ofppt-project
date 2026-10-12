// setup-admin.js - Création propre de l'admin
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

async function setupAdmin() {
    try {
        // Vérifier que le rôle admin_central existe (id=1)
        const [roles] = await pool.execute('SELECT * FROM roles WHERE id = 1');
        if (roles.length === 0) {
            console.log('❌ Le rôle admin_central (id=1) n\'existe pas');
            console.log('📋 Rôles disponibles:');
            const [allRoles] = await pool.execute('SELECT * FROM roles');
            console.table(allRoles);
            process.exit(1);
        }
        
        // Générer le hash du mot de passe
        const plainPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        // Créer l'admin
        const [result] = await pool.execute(
            `INSERT INTO users (email, password, nom, prenom, role_id) 
             VALUES (?, ?, ?, ?, ?)`,
            ['admin@ofppt.ma', hashedPassword, 'Administrateur', 'Central', 1]
        );
        
        console.log('✅ Admin créé avec succès !');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@ofppt.ma');
        console.log('🔑 Mot de passe: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Vérifier que l'insertion a fonctionné
        const [verify] = await pool.execute('SELECT id, email, role_id FROM users WHERE email = ?', ['admin@ofppt.ma']);
        console.log('✅ Vérification:', verify[0]);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

setupAdmin();