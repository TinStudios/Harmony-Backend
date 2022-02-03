import { Message, Channel, Member, Role } from '../interfaces';
import express from "express";
import { Client } from "pg";
import crypto from 'crypto';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {

    app.get('/guilds/*/channels/*/pins', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
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
                        const channel = JSON.parse(guild.channels).find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000040) === 0x0000000040)) {
                                let messages = channel.messages.filter((x: Message) => channel.pins.includes(x?.id));
                                database.query('SELECT * FROM users', async (err, dbRes) => {
                                    if (!err) {
                                        messages = messages.filter((x: Message) => x).map((message: Message) => {
                                            if(message?.type !== 'WEBHOOK') {
                                            if (message?.author !== '0') {
                                                message.author = {
                                                    id: message?.author as string,
                                                    username: dbRes.rows.find(x => x?.id === message?.author)?.username ?? 'Deleted User',
                                                    nickname: JSON.parse(guild.members).find((x: Member) => x?.id === message?.author)?.nickname,
                                                    discriminator: dbRes.rows.find(x => x?.id === message?.author)?.discriminator ?? '0000',
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
                                            return message;
                                        });
                                        messages.reverse();
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

    app.post('/guilds/*/channels/*/pins/*', (req: express.Request, res: express.Response) => {
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
                        if (channel && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000100) === 0x0000000100)) {
                            let messages = channel.messages;
                            let message = messages.find((x: Message) => x?.id === messageId);
                            if (message) {
                                if (!channel.pins.includes(messageId)) {
                                    channel.pins = [...channel.pins, messageId];

                                    const systemMessage: Message = {
                                        id: crypto.randomUUID(),
                                        author: '0',
                                        content: 'Message pinned!',
                                        creation: Date.now(),
                                        edited: 0,
                                        type: 'NORMAL'
                                    };

                                    messages.push(systemMessage);
                                    channel.messages = messages;

                                    channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;
                                    database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                        if (!err) {
                                            database.query('SELECT * FROM users', async (err, dbRes) => {
                                                if (!err) {
                                                    systemMessage.author = {
                                                        id: systemMessage?.author as string,
                                                        username: 'Seltorn',
                                                        nickname: undefined,
                                                        discriminator: '0000',
                                                        type: 'SYSTEM'
                                                    };

                                                    if(message?.type !== 'WEBHOOK') {
                                                    if (message?.author !== '0') {
                                                        message.author = {
                                                            id: message?.author,
                                                            username: dbRes.rows.find(x => x?.id === message?.author)?.username ?? 'Deleted User',
                                                            nickname: JSON.parse(guild.members).find((x: Member) => x?.id === message?.author)?.nickname,
                                                            discriminator: dbRes.rows.find(x => x?.id === message?.author)?.discriminator ?? '0000'
                                                        };
                                                    } else {
                                                        message.author = {
                                                            id: message?.author,
                                                            username: 'Seltorn',
                                                            nickname: undefined,
                                                            discriminator: '0000'
                                                        };
                                                    }
                                                }

                                                    JSON.parse(guild.members).forEach((member: Member) => {
                                                        if (member.roles.map(x => channel.roles.find((y: Role) => y.id === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                            websockets.get(member.id)?.forEach(websocket => {
                                                                websocket.send(JSON.stringify({ event: 'messagePinned', guild: guildId, channel: channelId, message: message }));
                                                                websocket.send(JSON.stringify({ event: 'messageSent', guild: guildId, channel: channelId, message: systemMessage }));
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
                                    res.status(404).send({ error: "Message already pinned." });
                                }
                            } else {
                                res.status(404).send({ error: "Not found." });
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

    app.delete('/guilds/*/channels/*/pins/*', (req: express.Request, res: express.Response) => {
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
                        if (channel && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000100) === 0x0000000100)) {
                            let messages = channel.messages;
                            let message = messages.find((x: Message) => x?.id === messageId);
                            if (channel.pins.includes(messageId)) {
                                channel.pins.splice(channel.pins.indexOf(messageId), 1);
                                channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;
                                database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                    if (!err) {
                                        database.query('SELECT * FROM users', async (err, dbRes) => {
                                            if (!err) {
                                                JSON.parse(guild.members).forEach((member: Member) => {
                                                    if (member.roles.map(x => channel.roles.find((y: Role) => y.id === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                        websockets.get(member.id)?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'messageUnpinned', guild: guildId, channel: channelId, message: messageId }));
                                                        });
                                                    }
                                                });
                                                res.send({});
                                            } else {
                                                res.status(500).send({ error: "Something went wrong with our server." });
                                            }
                                        });
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