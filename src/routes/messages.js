module.exports = (websockets, app, database, flake) => {
    const { importSPKI } = require('jose/key/import');
    const { CompactEncrypt } = require('jose/jwe/compact/encrypt')

    app.get('/guilds/*/channels/*/messages', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const beforeId = req.query?.before;
        if (guildId && channelId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        const channel = JSON.parse(guild.channels).find(x => x?.id == channelId);
                        if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000040) == 0x0000000040).includes(true)) {
                            let messages = channel.messages;
                            const before = messages.findIndex(x => x?.id == beforeId);
                            if(beforeId) {
                               messages = messages.slice(before - (before > 99 ? 100 : before), before + 1)
                            } else {
                                messages = messages.slice(-101);
                            }
                            res.send(messages);
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
            res.status(400).send({});
        }
    });

    app.get('/guilds/*/channels/*/messages/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const messageId = urlParams[2];
        if (guildId && channelId && messageId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        const channel = JSON.parse(guild.channels).find(x => x?.id == channelId);
                        if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000040) == 0x0000000040).includes(true)) {
                            const messages = channel.messages;
                            const message = messages.find(x => x?.id == messageId);
                            if(message) {
                            res.send(message);
                            } else {
                               res.status(404).send({}); 
                            }
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
            res.status(400).send({});
        }
    });

    app.post('/guilds/*/channels/*/messages', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId && req.body.message && req.body.message.length < 4001) {
            database.query(`SELECT * FROM guilds`, async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find(x => x?.id == channelId);
                        if (JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                            let messages = channel.messages;

                            const encoder = new TextEncoder()

const jwe = await new CompactEncrypt(encoder.encode(req.body.message))
  .setProtectedHeader({ alg: 'ECDH-ES+A256KW', enc: 'A256GCM' })
  .encrypt(await importSPKI(require('fs').readFileSync(__dirname + '/../../public.key').toString(), 'ES256'));

                            const message = {
                                id: flake.gen().toString(),
                                author: res.locals.user,
                                content: jwe,
                                creation: Date.now()
                            };
                            messages.push(message);
                            channel.messages = messages;
                            channels[channels.findIndex(x => x?.id == channelId)] = channel;
                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                        JSON.parse(guild.members).forEach(member => {
                                            if(member.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                                            websockets.get(member)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'messageSent', guild: guildId, channel: channelId, message: message }));
                                            });
                                        }
                                        });
                                        res.status(200).send(message);
                                } else {
                                    res.status(500).send({});
                                }
                            });
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
            res.status(400).send({});
        }
    });

    app.patch('/guilds/*/channels/*/messages/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const messageId = urlParams[2];
        if (guildId && channelId && messageId && req.body.message && req.body.message.length < 4001) {
            database.query(`SELECT * FROM guilds`, async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find(x => x?.id == channelId);
                        let messages = channel.messages;
                        let message = messages.find(x => x?.id == messageId);
                        if (message.author == res.locals.user && JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                            

                            const encoder = new TextEncoder()

const jwe = await new CompactEncrypt(encoder.encode(req.body.message))
  .setProtectedHeader({ alg: 'ECDH-ES+A256KW', enc: 'A256GCM' })
  .encrypt(await importSPKI(require('fs').readFileSync(__dirname + '/../../public.key').toString(), 'ES256'));

                            message.content = jwe;
                            messages[messages.findIndex(x => x?.id == messageId)] = message;
                            channel.messages = messages;
                            channels[channels.findIndex(x => x?.id == channelId)] = channel;
                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                        JSON.parse(guild.members).forEach(member => {
                                            if(member.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                                            websockets.get(member)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'messageEdited', guild: guildId, channel: channelId, message: message }));
                                            });
                                        }
                                        });
                                        res.status(200).send(message);
                                } else {
                                    res.status(500).send({});
                                }
                            });
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
            res.status(400).send({});
        }
    });

    app.delete('/guilds/*/channels/*/messages/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const messageId = urlParams[2];
        if (guildId && channelId && messageId && req.body.message && req.body.message.length < 4001) {
            database.query(`SELECT * FROM guilds`, async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find(x => x?.id == channelId);
                        let messages = channel.messages;
                        let message = messages.find(x => x?.id == messageId);
                        if (message?.author == res.locals.user && JSON.parse(guild.members).find(x => x?.id == res.locals.user)?.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                            
                            delete messages[messages.findIndex(x => x?.id == messageId)];
                            channel.messages = messages;
                            channels[channels.findIndex(x => x?.id == channelId)] = channel;
                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                        JSON.parse(guild.members).forEach(member => {
                                            if(member.roles.map(x => channel.roles.find(y => y.id == x)).map(x => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                                            websockets.get(member)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'messageEdited', guild: guildId, channel: channelId, message: message }));
                                            });
                                        }
                                        });
                                        res.status(200).send(message);
                                } else {
                                    res.status(500).send({});
                                }
                            });
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
            res.status(400).send({});
        }
    });
};