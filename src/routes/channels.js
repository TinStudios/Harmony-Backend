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
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        const channels = JSON.parse(guild.channels);
                        let channel = channels.find(x => x?.id == channelId);
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
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (JSON.parse(guild.members).find(x => x?.id == res.locals.user).roles.find(x => (JSON.parse(guild.roles).find(y => y.id == x).permissions & 0x0000000010) == 0x0000000010)) {
                        if (guild) {
                            let channels = JSON.parse(guild.channels);
                            const channel = {
                                id: flake.gen().toString(),
                                name: req.body.name,
                                topic: null,
                                creation: Date.now(),
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

    app.patch('/guilds/*/channels/*/roles/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const roleId = urlParams[2];
        if (guildId && channelId && roleId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    let channels = JSON.parse(guild.channels);
                    let channel = channels.find(x => x?.id == channelId);
                    if (channel) {
                        if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000008) == 0x0000000008).includes(true)) {
                            
                            if(JSON.parse(guild.roles).find(x => x.id == roleId) && req.body.permissions) {
                                const roles = JSON.parse(guild.roles);

                                let role = channel.roles.find(x => x?.id == roleId) ?? {};

                                let permissions = 0;
                                let permissionsCodes = [];
                                req.body.permissions?.forEach(permission => {
                                    switch (permission) {
                                        case 'VIEW_CHANNEL':
                                            if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000040) == 0x0000000040).includes(true)) {
                                                permissionsCodes.push(0x0000000040);
                                            }
                                            break;

                                        case 'SEND_MESSAGES':
                                            if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                                                permissionsCodes.push(0x0000000080);
                                            }
                                            break;

                                        case 'MANAGE_MESSAGES':
                                            if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000100) == 0x0000000100).includes(true)) {
                                                permissionsCodes.push(0x0000000100);
                                            }
                                            break;

                                        default:
                                            break;
                                    }
                                });
                                permissions = permissionsCodes.reduce((x, y) => {
                                    return x | y;
                                }, 0);
                                
                                console.log(permissionsCodes);

                                role.id = roleId;
                                role.permissions = permissions;
                                
                                channel.roles[channel.roles.findIndex(x => x.id == roleId)] = role;

                            channels[channels.findIndex(x => x?.id == channelId)] = channel;

                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                        JSON.parse(guild.members).forEach(member => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'channelEdited', channel: channel }));
                                            });
                                        });
                                        res.status(200).send(channel);
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
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    let channels = JSON.parse(guild.channels);
                    let channel = channels.find(x => x?.id == channelId);
                    if (channel) {
                        if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000008) == 0x0000000008).includes(true)) {
                            let changesWereMade = false;

                            if (req.body.name && req.body.name.length < 31) {
                                channel.name = req.body.name;
                                changesWereMade = true;
                            }

                            if (req.body.topic && req.body.topic.length < 1025) {
                                channel.topic = req.body.topic;
                                changesWereMade = true;
                            }

                            channels[channels.findIndex(x => x?.id == channelId)] = channel;

                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    if (changesWereMade) {
                                        JSON.parse(guild.members).forEach(member => {
                                            websockets.get(member.id)?.forEach(websocket => {
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
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        const channel = channels.find(x => x?.id == channelId);
                        if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000008) == 0x0000000008).includes(true)) {
                            channels.splice(channels.findIndex(x => x?.id == channelId), 1)
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