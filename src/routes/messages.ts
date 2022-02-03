import { Message, Channel, Member, Role } from '../interfaces';
import express from "express";
import { Client } from "pg";
import crypto from 'crypto';
import multer from "multer";
import { NFTStorage, File } from 'nft.storage';
import { lookup } from 'mime-types';
const upload = multer({ storage: multer.memoryStorage() })

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, storage: NFTStorage) => {

    app.get('/guilds/*/channels/*/messages', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const beforeId = req.query?.before;
        if (guildId && channelId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        const channel = JSON.parse(guild.channels).find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000040) === 0x0000000040)) {
                                let messages = channel.messages;
                                const before = messages.findIndex((x: Message) => x?.id === beforeId) - 1;
                                if (beforeId) {
                                    messages = messages.slice(before - (before > 99 ? 100 : before), before + 1);
                                } else {
                                    messages = messages.slice(-101);
                                }
                                database.query('SELECT * FROM users', async (err, dbRes) => {
                                    if (!err) {
                                        messages = messages.filter((x: Message) => x).map((message: Message) => {
                                            if (message?.type !== 'WEBHOOK') {
                                                if (message?.author !== '0') {
                                                    message.author = {
                                                        id: message?.author as string,
                                                        username: dbRes.rows.find(x => x?.id === message?.author)?.username ?? 'Deleted User',
                                                        nickname: JSON.parse(guild.members).find((x: Member) => x?.id === message?.author)?.nickname,
                                                        discriminator: dbRes.rows.find(x => x?.id === message?.author)?.discriminator ?? '0000',
                                                        type: dbRes.rows.find(x => x?.id === message?.author)?.type ?? 'UNKNOWN'
                                                    }
                                                } else {
                                                    message.author = {
                                                        id: '0',
                                                        username: 'Seltorn',
                                                        nickname: undefined,
                                                        discriminator: '0000',
                                                        type: 'SYSTEM'
                                                    };
                                                }
                                            }
                                            return message;
                                        });
                                        res.send(messages);
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

    app.get('/guilds/*/channels/*/messages/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const messageId = urlParams[2];
        if (guildId && channelId && messageId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        const channel = JSON.parse(guild.channels).find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000040) === 0x0000000040)) {
                                const messages = channel.messages;
                                const message = messages.find((x: Message) => x?.id === messageId);
                                if (message) {
                                    database.query('SELECT * FROM users', async (err, dbRes) => {
                                        if (!err) {
                                            if (message?.type !== 'WEBHOOK') {
                                                if (message?.author !== '0') {
                                                    message.author = {
                                                        id: message?.author,
                                                        username: dbRes.rows.find(x => x.id === message?.author).username ?? 'Deleted User',
                                                        nickname: JSON.parse(guild.members).find((x: Member) => x?.id === message?.author).nickname,
                                                        discriminator: dbRes.rows.find(x => x?.id === message?.author).discriminator ?? '0000',
                                                        type: dbRes.rows.find(x => x?.id === message?.author)?.type ?? 'UNKNOWN'
                                                    };
                                                } else {
                                                    message.author = {
                                                        id: '0',
                                                        username: 'Seltorn',
                                                        nickname: undefined,
                                                        discriminator: '0000',
                                                        type: 'SYSTEM'
                                                    };
                                                }
                                            }

                                            res.send(message);
                                        } else {
                                            res.status(500).send({ error: "Something went wrong with our server." });
                                        }
                                    });
                                } else {
                                    res.status(404).send({ error: "Not found." });
                                }
                            } else {
                                res.status(400).send({ error: "Missing permission." });
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

    app.post('/guilds/*/channels/*/messages', upload.single('attachment'), (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId && req.body.content && req.body.content.length < 4001) {
            database.query('SELECT * FROM guilds', async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                let messages = channel.messages;

                                const message: Message = {
                                    id: crypto.randomUUID(),
                                    author: res.locals.user,
                                    content: req.body.content,
                                    creation: Date.now(),
                                    edited: 0,
                                    type: 'NORMAL'
                                };

                                if (req.file) {
                                    message.attachment = req.body.attachmentName;
                                    const extension = lookup(req.body.attachmentName);
                                    const attachment = await storage.store({
                                        name: req.body.attachmentName,
                                        description: 'Seltorn\'s ' + message.id + ' attachment',
                                        image: new File([req.file.buffer], req.body.attachmentName, { type: extension ? extension : '' })
                                    });
                                    database.query('INSERT INTO files (id, type, url) VALUES ($1, $2, $3)', [message.id, 'messages', attachment.url], (err, dbRes) => {
                                        if (err) {
                                            res.status(500).send({ error: "Something went wrong with our server." });
                                            return;
                                        }
                                    });
                                }

                                messages.push(message);
                                channel.messages = messages;
                                channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;
                                database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                    if (!err) {
                                        database.query('SELECT * FROM users', async (err, dbRes) => {
                                            if (!err) {
                                                if (message?.type !== 'WEBHOOK') {
                                                    if (message?.author !== '0') {
                                                        message.author = {
                                                            id: message?.author as string,
                                                            username: dbRes.rows.find(x => x.id === message?.author).username ?? 'Deleted User',
                                                            nickname: JSON.parse(guild.members).find((x: Member) => x?.id === message.author).nickname,
                                                            discriminator: dbRes.rows.find(x => x.id === message?.author).discriminator ?? '0000',
                                                            type: dbRes.rows.find(x => x?.id === message?.author)?.type ?? 'UNKNOWN'
                                                        };
                                                    } else {
                                                        message.author = {
                                                            id: message?.author,
                                                            username: 'Seltorn',
                                                            nickname: undefined,
                                                            discriminator: '0000',
                                                            type: 'SYSTEM'
                                                        };
                                                    }
                                                }
                                                JSON.parse(guild.members).forEach((member: Member) => {
                                                    if (member && member.roles.map(x => channel.roles.find((y: Channel) => y.id === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                        websockets.get(member.id)?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'messageSent', guild: guildId, channel: channelId, message: message }));
                                                        });
                                                    }
                                                });
                                                res.status(201).send(message);
                                            } else {
                                                res.status(500).send({ error: "Something went wrong with our server." });
                                            }
                                        });
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

    app.patch('/guilds/*/channels/*/messages/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const messageId = urlParams[2];
        if (guildId && channelId && messageId && req.body.content && req.body.content.length < 4001) {
            database.query('SELECT * FROM guilds', async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            let messages = channel.messages;
                            let message = messages.find((x: Message) => x?.id === messageId);
                            if (message.author === res.locals.user && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000080) === 0x0000000080)) {

                                message.content = req.body.content;
                                message.edited = Date.now();
                                messages[messages.findIndex((x: Message) => x?.id === messageId)] = message;
                                channel.messages = messages;
                                channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;
                                database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                    if (!err) {
                                        database.query('SELECT * FROM users', async (err, dbRes) => {
                                            if (!err) {
                                                if (message?.type !== 'WEBHOOK') {
                                                    if (message?.author !== '0') {
                                                        message.author = {
                                                            id: message?.author,
                                                            username: dbRes.rows.find(x => x.id === message?.author).username ?? 'Deleted User',
                                                            nickname: JSON.parse(guild.members).find((x: Member) => x?.id === message.author).nickname,
                                                            discriminator: dbRes.rows.find(x => x.id === message?.author).discriminator ?? '0000',
                                                            type: dbRes.rows.find(x => x?.id === message?.author)?.type ?? 'UNKNOWN'
                                                        };
                                                    } else {
                                                        message.author = {
                                                            id: message?.author,
                                                            username: 'Seltorn',
                                                            nickname: undefined,
                                                            discriminator: '0000',
                                                            type: 'SYSTEM'
                                                        };
                                                    }
                                                }
                                                JSON.parse(guild.members).forEach((member: Member) => {
                                                    if (member && member.roles.map(x => channel.roles.find((y: Role) => y.id === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                        websockets.get(member.id)?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'messageEdited', guild: guildId, channel: channelId, message: message }));
                                                        });
                                                    }
                                                });
                                                res.send(message);
                                            } else {
                                                res.status(500).send({ error: "Something went wrong with our server." });
                                            }
                                        });
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

    app.delete('/guilds/*/channels/*/messages/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const messageId = urlParams[2];
        if (guildId && channelId && messageId) {
            database.query('SELECT * FROM guilds', async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            let messages = channel.messages;
                            let message = messages.find((x: Message) => x?.id === messageId);
                            if (message?.author === res.locals.user || JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000080) === 0x0000000080)) {

                                delete messages[messages.findIndex((x: Message) => x?.id === messageId)];
                                channel.messages = messages;
                                if (channel.pins.includes(messageId)) {
                                    channel.pins.splice(channel.pins.indexOf(messageId), 1);
                                }
                                channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;
                                database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                    if (!err) {
                                        database.query('SELECT * FROM users', async (err, dbRes) => {
                                            if (!err) {
                                                if (message?.type !== 'WEBHOOK') {
                                                    if (message?.author !== '0') {
                                                        message.author = {
                                                            id: message?.author,
                                                            username: dbRes.rows.find(x => x.id === message?.author).username ?? 'Deleted User',
                                                            nickname: JSON.parse(guild.members).find((x: Member) => x?.id === message.author).nickname,
                                                            discriminator: dbRes.rows.find(x => x.id === message?.author).discriminator ?? '0000',
                                                            type: dbRes.rows.find(x => x?.id === message?.author)?.type ?? 'UNKNOWN'
                                                        };
                                                    } else {
                                                        message.author = {
                                                            id: '0',
                                                            username: 'Seltorn',
                                                            nickname: undefined,
                                                            discriminator: '0000',
                                                            type: 'SYSTEM'
                                                        };
                                                    }
                                                }
                                                JSON.parse(guild.members).forEach((member: Member) => {
                                                    if (member && member.roles.map(x => channel.roles.find((y: Role) => y.id === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                        websockets.get(member.id)?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'messageDeleted', guild: guildId, channel: channelId, message: messageId }));
                                                            websocket.send(JSON.stringify({ event: 'messageUnpinned', guild: guildId, channel: channelId, message: messageId }));
                                                        });
                                                    }
                                                });
                                                res.send(message);
                                            } else {
                                                res.status(500).send({ error: "Something went wrong with our server." });
                                            }
                                        });
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
};