const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '5555',
    database: 'ofppt_formation'
}).promise();

async function createAllUsers() {
    try {
        const adminHash = await bcrypt.hash('admin123', 10);
        const userHash = await bcrypt.hash('123456', 10);

        console.log('📝 Création de tous les utilisateurs...\n');

        // 1. ADMIN CENTRAL
        let adminId;
        let [result] = await pool.execute(`INSERT INTO users (email, password, nom, prenom, role_id) VALUES (?, ?, ?, ?, ?)`, 
            ['admin@ofppt.ma', adminHash, 'Admin', 'Central', 1]);
        adminId = result.insertId;
        console.log('✅ Admin Central: admin@ofppt.ma / admin123');

        // 2. GESTIONNAIRES REGIONAUX (5 régions)
        const regions = ['Casablanca', 'Rabat', 'Tanger', 'Fès', 'Marrakech'];
        for (let r of regions) {
            await pool.execute(`INSERT INTO users (email, password, nom, prenom, role_id) VALUES (?, ?, ?, ?, ?)`, 
                [`regional.${r.toLowerCase()}@ofppt.ma`, adminHash, `Responsable`, r, 2]);
            console.log(`✅ Gestionnaire Régional ${r}: regional.${r.toLowerCase()}@ofppt.ma / admin123`);
        }

        // 3. GESTIONNAIRES LOCAUX (10 centres)
        const centres = [
            'Oasis', 'Ain Sebaa', 'Agdal', 'Mghogha', 'Atlas',
            'Gueliz', 'Meknes', 'Kenitra', 'Tetouan', 'Safi'
        ];
        for (let c of centres) {
            await pool.execute(`INSERT INTO users (email, password, nom, prenom, role_id) VALUES (?, ?, ?, ?, ?)`, 
                [`local.${c.toLowerCase()}@ofppt.ma`, adminHash, `Directeur`, c, 3]);
            console.log(`✅ Gestionnaire Local ${c}: local.${c.toLowerCase()}@ofppt.ma / admin123`);
        }

        // 4. ENTREPRISES (15 entreprises)
        const entreprises = [
            'Groupe OCP', 'Maroc Telecom', 'Attijariwafa Bank', 'Royal Air Maroc', 'CGI Maroc',
            'Al Omrane', 'Lydec', 'BMCE Bank', 'Banque Populaire', 'Inwi',
            'Orange Maroc', 'Label Vie', 'Marjane', 'Cosumar', 'Managem'
        ];
        for (let e of entreprises) {
            await pool.execute(`INSERT INTO users (email, password, raison_sociale, role_id) VALUES (?, ?, ?, ?)`, 
                [`${e.toLowerCase().replace(/ /g, '.')}@entreprise.ma`, userHash, e, 4]);
            console.log(`✅ Entreprise ${e}: ${e.toLowerCase().replace(/ /g, '.')}@entreprise.ma / 123456`);
        }

        // 5. INTERVENANTS (10 intervenants)
        const intervenants = [
            { nom: 'Ahmed', prenom: 'Benali', email: 'ahmed.benali@ofppt.ma', matricule: 'INT-001' },
            { nom: 'Fatima', prenom: 'Zahra', email: 'fatima.zahra@ofppt.ma', matricule: 'INT-002' },
            { nom: 'Karim', prenom: 'El Fassi', email: 'karim.elfassi@ofppt.ma', matricule: 'INT-003' },
            { nom: 'Sara', prenom: 'Benjelloun', email: 'sara.benjelloun@ofppt.ma', matricule: 'INT-004' },
            { nom: 'Youssef', prenom: 'Lamrani', email: 'youssef.lamrani@ofppt.ma', matricule: 'INT-005' },
            { nom: 'Nadia', prenom: 'El Mansouri', email: 'nadia.elmansouri@ofppt.ma', matricule: 'INT-006' },
            { nom: 'Hassan', prenom: 'Amrani', email: 'hassan.amrani@ofppt.ma', matricule: 'INT-007' },
            { nom: 'Leila', prenom: 'Sbai', email: 'leila.sbai@ofppt.ma', matricule: 'INT-008' },
            { nom: 'Omar', prenom: 'Fassi', email: 'omar.fassi@ofppt.ma', matricule: 'INT-009' },
            { nom: 'Rachid', prenom: 'Bennis', email: 'rachid.bennis@ofppt.ma', matricule: 'INT-010' }
        ];
        for (let i of intervenants) {
            const [res] = await pool.execute(`INSERT INTO users (email, password, nom, prenom, role_id) VALUES (?, ?, ?, ?, ?)`, 
                [i.email, adminHash, i.nom, i.prenom, 5]);
            await pool.execute(`INSERT INTO intervenants (user_id, matricule) VALUES (?, ?)`, [res.insertId, i.matricule]);
            console.log(`✅ Intervenant ${i.prenom} ${i.nom}: ${i.email} / admin123`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 TOUS LES COMPTES ONT ÉTÉ CRÉÉS !');
        console.log('='.repeat(60));
        console.log('\n📋 RÉCAPITULATIF:');
        console.log('   - 1 Admin Central');
        console.log('   - 5 Gestionnaires Régionaux');
        console.log('   - 10 Gestionnaires Locaux');
        console.log('   - 15 Entreprises');
        console.log('   - 10 Intervenants');
        console.log('   TOTAL: 41 utilisateurs\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

createAllUsers();