// hash-password.js
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

async function updateAdminPassword() {
    try {
        // Générer le hash du mot de passe
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        console.log('Hash généré:', hashedPassword);
        
        // Mettre à jour l'admin
        const [result] = await pool.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'admin@ofppt.ma']
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ Mot de passe admin mis à jour avec succès');
            console.log('Email: admin@ofppt.ma');
            console.log('Mot de passe: admin123');
        } else {
            console.log('❌ Admin non trouvé');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Erreur:', error);
        process.exit(1);
    }
}

updateAdminPassword();