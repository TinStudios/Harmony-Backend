import { Member, Channel, Role } from '../interfaces';
import express from "express";
import { Client } from "pg";
import crypto from 'crypto';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {

    app.get('/guilds/*/channels/', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        const channels = JSON.parse(guild.channels);
                        res.send(channels.filter((x: Channel) => x).map((channel: Channel) => {
                            delete channel.messages;
                            delete channel.pins;
                            return channel;
                        }));
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });
    
    app.get('/guilds/*/channels/*/webhooks', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if(guild) {
                    let channels = JSON.parse(guild.channels);
                    let channel = channels.find((x: Channel) => x?.id === channelId);
                    if (channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000008) === 0x0000000008)) {
                            res.send(channel.webhooks);
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(404).send({ error: "Not found." });
                    }
                } else {
                    res.status(403).send({ error: "Missing permission." });
                }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.post('/guilds/*/channels/*/webhooks', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId && req.body.username && req.body.username.length > 0 && req.body.username.length < 31) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if(guild) {
                    let channels = JSON.parse(guild.channels);
                    let channel = channels.find((x: Channel) => x?.id === channelId);
                    if (channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000008) === 0x0000000008)) {
                            let webhooks = [...channel.webhooks];
                            
                            const webhook = {
                                token: crypto.randomUUID(),
                                username: req.body.username
                            };

                            webhooks.push(webhook);

                            channel.webhooks = webhooks;

                            channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;

                            database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                        JSON.parse(guild.members).filter((x: Member) => x?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000008) === 0x0000000008)).forEach((member: Member) => {
                                            websockets.get(member?.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'webhookCreated', guild: guildId, channel: channelId, webhook: webhook }));
                                            });
                                        });
                                        res.status(201).send(webhook);
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
                            });
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(404).send({ error: "Not found." });
                    }
                } else {
                    res.status(403).send({ error: "Missing permission." });
                }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/guilds/*/channels/*/webhooks/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const token = urlParams[2];
        if (guildId && channelId && token && req.body.username && req.body.username.length > 0 && req.body.username.length < 31) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    let channels = JSON.parse(guild.channels);
                    let channel = channels.find((x: Channel) => x?.id === channelId);
                    if (channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000008) === 0x0000000008)) {
                            let webhooks = [...channel.webhooks];
                            if(webhooks.find(x => x.token === token)) {

                                const webhook = {
                                    token: token,
                                    username: req.body.username
                                };
                            
                            webhooks[webhooks.findIndex(x => x.token === token)] = webhook;

                            channel.webhooks = webhooks;

                            channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;

                            database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    JSON.parse(guild.members).filter((x: Member) => x?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000008) === 0x0000000008)).forEach((member: Member) => {
                                            websockets.get(member?.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'webhookEdited', guild: guildId, channel: channelId, webhook: webhook }));
                                            });
                                        });
                                        res.send(webhook);
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
                            });
                        } else {
                            res.status(404).send({ error: "Not found." });
                        }
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(404).send({ error: "Not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/guilds/*/channels/*/webhooks/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const token = urlParams[2];
        if (guildId && channelId && token) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    let channels = JSON.parse(guild.channels);
                    let channel = channels.find((x: Channel) => x?.id === channelId);
                    if (channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000008) === 0x0000000008)) {
                            let webhooks = [...channel.webhooks];
                            if(webhooks.find(x => x.token === token)) {

                            webhooks.splice(webhooks.findIndex(x => x.token === token), 1);

                            channel.webhooks = webhooks;

                            channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;

                            database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    JSON.parse(guild.members).filter((x: Member) => x?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000008) === 0x0000000008)).forEach((member: Member) => {
                                            websockets.get(member?.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'webhookEdited', guild: guildId, channel: channelId, webhook: token }));
                                            });
                                        });
                                        res.send({});
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
                            });
                        } else {
                            res.status(404).send({ error: "Not found." });
                        }
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(404).send({ error: "Not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.get('/guilds/*/channels/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        const channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            delete channel.messages;
                            delete channel.pins;
                            res.send(channel);
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.post('/guilds/*/channels', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId && req.body.name && req.body.name.length < 31) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000010) === 0x0000000010)) {
                        let channels = JSON.parse(guild.channels);
                        const channel: Channel = {
                            id: crypto.randomUUID(),
                            name: req.body.name,
                            topic: null,
                            creation: Date.now(),
                            roles: [{ id: "0", permissions: 456 }, { id: "1", permissions: 192 }],
                            webhooks: [],
                            messages: [],
                            pins: []
                        };
                        channels.push(channel);
                        database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                            if (!err) {
                                let parsedChannel = { ...channel };
                                delete parsedChannel.messages;
                                delete parsedChannel.pins;
                                websockets.get(res.locals.user)?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: 'channelCreated', guild: guildId, channel: parsedChannel }));
                                });
                                res.status(201).send(parsedChannel);
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/guilds/*/channels/*/roles/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const roleId = urlParams[2];
        if (guildId && channelId && roleId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if(guild) {
                    let channels = JSON.parse(guild.channels);
                    let channel = channels.find((x: Channel) => x?.id === channelId);
                    if (channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000008) === 0x0000000008)) {

                            if (JSON.parse(guild.roles).find((x: Role) => x.id === roleId) && req.body.permissions) {
                                let role = channel.roles.find((x: Role) => x?.id === roleId) ?? {};

                                let permissions = 0;
                                let permissionsCodes: number[] = [];
                                req.body.permissions?.forEach((permission: string) => {
                                    switch (permission) {
                                        case 'VIEW_CHANNEL':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000040) === 0x0000000040)) {
                                                permissionsCodes.push(0x0000000040);
                                            }
                                            break;

                                        case 'SEND_MESSAGES':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000080) === 0x0000000080)) {
                                                permissionsCodes.push(0x0000000080);
                                            }
                                            break;

                                        case 'MANAGE_MESSAGES':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000100) === 0x0000000100)) {
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

                                channel.roles[channel.roles.findIndex((x: Channel) => x?.id === roleId)] = role;

                                channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;

                                database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                    if (!err) {
                                        let parsedChannel = { ...channel };
                                        delete parsedChannel.messages;
                                        delete parsedChannel.pins;
                                        JSON.parse(guild.members).forEach((member: Member) => {
                                            websockets.get(member?.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'channelEdited', guild: guildId, channel: parsedChannel }));
                                            });
                                        });
                                        res.send(parsedChannel);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(400).send({ error: "Something is missing or it's not appropiate." });
                            }
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(404).send({ error: "Not found." });
                    }
                } else {
                    res.status(403).send({ error: "Missing permission." });
                }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/guilds/*/channels/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    let channels = JSON.parse(guild.channels);
                    let channel = channels.find((x: Channel) => x?.id === channelId);
                    if (channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x?.permissions & 0x0000000008) === 0x0000000008)) {
                            let changesWereMade = false;

                            if (req.body.name && req.body.name.length < 31) {
                                channel.name = req.body.name;
                                changesWereMade = true;
                            }

                            if (req.body.topic && req.body.topic.length < 1025) {
                                channel.topic = req.body.topic;
                                changesWereMade = true;
                            } else if (channel.topic !== null && req.body.topic === null) {
                                channel.topic = null;
                            }

                            channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;

                            database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    if (changesWereMade) {
                                        let parsedChannel = { ...channel };
                                        delete parsedChannel.messages;
                                        delete parsedChannel.pins;
                                        JSON.parse(guild.members).forEach((member: Member) => {
                                            websockets.get(member?.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'channelEdited', guild: guildId, channel: parsedChannel }));
                                            });
                                        });
                                        res.send(channel);
                                    } else {
                                        res.status(400).send({ error: "Something is missing or it's not appropiate." });
                                    }
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
                            });
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(404).send({ error: "Not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/guilds/*/channels/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        let channels = JSON.parse(guild.channels);
                        const channel = channels.find((x: Channel) => x?.id === channelId);
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y?.id === x)).some((x: Role) => (x.permissions & 0x0000000008) === 0x0000000008)) {
                            if (channel.name === req.headers.name) {
                                channels.splice(channels.findIndex((x: Channel) => x?.id === channelId), 1)
                                database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                    if (!err) {
                                        websockets.get(res.locals.user)?.forEach(websocket => {
                                            websocket.send(JSON.stringify({ event: 'channelDeleted', guild: guildId, channel: channelId }));
                                        });
                                        res.send(channel);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(401).send({ error: "Invalid channel name." });
                            }
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });
};