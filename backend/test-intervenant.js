// test-intervenant.js
const http = require('http');

// 1. D'abord, on se connecte avec l'admin pour récupérer un token
const loginData = JSON.stringify({
    email: "admin@ofppt.ma",
    password: "admin123"
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
};

const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const response = JSON.parse(data);
        const token = response.token;
        
        console.log('🔐 Connecté en tant qu\'admin, token reçu');
        
        // 2. Créer un intervenant avec le token
        const intervenantData = JSON.stringify({
            email: "intervenant1@test.com",
            password: "123456",
            nom: "Martin",
            prenom: "Sophie",
            telephone: "0612345678",
            adresse: "Casablanca",
            matricule: "INT-001",
            type_interne: 1,
            date_naissance: "1985-06-15",
            genre: "F",
            lieu_affectation: "OFPPT Casablanca"
        });
        
        const intervenantOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/intervenants',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(intervenantData)
            }
        };
        
        const intervenantReq = http.request(intervenantOptions, (res2) => {
            let data2 = '';
            res2.on('data', (chunk) => { data2 += chunk; });
            res2.on('end', () => {
                console.log('📝 Création intervenant - Statut:', res2.statusCode);
                console.log('Réponse:', JSON.parse(data2));
            });
        });
        
        intervenantReq.on('error', (error) => {
            console.error('Erreur:', error.message);
        });
        
        intervenantReq.write(intervenantData);
        intervenantReq.end();
    });
});

loginReq.on('error', (error) => {
    console.error('Erreur de connexion:', error.message);
});

loginReq.write(loginData);
loginReq.end();