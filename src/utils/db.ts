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
        avatar text NOT NULL,
        about text NOT NULL,
        creation text NOT NULL,
        type text NOT NULL,
        owner text NOT NULL,
        verified boolean NOT NULL,
        verificator text NOT NULL,
        otp text NOT NULL,
        PRIMARY KEY (id)
    )`, err => {
        if (err) {
            process.exit(-1);
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS guilds (
        id text NOT NULL,
        name text NOT NULL,
        description TEXT,
        icon text NOT NULL,
        public boolean NOT NULL,
        channels text NOT NULL,
        roles text NOT NULL,
        members text NOT NULL,
        bans text NOT NULL,
        invites text NOT NULL,
        PRIMARY KEY (id)
    )`, err => {
        if (err) {
            process.exit(-1);
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS friends (
        id text NOT NULL,
        friends text NOT NULL,
        PRIMARY KEY (id)
    )`, err => {
        if (err) {
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
    )`, err => {
        if (err) {
            process.exit(-1);
        }
    });
};