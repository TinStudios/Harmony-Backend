const { Client } = require('pg');
const { createServer } = require('http');
const { WebSocket, WebSocketServer } = require('ws');

const app = require('./app');
const config = require('./utils/config');
const { createLogger } = require('./utils/logger');

const wss = new WebSocketServer({ noServer: true });
const ws = new WebSocket(`ws://${config.ws.host}:${config.ws.port}/socket?key=${encodeURIComponent(config.ws.key)}`);
const database = new Client({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
});

const logger = createLogger(config.env === 'development');
const server = createServer(app);

const websockets = new Map();

require('./utils/ws')(wss, websockets, server, database);

require('./routes')(websockets, app, database);

server.listen(config.server.port, async () => {
    require('./utils/db')(database, logger);

    ws.on('message', data => {
        const parsed = JSON.parse(data.toString());
        websockets.get(parsed.for)?.forEach(websocket => {
            websocket.send(JSON.stringify(parsed.message));
        });
    });

    ws.on('close', () => {
        logger.error('We lost connection to Dot Account. Dot Chat will shutdown.');
        process.exit(-1);
    });

  logger.info(`Listening on port ${config.server.port}`);
});