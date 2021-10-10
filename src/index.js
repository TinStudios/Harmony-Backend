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

require('./websocket/index')(wss, websockets, server, database);

require('./routes/index')(websockets, app, database);

server.listen(8080, async () => {
    require('./init-database')(database);
    console.log('Listening on port 8080');
});