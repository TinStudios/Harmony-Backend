const { createServer } = require('http');
const WebSocketServer = require('ws').WebSocketServer;
const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.json());
const wss = new WebSocketServer({ noServer: true });
const server = createServer(app);
const database = new Client({
    user: 'sapphire',
    host: 'localhost',
    database: 'sapphire',
    password: '',
    port: 5432
});

var websockets = new Map();

require('./websocket/index')(wss, websockets, server, database, checkLogin);

require('./routes/index')(websockets, app, database, checkLogin);

server.listen(8080, async () => {
    require('./init-database')(database);
    console.log('Listening on port 8080');
});

async function checkLogin(token) {
    return await new Promise(resolve => { database.query(`SELECT token FROM users`, async (err, res) => {
        if (!err) {
            if (res.rows.map(x => x.token == token).includes(true)) {
                try {
                    const { importSPKI } = require('jose/key/import');
                    const { jwtVerify } = require('jose/jwt/verify');

                    const ecPublicKey = await importSPKI(`-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE+pv3C9HethWRRFhY53YD6XDRpYag
6dprHPlxjG0bIGy+2FMVhWutJTcnOlHAgmYv5GRXkmq5AGwpb+sjQeHrFQ==
-----END PUBLIC KEY-----`, 'ES256');

                    const info = await jwtVerify(token.split("Bearer ")[1], ecPublicKey, {
                        issuer: 'dot-studios',
                        audience: 'dot-studios'
                    });
                    resolve(info.payload.info.id);

                } catch {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        } else {
            resolve(false);
        }
    });
});
}