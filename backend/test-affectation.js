// test-affectation.js - Test complet des affectations
const http = require('http');

let adminToken = '';

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
            createAffectation();
        });
    });
    req.write(data);
    req.end();
}

// 2. Créer une affectation
function createAffectation() {
    const data = JSON.stringify({
        planification_id: 1,
        intervenant_id: 1
    });
    
    const req = http.request({
        hostname: 'localhost', port: 5000, path: '/api/affectations', method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            console.log('📝 Création affectation - Statut:', res.statusCode);
            console.log('   Réponse:', JSON.parse(d), '\n');
            getAllAffectations();
        });
    });
    req.write(data);
    req.end();
}

// 3. Récupérer toutes les affectations
function getAllAffectations() {
    const req = http.request({
        hostname: 'localhost', port: 5000, path: '/api/affectations', method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            console.log('📋 Toutes les affectations:');
            console.log(JSON.parse(d), '\n');
            validerAffectation();
        });
    });
    req.end();
}

// 4. Valider l'affectation
function validerAffectation() {
    const req = http.request({
        hostname: 'localhost', port: 5000, path: '/api/affectations/1/valider', method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            console.log('✅ Validation affectation - Statut:', res.statusCode);
            console.log('   Réponse:', JSON.parse(d), '\n');
            console.log('🎉 Test terminé avec succès !');
        });
    });
    req.end();
}

// Démarrer le test
loginAdmin();