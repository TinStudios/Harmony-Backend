import { Message, Channel, Member, Role } from '../interfaces';
import express from "express";
import cassandra from 'cassandra-driver';
import crypto from 'crypto';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client) => {

    app.get('/guilds/*/channels/*/pins', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const channel = guild.channels.find((x: Channel) => x?.id?.toString() === channelId);
                        if (channel?.type === 'text') {
                            if (guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.map((x: string) => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).some((x: Role) => (x.permissions & 0x0000000040) === 0x0000000040)) {
                                let messages = (channel.messages ?? []).filter((x: Message) => (channel.pins ?? []).includes(x?.id?.toString()));
                                database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                    
                                        messages = messages.filter((x: Message) => x).map((message: Message) => {
                                            if (message?.type !== 'WEBHOOK') {
                                                if (message?.author?.toString() !== '0') {
                                                    message.author = {
                                                        id: message?.author?.toString() as string,
                                                        username: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.username ?? 'Deleted User',
                                                        nickname: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString())?.nickname,
                                                        roles: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString())?.roles,
                                                        discriminator: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.discriminator ?? '0000',
                                                        avatar: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.avatar ?? 'userDefault',
                                                        about: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.about,
                                                        type: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.type ?? 'UNKNOWN'
                                                    };
                                                } else {
                                                    message.author = {
                                                        id: '0000000-0000-0000-0000-000000000000',
                                                        username: 'Harmony',
                                                        roles: [],
                                                        discriminator: '0000',
                                                        avatar: 'systemDefault',
                                                        about: '',
                                                        type: 'SYSTEM'
                                                    };
                                                }
                                            }
                                            return message;
                                        });
                                        messages.reverse();
                                        res.send(messages);
                                    
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
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        let channels = guild.channels;
                        let channel = channels.find((x: Channel) => x?.id?.toString() === channelId);
                        if (channel?.type === 'text' && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.map((x: string) => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).some((x: Role) => (x.permissions & 0x0000000100) === 0x0000000100)) {
                            let messages = channel.messages ?? [];
                            let message = messages.find((x: Message) => x?.id?.toString() === messageId);
                            if (message) {
                                let pins = channel.pins ?? [];
                                if (!pins.includes(messageId)) {
                                    pins = [...pins, messageId];
                                    channel.pins = pins;

                                    const systemMessage: Message = {
                                        id: crypto.randomUUID(),
                                        author: '0000000-0000-0000-0000-000000000000',
                                        content: 'Message pinned!',
                                        creation: Date.now(),
                                        edited: 0,
                                        type: 'NORMAL'
                                    };

                                    messages.push(systemMessage);
                                    channel.messages = messages;

                                    channels[channels.findIndex((x: Channel) => x?.id?.toString() === channelId)] = channel;
                                    database.execute('UPDATE guilds SET channels = ? WHERE id = ?', [channels, guildId], { prepare: true }).then(() => {
                                        
                                            database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                                
                                                    systemMessage.author = {
                                                        id: systemMessage?.author?.toString() as string,
                                                        username: 'Harmony',
                                                        roles: [],
                                                        discriminator: '0000',
                                                        avatar: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.avatar ?? 'userDefault',
                                                        about: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.about,
                                                        type: 'SYSTEM'
                                                    };

                                                    if (message?.type !== 'WEBHOOK') {
                                                        if (message?.author?.toString() !== '0') {
                                                            message.author = {
                                                                id: message?.author?.toString(),
                                                                username: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.username ?? 'Deleted User',
                                                                nickname: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString())?.nickname,
                                                                roles: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString())?.roles,
                                                                discriminator: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.discriminator ?? '0000',
                                                                avatar: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.avatar ?? 'userDefault',
                                                                about: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.about,
                                                                type: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.type ?? 'UNKNOWN'
                                                            };
                                                        } else {
                                                            message.author = {
                                                                id: message?.author?.toString(),
                                                                username: 'Harmony',
                                                                roles: [],
                                                                discriminator: '0000',
                                                                avatar: 'systemDefault',
                                                                about: '',
                                                                type: 'SYSTEM'
                                                            };
                                                        }
                                                    }

                                                    guild.members.forEach((member: Member) => {
                                                        if (member.roles.map(x => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                            websockets.get(member.id.toString())?.forEach(websocket => {
                                                                websocket.send(JSON.stringify({ event: 'messagePinned', guild: guildId, channel: channelId, message: message }));
                                                                websocket.send(JSON.stringify({ event: 'messageSent', guild: guildId, channel: channelId, message: systemMessage }));
                                                            });
                                                        }
                                                    });
                                                    res.send(message);
                                                
                                            });
                                        
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
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        let channels = guild.channels;
                        let channel = channels.find((x: Channel) => x?.id?.toString() === channelId);
                        if (channel?.type === 'text' && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.map((x: string) => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).some((x: Role) => (x.permissions & 0x0000000100) === 0x0000000100)) {
                            let pins = channel.pins ?? [];
                            if (pins.includes(messageId)) {
                                pins.splice(pins.indexOf(messageId), 1);
                                channel.pins = pins;
                                channels[channels.findIndex((x: Channel) => x?.id?.toString() === channelId)] = channel;
                                database.execute('UPDATE guilds SET channels = ? WHERE id = ?', [channels, guildId], { prepare: true }).then(() => {
                                    
                                        database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                            
                                                guild.members.forEach((member: Member) => {
                                                    if (member.roles.map(x => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                        websockets.get(member.id.toString())?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'messageUnpinned', guild: guildId, channel: channelId, message: messageId }));
                                                        });
                                                    }
                                                });
                                                res.send({});
                                            
                                        });
                                    
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
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });
};