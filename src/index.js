const { createServer } = require('http');
const WebSocketServer = require('ws').WebSocketServer;
const WebSocket = require('ws').WebSocket;
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());
const wss = new WebSocketServer({ noServer: true });
const config = JSON.parse(require('fs').readFileSync(__dirname + '/../config.json').toString());
const ws = new WebSocket(`${config.dotAccount}/socket?dot-key=${encodeURIComponent(config.dotKey)}`);
const server = createServer(app);
const database = new Client({
    user: 'sapphire',
    host: 'localhost',
    database: 'sapphire',
    password: '',
    port: 5433
});

var websockets = new Map();

require('./websocket/index')(wss, websockets, server, database);

require('./routes/index')(websockets, app, database);

server.listen(3001, async () => {
    require('./init-database')(database);

    ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        websockets.get(parsed.for)?.forEach(websocket => {
            websocket.send(JSON.stringify(parsed.message));
        });
    });

    ws.on('close', () => {
        console.error('We lost connection to Dot Account. Dot Chat will shutdown.');
        process.exit(-1);
    });

    console.log('Listening on port 3001');
});