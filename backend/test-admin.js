// test-admin.js
const http = require('http');

const data = JSON.stringify({
    email: "admin@ofppt.ma",
    password: "admin123"
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
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
        console.log('Statut:', res.statusCode);
        if (res.statusCode === 200) {
            const json = JSON.parse(responseData);
            console.log('✅ Connexion réussie !');
            console.log('Token:', json.token.substring(0, 50) + '...');
            console.log('Rôle:', json.user.role);
        } else {
            console.log('❌ Échec:', responseData);
        }
    });
});

req.on('error', (error) => { console.error('Erreur:', error); });
req.write(data);
req.end();