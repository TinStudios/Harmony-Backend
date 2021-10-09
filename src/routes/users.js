module.exports = (websockets, app, database, checkLogin) => {
    app.patch('/users/@me', async (req, res) => {
        const userId = await checkLogin(req.headers.authorization);
        if (userId) {
            if (req.body.username && req.body.username.length < 31) {
                database.query(`UPDATE users SET username = $1 WHERE id = '${userId}'`, [req.body.username], err => {
                    if (!err) {
                        database.query(`SELECT * FROM users`, async (err, dbRes) => {
                            if (!err) {
                                const user = dbRes.rows.find(x => x.token == req.headers.authorization);
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
};