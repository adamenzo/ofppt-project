// test-planification.js
const http = require('http');

let adminToken = '';
let entrepriseToken = '';

// 1. Connexion admin
function loginAdmin() {
    const data = JSON.stringify({ email: "admin@ofppt.ma", password: "admin123" });
    
    const req = http.request({
        hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            adminToken = JSON.parse(d).token;
            console.log('✅ Admin connecté\n');
            loginEntreprise();
        });
    });
    req.write(data);
    req.end();
}

// 2. Connexion entreprise (créée précédemment)
function loginEntreprise() {
    const data = JSON.stringify({ email: "test@entreprise.com", password: "123456" });
    
    const req = http.request({
        hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            entrepriseToken = JSON.parse(d).token;
            console.log('✅ Entreprise connectée\n');
            createPlanification();
        });
    });
    req.write(data);
    req.end();
}

// 3. Créer une planification (entreprise)
function createPlanification() {
    const data = JSON.stringify({
        offre_formation_id: 1,
        nb_groupes: 2,
        date_debut_prevue: "2026-06-01"
    });
    
    const req = http.request({
        hostname: 'localhost', port: 5000, path: '/api/planifications', method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${entrepriseToken}`
        }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            console.log('📝 Création planification - Statut:', res.statusCode);
            console.log('   Réponse:', JSON.parse(d), '\n');
            getMesPlanifications();
        });
    });
    req.write(data);
    req.end();
}

// 4. Voir mes planifications (entreprise)
function getMesPlanifications() {
    const req = http.request({
        hostname: 'localhost', port: 5000, path: '/api/planifications/mes-planifications', method: 'GET',
        headers: { 'Authorization': `Bearer ${entrepriseToken}` }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            console.log('📋 Mes planifications:');
            console.log(JSON.parse(d), '\n');
            getAllPlanificationsAdmin();
        });
    });
    req.end();
}

// 5. Voir toutes les planifications (admin)
function getAllPlanificationsAdmin() {
    const req = http.request({
        hostname: 'localhost', port: 5000, path: '/api/planifications', method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            console.log('📋 Toutes les planifications (vue admin):');
            console.log(JSON.parse(d), '\n');
            validerPlanification();
        });
    });
    req.end();
}

// 6. Valider la planification (admin)
function validerPlanification() {
    const req = http.request({
        hostname: 'localhost', port: 5000, path: '/api/planifications/1/valider', method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            console.log('✅ Validation planification - Statut:', res.statusCode);
            console.log('   Réponse:', JSON.parse(d), '\n');
            console.log('🎉 Test terminé avec succès !');
        });
    });
    req.end();
}

// Démarrer le test
loginAdmin();