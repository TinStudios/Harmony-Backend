import { Client } from "pg";
<<<<<<< HEAD
<<<<<<< HEAD
import { NFTStorage, File } from 'nft.storage'
import fs from 'fs';

export default async (database: Client, logger: any, storage: NFTStorage) => {
=======

<<<<<<< HEAD
module.exports = async (database: Client, logger: any) => {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
export default async (database: Client, logger: any) => {
>>>>>>> 2aecc42 (Changed to import)
=======
import fs from 'fs';

export default async (database: Client, logger: any, google: any) => {
>>>>>>> 1d14aba (new storage...  aaaaaa 🥲)
    await database.connect();

    database.query(`CREATE TABLE IF NOT EXISTS users (
        id text NOT NULL,
        token text NOT NULL,
        email text NOT NULL,
        password text NOT NULL,
        username text NOT NULL,
        discriminator text NOT NULL,
        creation text NOT NULL,
<<<<<<< HEAD
<<<<<<< HEAD
        verified boolean NOT NULL,
        verificator text NOT NULL,
        otp text NOT NULL,
=======
>>>>>>> 0718f96 (Changed to TypeScript)
=======
        verified boolean NOT NULL,
        verificator text NOT NULL,
>>>>>>> f899d83 (Some changes (like adding email verification))
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (err) {
            error();
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS guilds (
        id text NOT NULL,
        name text NOT NULL,
        description TEXT,
<<<<<<< HEAD
<<<<<<< HEAD
        public boolean NOT NULL,
=======
        public TEXT NOT NULL,
>>>>>>> 0718f96 (Changed to TypeScript)
=======
        public boolean NOT NULL,
>>>>>>> e27e080 (Fixes)
        channels text NOT NULL,
        roles text NOT NULL,
        members text NOT NULL,
        bans text NOT NULL,
<<<<<<< HEAD
<<<<<<< HEAD
        invites text NOT NULL,
=======
>>>>>>> 0718f96 (Changed to TypeScript)
=======
        invites text NOT NULL,
>>>>>>> 51556ba (Some changes)
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (err) {
            error();
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS invites (
        code text NOT NULL,
        guild text NOT NULL,
        channels text NOT NULL,
        PRIMARY KEY (code)
    )`, (err, dbRes) => {
        if (err) {
            error();
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS friends (
        id text NOT NULL,
        friends text NOT NULL,
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (err) {
            error();
        }
    });

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
>>>>>>> 0718f96 (Changed to TypeScript)
=======
    database.query(`CREATE TABLE IF NOT EXISTS files (
        id text NOT NULL,
        url text NOT NULL,
        type text NOT NULL,
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (!err) {
            database.query(`SELECT * FROM files`, async (err, dbRes) => {
                if(!err) {
                    if(!dbRes.rows.find(x => x.id === '0')) {
                        google.uploadFile('0', fs.createReadStream(__dirname + '/../../files/system.png'), 'users', 'image/png', database, false);
                    }
                    if(!dbRes.rows.find(x => x.id === 'default')) {
                        google.uploadFile('default', fs.createReadStream(__dirname + '/../../files/user.png'), 'users', 'image/png', database, false);
                    }
                } else {
                    error();
                }
            });
        } else {
            error();
        }
    });

    function error() {
        logger.error('Something went terribly wrong initializing. Seltorn will shutdown.');
            process.exit(-1);
    }
>>>>>>> 1d14aba (new storage...  aaaaaa 🥲)
};