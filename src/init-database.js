module.exports = async database => {
    await database.connect();

    database.query(`CREATE TABLE IF NOT EXISTS users (
        id text NOT NULL,
        token text NOT NULL,
        email text NOT NULL,
        password text NOT NULL,
        username text NOT NULL,
        discriminator text NOT NULL,
        creation text NOT NULL,
        guilds text NOT NULL,
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (err) {
            console.error("Something went terribly wrong initializing. Dot Chat will shutdown.");
            process.exit(-1);
        }
    });

    database.query(`CREATE TABLE IF NOT EXISTS guilds (
        id text NOT NULL,
        name text NOT NULL,
        owner text NOT NULL,
        channels text NOT NULL,
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (err) {
            console.error("Something went terribly wrong initializing. Dot Chat will shutdown.");
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
            console.error("Something went terribly wrong initializing. Dot Chat will shutdown.");
            process.exit(-1);
        }
    });

};