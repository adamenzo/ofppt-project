// test-api.js - Fichier de test pour l'API
const http = require('http');

const data = JSON.stringify({
    email: "test@entreprise.com",
    password: "123456",
    nom: "Test",
    prenom: "Entreprise",
    telephone: "0612345678",
    adresse: "Casablanca, Maroc",
    raison_sociale: "Ma Super Entreprise Test",
    role_id: 4
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('Statut:', res.statusCode);
        try {
            const json = JSON.parse(responseData);
            console.log('Réponse:', json);
        } catch(e) {
            console.log('Réponse brute:', responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('Erreur:', error.message);
});

req.write(data);
req.end();