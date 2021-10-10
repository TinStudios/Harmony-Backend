import { Client } from "pg";
import { NFTStorage, File } from 'nft.storage'
import fs from 'fs';

export default async (database: Client, logger: any, storage: NFTStorage) => {
    await database.connect();

    database.query(`CREATE TABLE IF NOT EXISTS users (
        id text NOT NULL,
        token text NOT NULL,
        email text NOT NULL,
        password text NOT NULL,
        username text NOT NULL,
        discriminator text NOT NULL,
        creation text NOT NULL,
        verified boolean NOT NULL,
        verificator text NOT NULL,
        otp text NOT NULL,
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (err) {
            logger.error('Something went terribly wrong initializing. Seltorn will shutdown.');
            process.exit(-1);
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS guilds (
        id text NOT NULL,
        name text NOT NULL,
        description TEXT,
        public boolean NOT NULL,
        channels text NOT NULL,
        roles text NOT NULL,
        members text NOT NULL,
        bans text NOT NULL,
        invites text NOT NULL,
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (err) {
            logger.error('Something went terribly wrong initializing. Seltorn will shutdown.');
            process.exit(-1);
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS invites (
        code text NOT NULL,
        guild text NOT NULL,
        channels text NOT NULL,
        PRIMARY KEY (code)
    )`, (err, dbRes) => {
        if (err) {
            logger.error('Something went terribly wrong initializing. Seltorn will shutdown.');
            process.exit(-1);
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS friends (
        id text NOT NULL,
        friends text NOT NULL,
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (err) {
            logger.error('Something went terribly wrong initializing. Seltorn will shutdown.');
            process.exit(-1);
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS meta (
        url text NOT NULL,
        creation text NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        image text NOT NULL,
        PRIMARY KEY (url)
    )`, (err, dbRes) => {
        if (err) {
            logger.error('Something went terribly wrong initializing. Seltorn will shutdown.');
            process.exit(-1);
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS files (
        id text NOT NULL,
        type text NOT NULL,
        url text NOT NULL,
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (!err) {
            database.query('SELECT * FROM files', async (err, dbRes) => {
                if (!err) {
            if (!dbRes.rows.find(x => x.id === 'default' && x.type === 'users')) {
            const defaultPfp = await storage.store({
                name: 'Default Avatar',
                description: 'Seltorn\'s default avatar',
                image: new File([fs.readFileSync(__dirname + '/../../files/default.png')], 'default.png', { type: 'image/png' })
              });
            database.query(`INSERT INTO files (id, type, url) VALUES ($1, $2, $3)`, ['default', 'users', defaultPfp.url], (err, dbRes) => {
                if (err) {
                    logger.error('Something went terribly wrong initializing. Seltorn will shutdown.');
            process.exit(-1);
                }
            });
        }
    } else {
        logger.error('Something went terribly wrong initializing. Seltorn will shutdown.');
            process.exit(-1);
    }
});

database.query('SELECT * FROM files', async (err, dbRes) => {
    if (!err) {
if (!dbRes.rows.find(x => x.id === '0' && x.type === 'users')) {
            const systemPfp = await storage.store({
                name: 'System\'s Avatar',
                description: 'Seltorn\'s system avatar',
                image: new File([fs.readFileSync(__dirname + '/../../files/system.png')], 'system.png', { type: 'image/png' })
              });
            database.query(`INSERT INTO files (id, type, url) VALUES ($1, $2, $3)`, ['0', 'users', systemPfp.url], (err, dbRes) => {
                if (err) {
                    logger.error('Something went terribly wrong initializing. Seltorn will shutdown.');
            process.exit(-1);
                }
            });
        }
    } else {
        logger.error('Something went terribly wrong initializing. Seltorn will shutdown.');
        process.exit(-1);
    }
    });

}
    });
};