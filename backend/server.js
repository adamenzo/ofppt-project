require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// ========== CONNEXION MYSQL ==========
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '5555',
    database: process.env.DB_NAME || 'ofppt_formation',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// ========== MIDDLEWARE AUTH ==========
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Non autorisé' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ofppt_secret_key');
        const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [decoded.id]);
        if (users.length === 0) return res.status(401).json({ message: 'Utilisateur non trouvé' });
        req.user = users[0];
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalide' });
    }
};

// ========== AUTHENTIFICATION ==========
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.execute(
            'SELECT u.*, r.nom as role_nom FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
            [email]
        );
        if (users.length === 0) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'ofppt_secret_key', { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role_nom,
                raison_sociale: user.raison_sociale
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT u.*, r.nom as role_nom FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
            [req.user.id]
        );
        const user = users[0];
        res.json({
            id: user.id,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role_nom,
            raison_sociale: user.raison_sociale
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== STATISTIQUES GLOBALES ==========
app.get('/api/statistiques/globales', authMiddleware, async (req, res) => {
    try {
        const [entreprises] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role_id = 4');
        const [intervenants] = await pool.execute('SELECT COUNT(*) as total FROM intervenants');
        const [planifications] = await pool.execute('SELECT COUNT(*) as total FROM planifications');
        res.json({
            total_entreprises: entreprises[0].total,
            total_intervenants: intervenants[0].total,
            total_planifications: planifications[0].total
        });
    } catch (error) {
        res.json({ total_entreprises: 0, total_intervenants: 0, total_planifications: 0 });
    }
});

app.get('/api/statistiques/dashboard', authMiddleware, async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT
                (SELECT COUNT(*) FROM users WHERE role_id = 4) as total_entreprises,
                (SELECT COUNT(*) FROM intervenants) as total_intervenants,
                (SELECT COUNT(*) FROM planifications) as total_planifications,
                (SELECT COUNT(*) FROM planifications WHERE statut = 'terminee') as planifications_terminees,
                (SELECT COUNT(*) FROM planifications WHERE statut = 'validee') as planifications_validees
        `);
        const [taux] = await pool.execute(`
            SELECT ROUND(SUM(CASE WHEN statut = 'terminee' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 2) as taux 
            FROM planifications
        `);
        res.json({ 
            stats_globales: stats[0], 
            taux_realisation: { taux: taux[0]?.taux || 0 }
        });
    } catch (error) {
        res.json({ stats_globales: { total_entreprises: 0, total_intervenants: 0, total_planifications: 0 }, taux_realisation: { taux: 0 } });
    }
});

// ========== INTERVENANTS (CRUD) ==========
app.get('/api/intervenants', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT i.*, u.email, u.nom, u.prenom, u.telephone, u.adresse
            FROM intervenants i
            JOIN users u ON i.user_id = u.id
            ORDER BY i.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/intervenants', authMiddleware, async (req, res) => {
    try {
        const { email, password, nom, prenom, telephone, adresse, matricule, type_interne, date_naissance, genre, lieu_affectation } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [user] = await pool.execute(
            'INSERT INTO users (email, password, nom, prenom, telephone, adresse, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, nom, prenom, telephone, adresse, 5]
        );
        await pool.execute(
            'INSERT INTO intervenants (user_id, matricule, type_interne, date_naissance, genre, lieu_affectation) VALUES (?, ?, ?, ?, ?, ?)',
            [user.insertId, matricule, type_interne || 1, date_naissance, genre, lieu_affectation]
        );
        res.status(201).json({ message: 'Intervenant créé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/intervenants/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { matricule, type_interne, date_naissance, genre, lieu_affectation } = req.body;
        await pool.execute(
            'UPDATE intervenants SET matricule = ?, type_interne = ?, date_naissance = ?, genre = ?, lieu_affectation = ? WHERE id = ?',
            [matricule, type_interne, date_naissance, genre, lieu_affectation, id]
        );
        res.json({ message: 'Intervenant mis à jour' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/intervenants/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const [interv] = await pool.execute('SELECT user_id FROM intervenants WHERE id = ?', [id]);
        if (interv.length > 0) {
            await pool.execute('DELETE FROM intervenants WHERE id = ?', [id]);
            await pool.execute('DELETE FROM users WHERE id = ?', [interv[0].user_id]);
        }
        res.json({ message: 'Intervenant supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== DOMAINES ==========
app.get('/api/domaines', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM domaines ORDER BY id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/domaines', authMiddleware, async (req, res) => {
    try {
        const { nom } = req.body;
        const [result] = await pool.execute('INSERT INTO domaines (nom) VALUES (?)', [nom]);
        res.status(201).json({ id: result.insertId, nom });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/domaines/:id', authMiddleware, async (req, res) => {
    try {
        await pool.execute('UPDATE domaines SET nom = ? WHERE id = ?', [req.body.nom, req.params.id]);
        res.json({ message: 'Domaine mis à jour' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/domaines/:id', authMiddleware, async (req, res) => {
    try {
        await pool.execute('DELETE FROM domaines WHERE id = ?', [req.params.id]);
        res.json({ message: 'Domaine supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== THÈMES DE FORMATION ==========
app.get('/api/themes', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT t.*, d.nom as domaine_nom 
            FROM themes_formation t 
            JOIN domaines d ON t.domaine_id = d.id
            ORDER BY t.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/themes', authMiddleware, async (req, res) => {
    try {
        const { domaine_id, intitule, nb_jours, nb_max_participants } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO themes_formation (domaine_id, intitule, nb_jours, nb_max_participants) VALUES (?, ?, ?, ?)',
            [domaine_id, intitule, nb_jours, nb_max_participants]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/themes/:id', authMiddleware, async (req, res) => {
    try {
        const { domaine_id, intitule, nb_jours, nb_max_participants } = req.body;
        await pool.execute(
            'UPDATE themes_formation SET domaine_id = ?, intitule = ?, nb_jours = ?, nb_max_participants = ? WHERE id = ?',
            [domaine_id, intitule, nb_jours, nb_max_participants, req.params.id]
        );
        res.json({ message: 'Thème mis à jour' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/themes/:id', authMiddleware, async (req, res) => {
    try {
        await pool.execute('DELETE FROM themes_formation WHERE id = ?', [req.params.id]);
        res.json({ message: 'Thème supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== OFFRES DE FORMATION ==========
app.get('/api/offres', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT o.*, t.intitule as theme_intitule, t.nb_jours, t.nb_max_participants, d.nom as domaine_nom
            FROM offre_formation o
            JOIN themes_formation t ON o.theme_id = t.id
            JOIN domaines d ON t.domaine_id = d.id
            ORDER BY o.annee DESC, o.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/offres', authMiddleware, async (req, res) => {
    try {
        const { annee, theme_id, region_id } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO offre_formation (annee, theme_id, region_id) VALUES (?, ?, ?)',
            [annee, theme_id, region_id || null]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/offres/:id', authMiddleware, async (req, res) => {
    try {
        const { annee, theme_id, region_id } = req.body;
        await pool.execute(
            'UPDATE offre_formation SET annee = ?, theme_id = ?, region_id = ? WHERE id = ?',
            [annee, theme_id, region_id || null, req.params.id]
        );
        res.json({ message: 'Offre mise à jour' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/offres/:id', authMiddleware, async (req, res) => {
    try {
        await pool.execute('DELETE FROM offre_formation WHERE id = ?', [req.params.id]);
        res.json({ message: 'Offre supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== PLANIFICATIONS ==========
app.get('/api/planifications', authMiddleware, async (req, res) => {
    try {
        let query = `
            SELECT p.*, u.raison_sociale as entreprise_nom, t.intitule as theme_intitule, d.nom as domaine_nom
            FROM planifications p
            JOIN users u ON p.entreprise_id = u.id
            JOIN offre_formation o ON p.offre_formation_id = o.id
            JOIN themes_formation t ON o.theme_id = t.id
            JOIN domaines d ON t.domaine_id = d.id
            ORDER BY p.created_at DESC
        `;
        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/planifications/mes-planifications', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.*, t.intitule as theme_intitule, d.nom as domaine_nom
            FROM planifications p
            JOIN offre_formation o ON p.offre_formation_id = o.id
            JOIN themes_formation t ON o.theme_id = t.id
            JOIN domaines d ON t.domaine_id = d.id
            WHERE p.entreprise_id = ?
            ORDER BY p.created_at DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/planifications', authMiddleware, async (req, res) => {
    try {
        const { offre_formation_id, nb_groupes, date_debut_prevue } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO planifications (entreprise_id, offre_formation_id, nb_groupes, date_debut_prevue) VALUES (?, ?, ?, ?)',
            [req.user.id, offre_formation_id, nb_groupes || 1, date_debut_prevue]
        );
        res.status(201).json({ message: 'Planification créée', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/planifications/:id/valider', authMiddleware, async (req, res) => {
    try {
        await pool.execute('UPDATE planifications SET statut = "validee" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Planification validée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/planifications/:id/annuler', authMiddleware, async (req, res) => {
    try {
        await pool.execute('UPDATE planifications SET statut = "annulee" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Planification annulée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/planifications/:id', authMiddleware, async (req, res) => {
    try {
        await pool.execute('DELETE FROM planifications WHERE id = ?', [req.params.id]);
        res.json({ message: 'Planification supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== AFFECTATIONS ==========
app.get('/api/affectations', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT a.*, p.date_debut_prevue, u.raison_sociale as entreprise_nom, t.intitule as theme_intitule,
                   i.nom as intervenant_nom, i.prenom as intervenant_prenom
            FROM affectations a
            JOIN planifications p ON a.planification_id = p.id
            JOIN offre_formation o ON p.offre_formation_id = o.id
            JOIN themes_formation t ON o.theme_id = t.id
            JOIN users u ON p.entreprise_id = u.id
            JOIN intervenants iv ON a.intervenant_id = iv.id
            JOIN users i ON iv.user_id = i.id
            ORDER BY a.id DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/affectations', authMiddleware, async (req, res) => {
    try {
        const { planification_id, intervenant_id } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO affectations (planification_id, intervenant_id) VALUES (?, ?)',
            [planification_id, intervenant_id]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/affectations/:id/valider', authMiddleware, async (req, res) => {
    try {
        await pool.execute('UPDATE affectations SET statut_validation = "valide" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Affectation validée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/affectations/:id/refuser', authMiddleware, async (req, res) => {
    try {
        await pool.execute('UPDATE affectations SET statut_validation = "refuse" WHERE id = ?', [req.params.id]);
        res.json({ message: 'Affectation refusée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/affectations/:id', authMiddleware, async (req, res) => {
    try {
        await pool.execute('DELETE FROM affectations WHERE id = ?', [req.params.id]);
        res.json({ message: 'Affectation supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== NOTIFICATIONS ==========
app.get('/api/notifications', authMiddleware, async (req, res) => {
    try {
        const [notifications] = await pool.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        const [unread] = await pool.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND lue = 0',
            [req.user.id]
        );
        res.json({ notifications, unread_count: unread[0].count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/notifications/:id/lire', authMiddleware, async (req, res) => {
    try {
        await pool.execute('UPDATE notifications SET lue = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Notification marquée comme lue' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/notifications/lire-tout', authMiddleware, async (req, res) => {
    try {
        await pool.execute('UPDATE notifications SET lue = 1 WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Toutes les notifications sont lues' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({ message: 'API OFPPT opérationnelle', timestamp: new Date() });
});
// ========== TOP DOMAINES ==========
app.get('/api/statistiques/top-domaines', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT d.nom as domaine, COUNT(p.id) as nombre_planifications,
                   SUM(CASE WHEN p.statut = 'terminee' THEN 1 ELSE 0 END) as realisees
            FROM planifications p
            JOIN offre_formation o ON p.offre_formation_id = o.id
            JOIN themes_formation t ON o.theme_id = t.id
            JOIN domaines d ON t.domaine_id = d.id
            GROUP BY d.id
            ORDER BY nombre_planifications DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== TOP ENTREPRISES ==========
app.get('/api/statistiques/top-entreprises', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT u.raison_sociale as entreprise,
                   COUNT(p.id) as total_planifications,
                   SUM(CASE WHEN p.statut = 'terminee' THEN 1 ELSE 0 END) as realisees
            FROM users u
            JOIN planifications p ON u.id = p.entreprise_id
            WHERE u.role_id = 4
            GROUP BY u.id
            ORDER BY total_planifications DESC
            LIMIT 5
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== ÉVOLUTION ANNUELLE ==========
app.get('/api/statistiques/evolution-annuelle', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT o.annee,
                   COUNT(p.id) as total,
                   SUM(CASE WHEN p.statut = 'terminee' THEN 1 ELSE 0 END) as realisees
            FROM offre_formation o
            LEFT JOIN planifications p ON o.id = p.offre_formation_id
            GROUP BY o.annee
            ORDER BY o.annee ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// ========== DÉMARRAGE ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log('   ✅ Endpoints disponibles:');
    console.log('      POST   /api/auth/login');
    console.log('      GET    /api/statistiques/globales');
    console.log('      GET    /api/statistiques/dashboard');
    console.log('      CRUD   /api/intervenants');
    console.log('      CRUD   /api/domaines');
    console.log('      CRUD   /api/themes');
    console.log('      CRUD   /api/offres');
    console.log('      CRUD   /api/planifications');
    console.log('      CRUD   /api/affectations');
    console.log('      GET    /api/notifications');
});