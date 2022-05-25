import cassandra from "cassandra-driver";

export default async (database: cassandra.Client, logger: any) => {
    await database.connect();

    database.execute(`CREATE TABLE IF NOT EXISTS users (
        id uuid,
        "token" text,
        email text,
        password text,
        username text,
        discriminator text,
        avatar text,
        about text,
        creation bigint,
        type text,
        owner text,
        verified BOOLEAN,
        verificator text,
        otp text,
        PRIMARY KEY (id)
    )`).catch(err => {
        console.log(err);
            process.exit(-1);
        });

    database.execute(`CREATE TYPE IF NOT EXISTS channelRole (
        id uuid,
        permissions bigint
    )`).catch(err => {
        console.log(err);
        process.exit(-1);
    });

    database.execute(`CREATE TYPE IF NOT EXISTS webhook (
        "token" text,
        username text
    )`).catch(err => {
        console.log(err);
        process.exit(-1);
    });

    database.execute(`CREATE TYPE IF NOT EXISTS message (
        id uuid,
        author uuid,
        content text,
        creation bigint,
        edited bigint,
        type text
    )`).catch(err => {
        console.log(err);
        process.exit(-1);
    });

    database.execute(`CREATE TYPE IF NOT EXISTS channel (
        id uuid,
        position bigint,
        name text,
        topic text,
        type text,
        creation bigint,
        roles list<frozen<channelRole>>,
        webhooks list<frozen<webhook>>,
        messages list<frozen<message>>,
        pins list<uuid>
    )`).catch(err => {
        console.log(err);
        process.exit(-1);
    });

    database.execute(`CREATE TYPE IF NOT EXISTS role (
        id uuid,
        name text,
        permissions bigint,
        color text,
        hoist boolean
    )`).catch(err => {
        console.log(err);
        process.exit(-1);
    });

    database.execute(`CREATE TYPE IF NOT EXISTS member (
        id uuid,
        nickname text,
        roles list<text>
    )`).catch(err => {
        console.log(err);
        process.exit(-1);
    });

    database.execute(`CREATE TYPE IF NOT EXISTS invite (
        code text,
        author uuid,
        expiration bigint,
        maxUses bigint,
        uses bigint
    )`).catch(err => {
        console.log(err);
        process.exit(-1);
    });

    database.execute(`CREATE TABLE IF NOT EXISTS guilds (
        id uuid,
        name text,
        description text,
        icon text,
        public BOOLEAN,
        channels list<frozen<channel>>,
        roles list<frozen<role>>,
        members list<frozen<member>>,
        creation bigint,
        bans list<text>,
        invites list<frozen<invite>>,
        PRIMARY KEY (id)
    )`).catch(err => {
        console.log(err);
        process.exit(-1);
    });

    database.execute(`CREATE TABLE IF NOT EXISTS meta (
        url text,
        creation text,
        title text,
        description text,
        image text,
        PRIMARY KEY (url)
    )`).catch(err => {
        console.log(err);
        process.exit(-1);
    });
};