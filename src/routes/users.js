module.exports = (websockets, app, database, checkLogin) => {
    app.patch('/users/@me', async (req, res) => {
        const userId = await checkLogin(req.headers.authorization);
        if (userId) {
            if (req.body.username && req.body.username.length < 31) {
                database.query(`SELECT * FROM users`, async (err, dbRes) => {
                    if (!err) {
                        const user = dbRes.rows.find(x => x.token == req.headers.authorization);
                database.query(`UPDATE users SET username = $1, discriminator = $2 WHERE id = '${userId}'`, [req.body.username, dbRes.rows.find(x => x.username == req.body.username && x.discriminator == user.discriminator) ? generateDiscriminator(dbRes.rows.filter(x => x.username == req.body.username)) : user.discriminator], err => {
                            if (!err) {
                                res.send(Object.keys(user).reduce((obj, key, index) => key != "token" && key != "password" ? ({ ...obj, [key]: Object.keys(user).map(x => x == "guilds" ? JSON.parse(user[x]) : user[x])[index] }) : null, {}));
                            } else {
                                res.status(500).send({});
                            }
                        });
                    } else {
                        res.status(500).send({});
                    }
                });
            }
        }
    });

    function generateDiscriminator(excluded) {
        const pre = Math.floor(Math.random() * (9999 - 1 + 1) + 1);
        const final = pre.toString().padStart(4, '0');
        if (excluded.includes(final)) {
            return generateDiscriminator(excluded);
        } else {
            return final;
        }
    }
};