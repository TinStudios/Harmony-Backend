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
                                res.send(guild);
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
            if(req.body.name && req.body.name.length < 31) {
                const guild = {
                    id: flake.gen().toString(),
                    name: req.body.name,
                    owner: userId,
                    channels: [{ id: flake.gen().toString(), name: 'general', messages: [] }]
                }
            database.query(`INSERT INTO guilds (id, name, owner, channels) VALUES($1, $2, $3, $4)`, [guild.id, guild.name, guild.owner, JSON.stringify(guild.channels)], (err, dbRes) => {
                if (!err) {
                    database.query(`SELECT * FROM users`, (err, dbRes) => {
                        if (!err) {
                    let guilds = JSON.parse(dbRes.rows.find(x => x.token == req.headers.authorization).guilds);
                    guilds.push(guild.id);
                    database.query(`UPDATE users SET guilds = ${JSON.stringify(guilds)} WHERE id = userId`, (err, dbRes) => {
                        if (!err) {
                    res.status(200).send(guild);
                        } else {
                            console.log(err);
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
        } else {
            res.status(401).send({});
        }
    });
};