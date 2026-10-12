// test-offres.js - Test complet des offres de formation
const http = require('http');

let token = '';

// 1. Se connecter en tant qu'admin
const loginData = JSON.stringify({
    email: "admin@ofppt.ma",
    password: "admin123"
});

const loginReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const response = JSON.parse(data);
        token = response.token;
        console.log('✅ Connecté, token reçu\n');
        
        // 2. Créer un domaine
        createDomaine();
    });
});

loginReq.write(loginData);
loginReq.end();

function createDomaine() {
    const data = JSON.stringify({ nom: "Digital" });
    
    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/domaines',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            console.log('📂 Domaine créé:', JSON.parse(d).message);
            createTheme();
        });
    });
    
    req.write(data);
    req.end();
}

function createTheme() {
    const data = JSON.stringify({
        domaine_id: 1,
        intitule: "Développement Web Full Stack",
        nb_jours: 30,
        nb_max_participants: 15
    });
    
    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/themes',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            console.log('📚 Thème créé:', JSON.parse(d).message);
            createOffre();
        });
    });
    
    req.write(data);
    req.end();
}

function createOffre() {
    const data = JSON.stringify({
        annee: 2026,
        theme_id: 1,
        region_id: null
    });
    
    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/offres',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            console.log('📦 Offre créée:', JSON.parse(d).message);
            getAllOffres();
        });
    });
    
    req.write(data);
    req.end();
}

function getAllOffres() {
    const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/offres',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
        let d = '';
        res.on('data', chunk => d += chunk);
        res.on('end', () => {
            const offres = JSON.parse(d);
            console.log('\n📋 Liste des offres:');
            console.table(offres);
            console.log('\n✅ Test terminé avec succès !');
        });
    });
    
    req.end();
}