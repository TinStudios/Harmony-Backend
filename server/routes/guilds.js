module.exports = (websockets, app, database, flake) => {

    app.get('/guilds', (req, res) => {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guilds = dbRes.rows.filter(x => x?.members?.includes(res.locals.user));
                            res.send(guilds.map(guild => Object.keys(guild).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).map(x => x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(guild[x]) : guild[x])[index] }), {})));
                } else {
                    res.status(500).send({});
                }
            });
    });

    app.get('/guilds/*', (req, res) => {
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
                        if (guild.members.includes(res.locals.user)) {
                            res.send(Object.keys(guild).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).map(x => x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(guild[x]) : guild[x])[index] }), {}));
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

    app.post('/guilds', (req, res) => {
        if (req.body.name && req.body.name.length < 31) {
            const guild = {
                id: flake.gen().toString(),
                name: req.body.name,
                description: req.body.description ?? null,
                public: false,
                channels: [{ id: flake.gen().toString(), name: 'general', topic: null, creation: Date.now(), roles: [{ id: 0, permissions: 456 }, { id: 1, permissions: 192 }], messages: [], pins: [] }],
                roles: [{ id: '0', name: 'Owner', permissions: 3647, color: null, hoist: false }, { id: 1, name: 'Members', permissions: 513, color: null, hoist: false }],
                members: [{ id: res.locals.user, nickname: null, roles: ['0', '1'] }],
                creation: Date.now(),
                bans: []
            }
            database.query(`INSERT INTO guilds (id, name, description, public, channels, roles, members, bans) VALUES($1, $2, $3, $4, $5, $6, $7, $8)`, [guild.id, guild.name, guild.description, guild.public, JSON.stringify(guild.channels), JSON.stringify(guild.roles), JSON.stringify(guild.members), JSON.stringify(guild.bans)], (err, dbRes) => {
                if (!err) {
                    websockets.get(res.locals.user)?.forEach(websocket => {
                        websocket.send(JSON.stringify({ event: 'guildCreated', guild: guild }));
                    });
                    res.status(200).send(guild);
                } else {
                    console.log(err);
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
        }
    });

    app.patch('/guilds/*/icons', (req, res) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const preGuild = dbRes.rows.find(x => x?.id == guildId);
                    if (preGuild) {
                    const guild = Object.keys(preGuild).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(preGuild).map(x => x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(preGuild[x]) : preGuild[x])[index] }), {});
                        if (guild.members.find(x => x?.id == res.locals.user).roles.find(x => (guild.roles.find(y => y.id == x).permissions & 0x0000000010) == 0x0000000010)) {
                            if(req.body.image?.startsWith('data:image/png')) {    
                               require('fs').writeFileSync(__dirname + '/../../icons/' + guildId + '.png', req.body.image.replace(/^data:image\/png;base64,/, ""), 'base64');   
                               guild.members.forEach(member => {
                                websockets.get(member.id)?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: 'guildIconEdited', id: guildId }));
                                });
                            });       
                                      res.status(200).send({});  
                        } else if(req.body.image == null) {
                            require('fs').unlinkSync(__dirname + '/../../icons/' + guildId + '.png');   
                            res.status(200).send({});
                        } else {
                            res.status(401).send({});
                        }
                    } else {
                        res.status(400).send({});
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

    app.patch('/guilds/*', (req, res) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const preGuild = dbRes.rows.find(x => x?.id == guildId);
                    if (preGuild) {
                    const guild = Object.keys(preGuild).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(preGuild).map(x => x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(preGuild[x]) : preGuild[x])[index] }), {});
                        if (guild.members.find(x => x?.id == res.locals.user).roles.find(x => (guild.roles.find(y => y.id == x).permissions & 0x0000000010) == 0x0000000010)) {
                            let changesWereMade = false;

                            if (req.body.name && req.body.name.length < 31) {
                                guild.name = req.body.name;
                                changesWereMade = true;
                            }

                            if (req.body.description && req.body.description.length < 1025) {
                                guild.description = req.body.description;
                                changesWereMade = true;
                            }

                            if (typeof req.body.public == 'boolean') {
                                guild.public = req.body.public;
                                changesWereMade = true;
                            }

                            if (req.body.owner && guild.members.find(x => x?.id == res.locals.user).roles.includes('0') && guild.members.find(x => x?.id == req.body.owner)) {
                                guild.members[guild.members.findIndex(x => x?.id == res.locals.user)].roles.splice(guild.members[guild.members.findIndex(x => x?.id == res.locals.user)].roles.indexOf('0'), 1);
                                guild.members[guild.members.findIndex(x => x?.id == req.body.owner)].roles.push('0');
                                changesWereMade = true;
                            }

                            database.query(`UPDATE guilds SET name = $1, members = $2 WHERE id = $3`, [guild.name, JSON.stringify(guild.members), guildId], (err, dbRes) => {
                                if (!err) {
                                    if (changesWereMade) {
                                        guild.members.forEach(member => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'guildEdited', guild: guild }));
                                            });
                                        });
                                        res.status(200).send(guild);
                                    } else {
                                        res.status(400).send({});
                                    }
                                } else {
                                    res.status(500).send({});
                                }
                            });
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

    app.delete('/guilds/*', (req, res) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const preGuild = dbRes.rows.find(x => x?.id == guildId);
                    const guild = Object.keys(preGuild).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(preGuild).map(x => x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(preGuild[x]) : preGuild[x])[index] }), {});
                    if (guild) {
                        if (guild.members.find(x => x?.id == res.locals.user).roles.includes('0')) {

                            database.query(`DELETE FROM guilds WHERE id = $1`, [guildId], async (err, dbRes) => {
                                if (!err) {
                                    guild.members.forEach(member => {
                                        websockets.get(member.id)?.forEach(websocket => {
                                            websocket.send(JSON.stringify({ event: 'guildDelete', guild: guild }));
                                        });
                                    });
                                    res.status(200).send(guild);
                                } else {
                                    res.status(500).send({});
                                }
                            });
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