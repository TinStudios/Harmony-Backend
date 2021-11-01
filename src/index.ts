import { Client } from 'pg';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import app from './app';
import config from './utils/config';
import { createLogger } from './utils/logger';

const wss = new WebSocketServer({ noServer: true });
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
    
  logger.info(`Listening on port ${config.server.port}`);
});