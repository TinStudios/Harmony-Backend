import { Client } from 'pg';
import { createServer } from 'http';
import { WebSocketServer, Server } from 'ws';

import app from './app';
import config from './utils/config';
import { createLogger } from './utils/logger';

import { NFTStorage } from 'nft.storage';

import ws from './utils/ws';
import routes from './routes';
import db from './utils/db';

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

const storage = new NFTStorage({ token: config.storage.apiKey })

ws(wss, websockets, server as unknown as Server, database);

routes(websockets, app, database, logger, storage, config.client.domain);

server.listen(config.server.port, async () => {
  db(database, logger, storage);

  logger.info(`Listening on port ${config.server.port}`);
});