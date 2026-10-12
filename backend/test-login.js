// test-login.js
const http = require('http');

const data = JSON.stringify({
    email: "test@entreprise.com",
    password: "123456"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
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
        console.log('Réponse:', JSON.parse(responseData));
    });
});

req.on('error', (error) => {
    console.error('Erreur:', error.message);
});

req.write(data);
req.end();