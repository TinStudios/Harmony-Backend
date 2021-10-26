module.exports = async database => {
    await database.connect();

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
            console.error('Something went terribly wrong initializing. Dot Chat will shutdown.');
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
            console.error('Something went terribly wrong initializing. Dot Chat will shutdown.');
            process.exit(-1);
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS friends (
        id text NOT NULL,
        friends text NOT NULL,
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (err) {
            console.error('Something went terribly wrong initializing. Dot Chat will shutdown.');
            process.exit(-1);
        }
    });

};