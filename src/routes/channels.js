module.exports = (websockets, app, database, flake) => {

    app.get('/guilds/*/channels/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x.id == guildId);
                    if (guild) {
                        const channels = JSON.parse(guild.channels);
                        let channel = channels.find(x => x.id == channelId);
                        if (channel) {
                            delete channel.messages;
                            delete channel.pins;
                            res.send(channel);
                        } else {
                            res.status(404).send({});
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

    app.post('/guilds/*/channels', (req, res) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId && req.body.name && req.body.name.length < 31) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x.id == guildId);
                    if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (JSON.parse(guild.roles).find(y => y.id == x).permissions & 0x0000000010) == 0x0000000010)) {
                        if (guild) {
                            let channels = JSON.parse(guild.channels);
                            const channel = {
                                id: flake.gen().toString(),
                                name: req.body.name,
                                topic: null,
                                roles: [{ id: 0, permissions: 456 }, { id: 1, permissions: 192 }],
                                messages: [],
                                pins: []
                            };
                            channels.push(channel);
                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    websockets.get(res.locals.user)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'channelCreated', channel: channel }));
                                    });
                                    res.status(200).send(channel);
                                } else {
                                    res.status(500).send({});
                                }
                            });
                        } else {
                            res.status(404).send({});
                        }
                    } else {
                        res.status(401).send({})
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
        }
    });

    app.patch('/guilds/*/channels/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const preGuild = dbRes.rows.find(x => x.id == guildId);
                    const guild = Object.keys(preGuild).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(preGuild).map(x => x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(preGuild[x]) : preGuild[x])[index] }), {});
                    let channels = guild.channels;
                    let channel = channels.find(x => x.id == channelId);
                    if (channel) {
                        if (guild.members.find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000008) == 0x0000000008).includes(true)) {
                            let changesWereMade = false;

                            if (req.body.name && req.body.name.length < 31) {
                                channel.name = req.body.name;
                                changesWereMade = true;
                            }

                            if (req.body.topic && req.body.topic.length < 1025) {
                                channel.topic = req.body.topic;
                                changesWereMade = true;
                            }

                            channels[channels.findIndex(x => x.id == channelId)] = channel;

                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    if (changesWereMade) {
                                        guild.members.forEach(member => {
                                            websockets.get(member)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'channelEdited', channel: channel }));
                                            });
                                        });
                                        res.status(200).send(channel);
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

    app.delete('/guilds/*/channels/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const preGuild = dbRes.rows.find(x => x.id == guildId);
                    const guild = Object.keys(preGuild).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(preGuild).map(x => x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(preGuild[x]) : preGuild[x])[index] }), {});
                    if (guild) {
                        let channels = guild.channels;
                        const channel = channels.find(x => x.id == channelId);
                        if (guild.members.find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000008) == 0x0000000008).includes(true)) {
                            channels.splice(channels.findIndex(x => x.id == channelId), 1)
                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    websockets.get(res.locals.user)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'channelDeleted', channel: channel }));
                                    });
                                    res.status(200).send(channel);
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