const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '5555',  // ← METS TON MOT DE PASSE ICI
    database: 'ofppt_formation'
}).promise();

async function addAllData() {
    try {
        console.log('📝 Ajout des données de démonstration...\n');

        // 1. Ajouter des thèmes de formation
        console.log('📚 Ajout des thèmes de formation...');
        const [domaines] = await pool.execute('SELECT id, nom FROM domaines');
        const domaineMap = {};
        for (let d of domaines) domaineMap[d.nom] = d.id;

        const themes = [
            { domaine: 'Digital', intitule: 'Développement Web Full Stack', jours: 30, max: 15 },
            { domaine: 'Digital', intitule: 'Data Science & IA', jours: 25, max: 12 },
            { domaine: 'Digital', intitule: 'Cybersécurité', jours: 20, max: 15 },
            { domaine: 'Digital', intitule: 'Cloud Computing AWS', jours: 15, max: 20 },
            { domaine: 'Digital', intitule: 'DevOps & CI/CD', jours: 12, max: 12 },
            { domaine: 'Industriel', intitule: 'Industrie 4.0 & IoT', jours: 25, max: 12 },
            { domaine: 'Industriel', intitule: 'Maintenance Industrielle', jours: 10, max: 10 },
            { domaine: 'Industriel', intitule: 'Automatismes & Robotique', jours: 20, max: 8 },
            { domaine: 'Industriel', intitule: 'Lean Management', jours: 8, max: 15 },
            { domaine: 'Génie Civil', intitule: 'BIM (Building Information Modeling)', jours: 15, max: 12 },
            { domaine: 'Génie Civil', intitule: 'Gestion de projets BTP', jours: 12, max: 15 },
            { domaine: 'Management', intitule: 'Leadership & Management', jours: 8, max: 20 },
            { domaine: 'Management', intitule: 'Gestion du changement', jours: 5, max: 25 },
            { domaine: 'Logistique', intitule: 'Supply Chain Management', jours: 12, max: 15 },
            { domaine: 'Logistique', intitule: 'Transport & Douane', jours: 8, max: 12 }
        ];

        for (let t of themes) {
            await pool.execute(
                `INSERT INTO themes_formation (domaine_id, intitule, nb_jours, nb_max_participants) VALUES (?, ?, ?, ?)`,
                [domaineMap[t.domaine], t.intitule, t.jours, t.max]
            );
        }
        console.log(`   ✅ ${themes.length} thèmes ajoutés`);

        // 2. Ajouter des offres de formation (2024, 2025, 2026)
        console.log('\n📦 Ajout des offres de formation...');
        const [themesList] = await pool.execute('SELECT id FROM themes_formation');
        let offreCount = 0;
        for (let annee of [2024, 2025, 2026]) {
            for (let theme of themesList) {
                if (Math.random() > 0.3) {
                    await pool.execute(
                        `INSERT INTO offre_formation (annee, theme_id, region_id) VALUES (?, ?, ?)`,
                        [annee, theme.id, Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : null]
                    );
                    offreCount++;
                }
            }
        }
        console.log(`   ✅ ${offreCount} offres ajoutées`);

        // 3. Ajouter des planifications
        console.log('\n📅 Ajout des planifications...');
        const [entreprises] = await pool.execute('SELECT id FROM users WHERE role_id = 4');
        const [offres] = await pool.execute('SELECT id FROM offre_formation');
        const statuts = ['en_attente', 'validee', 'terminee', 'annulee'];
        
        let planifCount = 0;
        for (let i = 0; i < 50; i++) {
            const entreprise = entreprises[Math.floor(Math.random() * entreprises.length)];
            const offre = offres[Math.floor(Math.random() * offres.length)];
            const statut = statuts[Math.floor(Math.random() * statuts.length)];
            const mois = Math.floor(Math.random() * 12) + 1;
            const jour = Math.floor(Math.random() * 28) + 1;
            const date = `2025-${mois.toString().padStart(2, '0')}-${jour.toString().padStart(2, '0')}`;
            
            await pool.execute(
                `INSERT INTO planifications (entreprise_id, offre_formation_id, nb_groupes, date_debut_prevue, statut) VALUES (?, ?, ?, ?, ?)`,
                [entreprise.id, offre.id, Math.floor(Math.random() * 3) + 1, date, statut]
            );
            planifCount++;
        }
        console.log(`   ✅ ${planifCount} planifications ajoutées`);

        // 4. Ajouter des affectations
        console.log('\n👥 Ajout des affectations...');
        const [planifications] = await pool.execute('SELECT id FROM planifications WHERE statut IN ("validee", "terminee")');
        const [intervenants] = await pool.execute('SELECT id FROM intervenants');
        const statutsAffect = ['propose', 'valide', 'refuse'];
        
        let affectCount = 0;
        for (let planif of planifications) {
            if (Math.random() > 0.5) {
                const intervenant = intervenants[Math.floor(Math.random() * intervenants.length)];
                const statut = statutsAffect[Math.floor(Math.random() * statutsAffect.length)];
                await pool.execute(
                    `INSERT INTO affectations (planification_id, intervenant_id, statut_validation) VALUES (?, ?, ?)`,
                    [planif.id, intervenant.id, statut]
                );
                affectCount++;
            }
        }
        console.log(`   ✅ ${affectCount} affectations ajoutées`);

        // 5. Ajouter des notifications
        console.log('\n🔔 Ajout des notifications...');
        const [allUsers] = await pool.execute('SELECT id FROM users');
        const messages = [
            'Votre demande de formation a été validée',
            'Un intervenant a été affecté à votre formation',
            'Nouvelle offre de formation disponible',
            'Rappel: votre formation commence dans 7 jours',
            'Votre demande a été annulée',
            'La formation a été reprogrammée',
            'Votre formation est terminée, merci pour votre participation',
            'Un certificat est disponible pour votre formation'
        ];
        
        let notifCount = 0;
        for (let user of allUsers) {
            const numNotifs = Math.floor(Math.random() * 8);
            for (let i = 0; i < numNotifs; i++) {
                const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
                await pool.execute(
                    `INSERT INTO notifications (user_id, message, lue, created_at) VALUES (?, ?, ?, ?)`,
                    [user.id, messages[Math.floor(Math.random() * messages.length)], Math.random() > 0.6, date]
                );
                notifCount++;
            }
        }
        console.log(`   ✅ ${notifCount} notifications ajoutées`);

        // 6. Ajouter des diplômes pour intervenants
        console.log('\n🎓 Ajout des diplômes...');
        const diplomes = [
            { intitule: 'Master en Data Science', ecole: 'ENSIAS', niveau: 'Bac+5', specialite: 'Data Science' },
            { intitule: 'Diplôme d\'Ingénieur en Génie Civil', ecole: 'EMI', niveau: 'Bac+5', specialite: 'Génie Civil' },
            { intitule: 'Master en Marketing Digital', ecole: 'HEC', niveau: 'Bac+5', specialite: 'Marketing' },
            { intitule: 'Licence en Gestion', ecole: 'ENCG', niveau: 'Bac+3', specialite: 'Management' },
            { intitule: 'BTS en Logistique', ecole: 'OFPPT', niveau: 'Bac+2', specialite: 'Logistique' },
            { intitule: 'Certification PMP', ecole: 'PMI', niveau: 'Certification', specialite: 'Management' }
        ];
        
        for (let d of diplomes) {
            await pool.execute(
                `INSERT INTO diplomes (intitule, ecole, annee_obtention, niveau, specialite) VALUES (?, ?, ?, ?, ?)`,
                [d.intitule, d.ecole, 2020 + Math.floor(Math.random() * 5), d.niveau, d.specialite]
            );
        }
        
        const [intervenantsList] = await pool.execute('SELECT id FROM intervenants');
        const [diplomesList] = await pool.execute('SELECT id FROM diplomes');
        
        for (let inter of intervenantsList) {
            const diplome = diplomesList[Math.floor(Math.random() * diplomesList.length)];
            await pool.execute(
                `INSERT INTO intervenant_diplome (intervenant_id, diplome_id) VALUES (?, ?)`,
                [inter.id, diplome.id]
            );
        }
        console.log(`   ✅ ${diplomes.length} diplômes ajoutés`);

        console.log('\n' + '='.repeat(50));
        console.log('🎉 DONNÉES AJOUTÉES AVEC SUCCÈS !');
        console.log('='.repeat(50));
        console.log('\n📊 RÉCAPITULATIF:');
        console.log(`   - Thèmes: ${themes.length}`);
        console.log(`   - Offres: ${offreCount}`);
        console.log(`   - Planifications: ${planifCount}`);
        console.log(`   - Affectations: ${affectCount}`);
        console.log(`   - Notifications: ${notifCount}`);
        console.log(`   - Diplômes: ${diplomes.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

addAllData();