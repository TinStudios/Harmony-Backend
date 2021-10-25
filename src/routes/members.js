module.exports = (websockets, app, database, flake) => {

    app.get('/guilds/*/members', (req, res) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (JSON.parse(guild.members).find(x => x.id == res.locals.user)) {
                        require('needle').get(`${JSON.parse(require('fs').readFileSync(__dirname + '/../../config.json').toString()).account}/users/all`, {
                            headers: {
                                'Authorization': req.headers.authorization
                            }
                        }, function (err, resp) {
                            if (!err) {
                                if (resp.statusCode == 200) {
                                        res.send(JSON.parse(guild.members).map(x => {
                                            if (x) {
                                                x.username = resp.body.find(y => x?.id == y.id).username;
                                                x.discriminator = resp.body.find(y => x?.id == y.id).discriminator;
                                            }
                                            return x;
                                        }).sort((a, b) => (a.nickname ?? a.username) > (b.nickname ?? b.username) ? 1 : (a.nickname ?? a.username) < (b.nickname ?? b.username) ? -1 : 0));
                                } else {
                                    res.status(resp.statusCode).send({});
                                }
                            } else {
                                res.status(500).send({});
                            }
                        });
                    } else {
                        res.status(401).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(404).send({});
        }
    });

    app.get('/guilds/*/members/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        if (guildId && userId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (JSON.parse(guild.members).includes(res.locals.user)) {
                        require('needle').get(`${JSON.parse(require('fs').readFileSync(__dirname + '/../../config.json').toString()).account}/users/` + userId, {
                            headers: {
                                'Authorization': req.headers.authorization
                            }
                        }, function (err, resp) {
                            if (!err) {
                                if (resp.statusCode == 200) {
                                    if (!err) {
                                        res.send(JSON.parse(guild.members).filter(x => x?.id == userId).map(x => {
                                            x.username = resp.body.username;
                                            x.discriminator = resp.body.discriminator;
                                            return x;
                                        })[0]);
                                    } else {
                                        res.status(500).send({});
                                    }
                                } else {
                                    res.status(resp.statusCode).send({});
                                }
                            } else {
                                res.status(500).send({});
                            }
                        });
                    } else {
                        res.status(401).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(404).send({});
        }
    });

    app.patch('/guilds/*/members/@me', (req, res) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.find(x => (JSON.parse(guild.roles).find(y => y.id == x).permissions & 0x0000000200) == 0x0000000200)) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname == null) {
                                const members = JSON.parse(guild.members);
                                const user = members.find(x => x?.id == res.locals.user);
                                user.nickname = req.body.nickname ? req.body.nickname : null;
                                members[members.findIndex(x => x?.id == res.locals.user)] = user;
                                database.query(`UPDATE guilds SET members = $1 WHERE id = $2`, [JSON.stringify(members), guildId], (err, dbRes) => {
                                    if (!err) {
                                        members.forEach(member => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'memberEdited', member: user }));
                                            });
                                        });
                                        res.status(200).send(user);
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
                    } else {
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(404).send({});
        }
    });

    app.patch('/guilds/*/members/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        if (guildId && userId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        if (JSON.parse(guild.members).find(x => x?.id == res.locals.user).roles.find(x => (JSON.parse(guild.roles).find(y => y.id == x).permissions & 0x0000000400) == 0x0000000400)) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname == null) {
                                const members = JSON.parse(guild.members);
                                const user = members.find(x => x?.id == userId);
                                user.nickname = req.body.nickname ? req.body.nickname : null;
                                members[members.findIndex(x => x?.id == userId)] = user;
                                database.query(`UPDATE guilds SET members = $1 WHERE id = $2`, [JSON.stringify(members), guildId], (err, dbRes) => {
                                    if (!err) {
                                        members.forEach(member => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'memberEdited', member: user }));
                                            });
                                        });
                                        res.status(200).send(user);
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
                    } else {
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(404).send({});
        }
    });

    app.delete('/guilds/*/members/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        if (guildId && userId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.find(x => (JSON.parse(guild.roles).find(y => y?.id == x).permissions & 0x0000000002) == 0x0000000002)) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname == null) {
                                const members = JSON.parse(guild.members);
                                const user = members.find(x => x?.id == userId);
                                delete members[members.findIndex(x => x?.id == userId)];
                                let bans = JSON.parse(guild.bans);
                                if (req.body.ban) {
                                    bans.push(userId);
                                }
                                database.query(`UPDATE guilds SET members = $1, bans = $2 WHERE id = $3`, [JSON.stringify(members), JSON.stringify(bans), guildId], (err, dbRes) => {
                                    if (!err) {
                                        members.forEach(member => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'memberKicked', member: user }));
                                            });
                                        });
                                        res.status(200).send(user);
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
                    } else {
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(404).send({});
        }
    });

};