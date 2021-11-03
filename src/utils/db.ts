import { Client } from "pg";

export default async (database: Client, logger: any) => {
    await database.connect();

    database.query(`CREATE TABLE IF NOT EXISTS users (
        id text NOT NULL,
        token text NOT NULL,
        email text NOT NULL,
        password text NOT NULL,
        username text NOT NULL,
        discriminator text NOT NULL,
        creation text NOT NULL,
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
        public TEXT NOT NULL,
        channels text NOT NULL,
        roles text NOT NULL,
        members text NOT NULL,
        bans text NOT NULL,
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

};