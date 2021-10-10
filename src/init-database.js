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
        services text NOT NULL,
        PRIMARY KEY (id)
    )`, (err, dbRes) => {
        if (err) {
            console.error("Something went terribly wrong initializing. Dot Accounts will shutdown.");
            process.exit(-1);
        }
    });

};