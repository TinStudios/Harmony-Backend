import { Client } from 'pg';
import { createServer } from 'http';
<<<<<<< HEAD
<<<<<<< HEAD
import { WebSocketServer, Server } from 'ws';
=======
import { WebSocketServer } from 'ws';
>>>>>>> 0718f96 (Changed to TypeScript)
=======
import { WebSocketServer, Server } from 'ws';
>>>>>>> 2aecc42 (Changed to import)

import app from './app';
import config from './utils/config';
import { createLogger } from './utils/logger';

<<<<<<< HEAD
<<<<<<< HEAD
import { NFTStorage } from 'nft.storage';

=======
>>>>>>> 2aecc42 (Changed to import)
import ws from './utils/ws';
import routes from './routes';
import db from './utils/db';

<<<<<<< HEAD
const wss = new WebSocketServer({ noServer: true });
const database = new Client({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
=======
=======
>>>>>>> 2aecc42 (Changed to import)
const wss = new WebSocketServer({ noServer: true });
const database = new Client({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
>>>>>>> 0718f96 (Changed to TypeScript)
});

const logger = createLogger(config.env === 'development');
const server = createServer(app);

const websockets = new Map();

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
const storage = new NFTStorage({ token: config.storage.apiKey })

ws(wss, websockets, server as unknown as Server, database);

routes(websockets, app, database, logger, storage, config.client.domain);

server.listen(config.server.port, async () => {
  db(database, logger, storage);

=======
require('./utils/ws')(wss, websockets, server, database, config);
=======
require('./utils/ws')(wss, websockets, server, database);
>>>>>>> b730c3e (Tiny change)
=======
require('./utils/ws')(wss, websockets, server, database);
>>>>>>> ace536b (?)
=======
ws(wss, websockets, server as unknown as Server, database);
>>>>>>> 2aecc42 (Changed to import)

routes(websockets, app, database);

server.listen(config.server.port, async () => {
    db(database, logger);
    
>>>>>>> 0718f96 (Changed to TypeScript)
  logger.info(`Listening on port ${config.server.port}`);
});