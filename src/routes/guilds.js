module.exports = (websockets, app, database, checkLogin, flake) => {

    app.get('/guilds/*', async (req, res) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ""))
            .filter((x) => {
                return x != "";
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x.id == guildId);
                    database.query(`SELECT * FROM users`, async (err, dbRes) => {
                        if (!err) {
                            if (await checkLogin(req.headers.authorization) && dbRes.rows.find(x => x.token == req.headers.authorization).guilds.includes(guildId)) {
<<<<<<< HEAD
                                res.send(guild);
=======
                                res.send(Object.keys(guild).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).map(x => x == "channels" ? JSON.parse(guild[x]) : guild[x])[index] }), {}));
>>>>>>> 1e07bff (Revert "Initial Dot Account")
                            } else {
                                res.status(401).send({});
                            }
                        } else {
                            res.status(500).send({});
                        }
                    });
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(404).send({});
        }
    });

    app.post('/guilds', async (req, res) => {
        const userId = await checkLogin(req.headers.authorization);
        if (userId) {
<<<<<<< HEAD
            if(req.body.name && req.body.name.length < 31) {
=======
            if (req.body.name && req.body.name.length < 31) {
>>>>>>> 1e07bff (Revert "Initial Dot Account")
                const guild = {
                    id: flake.gen().toString(),
                    name: req.body.name,
                    owner: userId,
                    channels: [{ id: flake.gen().toString(), name: 'general', messages: [] }]
                }
<<<<<<< HEAD
            database.query(`INSERT INTO guilds (id, name, owner, channels) VALUES($1, $2, $3, $4)`, [guild.id, guild.name, guild.owner, JSON.stringify(guild.channels)], (err, dbRes) => {
                if (!err) {
                    res.status(200).send(guild);
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
        }
=======
                database.query(`INSERT INTO guilds (id, name, owner, channels) VALUES($1, $2, $3, $4)`, [guild.id, guild.name, guild.owner, JSON.stringify(guild.channels)], (err, dbRes) => {
                    if (!err) {
                        database.query(`SELECT * FROM users`, (err, dbRes) => {
                            if (!err) {
                                let guilds = JSON.parse(dbRes.rows.find(x => x.token == req.headers.authorization).guilds);
                                guilds.push(guild.id);
                                database.query(`UPDATE users SET guilds = '${JSON.stringify(guilds)}' WHERE id = '${userId}'`, (err, dbRes) => {
                                    if (!err) {
                                        websockets.get(req.headers.authorization)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: "guildCreated", guild: guild }));
                                        });
                                        res.status(200).send(guild);
                                    } else {
                                        res.status(500).send({});
                                    }
                                });
                            }
                        });
                    } else {
                        res.status(500).send({});
                    }
                });
            } else {
                res.status(400).send({});
            }
>>>>>>> 1e07bff (Revert "Initial Dot Account")
        } else {
            res.status(401).send({});
        }
    });
};