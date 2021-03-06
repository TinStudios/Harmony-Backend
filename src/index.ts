import cassandra from 'cassandra-driver';
import { createServer } from 'http';
import { WebSocketServer, Server } from 'ws';

import app from './app';
import config from './utils/config';
import { createLogger } from './utils/logger';

import ws from './utils/ws';
import routes from './routes';
import db from './utils/db';

const wss = new WebSocketServer({ noServer: true });
const database = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'harmony',
  credentials: {
    username: config.db.username,
    password: config.db.password
  }
});

const logger = createLogger(config.env === 'development');
const server = createServer(app);

const websockets = new Map();

ws(wss, websockets, server as unknown as Server, database);

routes(websockets, app, database, logger, config.storage.apiKey, config.recaptcha.secretKey, config.storage.domain, config.client.domain);

server.listen(config.server.port, async () => {
  db(database, logger);

  logger.info(`Listening on port ${config.server.port}`);
});