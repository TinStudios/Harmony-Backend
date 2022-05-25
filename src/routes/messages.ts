import { Message, Channel, Member, Role } from '../interfaces';
import express from "express";
import cassandra from 'cassandra-driver';
import crypto from 'crypto';
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage(), limits: {
    fileSize: 1000000000
} })

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client, uploadFile: any) => {

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
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const channel = guild.channels.find((x: Channel) => x?.id?.toString() === channelId);
                        if (channel?.type === 'text') {
                            if (guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.map((x: string) => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).some((x: Role) => (x.permissions & 0x0000000040) === 0x0000000040)) {
                                let messages = channel.messages ?? [];
                                const before = messages.findIndex((x: Message) => x?.id?.toString() === beforeId) - 1;
                                if (beforeId) {
                                    messages = messages.slice(before - (before > 99 ? 100 : before), before + 1);
                                } else {
                                    messages = messages.slice(-101);
                                }
                                database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                    
                                        messages = messages.filter((x: Message) => x).map((message: Message) => {
                                            if (message?.type !== 'WEBHOOK') {
                                                if (message?.author?.toString() !== '0000000-0000-0000-0000-000000000000') {
                                                    message.author = {
                                                        id: message?.author?.toString() as string,
                                                        username: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.username ?? 'Deleted User',
                                                        nickname: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString())?.nickname,
                                                        roles:  guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString())?.roles,
                                                        discriminator: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.discriminator ?? '0000',
                                                        avatar: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.avatar ?? 'userDefault',
                                                        about: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.about,
                                                        type: dbRes.rows.find(x => x?.id?.toString() === message?.author?.toString())?.type ?? 'UNKNOWN'
                                                    }
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
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const channel = guild.channels.find((x: Channel) => x?.id?.toString() === channelId);
                        if (channel?.type === 'text') {
                            if (guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.map((x: string) => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).some((x: Role) => (x.permissions & 0x0000000040) === 0x0000000040)) {
                                const messages = channel.messages;
                                const message = messages.find((x: Message) => x?.id?.toString() === messageId);
                                if (message) {
                                    database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                        
                                            if (message?.type !== 'WEBHOOK') {
                                                if (message?.author?.toString() !== '0000000-0000-0000-0000-000000000000') {
                                                    message.author = {
                                                        id: message?.author?.toString(),
                                                        username: dbRes.rows.find(x => x.id.toString() === message?.author?.toString())?.username ?? 'Deleted User',
                                                        nickname: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString()).nickname,
                                                        roles: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString()).roles,
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

                                            res.send(message);
                                        
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
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(async dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        let channels = guild.channels;
                        let channel = channels.find((x: Channel) => x?.id?.toString() === channelId);
                        if (channel?.type === 'text') {
                            if (guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.map((x: string) => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).some((x: Role) => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                let messages = channel.messages ?? [];

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
                                    const attachment = await uploadFile(req.file);
                                    message.attachmentId = attachment;
                                }

                                messages.push(message);
                                channel.messages = messages;
                                channels[channels.findIndex((x: Channel) => x?.id?.toString() === channelId)] = channel;
                                database.execute('UPDATE guilds SET channels = ? WHERE id = ?', [channels, guildId], { prepare: true }).then(() => {
                                    
                                        database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                            
                                                if (message?.type !== 'WEBHOOK') {
                                                    if (message?.author?.toString() !== '0000000-0000-0000-0000-000000000000') {
                                                        message.author = {
                                                            id: message?.author?.toString() as string,
                                                            username: dbRes.rows.find(x => x.id.toString() === message?.author?.toString())?.username ?? 'Deleted User',
                                                            nickname: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString()).nickname,
                                                            roles: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString()).roles,
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
                                                    if (member && member.roles.map(x => (channel.roles ?? []).find((y: Channel) => y.id.toString() === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                        websockets.get(member.id.toString())?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'messageSent', guild: guildId, channel: channelId, message: message }));
                                                        });
                                                    }
                                                });
                                                res.status(201).send(message);
                                            
                                        });
                                    
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
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        let channels = guild.channels;
                        let channel = channels.find((x: Channel) => x?.id?.toString() === channelId);
                        if (channel?.type === 'text') {
                            let messages = channel.messages ?? [];
                            let message = messages.find((x: Message) => x?.id?.toString() === messageId);
                            if (message.author.toString() === res.locals.user && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.map((x: string) => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).some((x: Role) => (x.permissions & 0x0000000080) === 0x0000000080)) {

                                message.content = req.body.content;
                                message.edited = Date.now();
                                messages[messages.findIndex((x: Message) => x?.id?.toString() === messageId)] = message;
                                channel.messages = messages;
                                channels[channels.findIndex((x: Channel) => x?.id?.toString() === channelId)] = channel;
                                database.execute('UPDATE guilds SET channels = ? WHERE id = ?', [channels, guildId], { prepare: true }).then(() => {
                                    
                                        database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                            
                                                if (message?.type !== 'WEBHOOK') {
                                                    if (message?.author?.toString() !== '0000000-0000-0000-0000-000000000000') {
                                                        message.author = {
                                                            id: message?.author?.toString(),
                                                            username: dbRes.rows.find(x => x.id.toString() === message?.author?.toString())?.username ?? 'Deleted User',
                                                            nickname: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString()).nickname,
                                                            roles: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString()).roles,
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
                                                    if (member && member.roles.map(x => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                        websockets.get(member.id.toString())?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'messageEdited', guild: guildId, channel: channelId, message: message }));
                                                        });
                                                    }
                                                });
                                                res.send(message);
                                            
                                        });
                                    
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
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        let channels = guild.channels;
                        let channel = channels.find((x: Channel) => x?.id?.toString() === channelId);
                        if (channel?.type === 'text') {
                            let messages = channel.messages ?? [];
                            let message = messages.find((x: Message) => x?.id?.toString() === messageId);
                            if (message?.author?.toString() === res.locals.user || guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.map((x: string) => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).some((x: Role) => (x.permissions & 0x0000000080) === 0x0000000080)) {

                                messages.splice(messages.findIndex((x: Message) => x?.id?.toString() === messageId), 1);
                                channel.messages = messages;
                                let pins = channel.pins ?? [];
                                if (pins.includes(messageId)) {
                                    pins.splice(pins.indexOf(messageId), 1);
                                }
                                channel.pins = pins;
                                channels[channels.findIndex((x: Channel) => x?.id?.toString() === channelId)] = channel;
                                database.execute('UPDATE guilds SET channels = ? WHERE id = ?', [channels, guildId], { prepare: true }).then(() => {
                                    
                                        database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                            
                                                if (message?.type !== 'WEBHOOK') {
                                                    if (message?.author?.toString() !== '0000000-0000-0000-0000-0000000000000') {
                                                        message.author = {
                                                            id: message?.author?.toString(),
                                                            username: dbRes.rows.find(x => x.id.toString() === message?.author?.toString())?.username ?? 'Deleted User',
                                                            nickname: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString()).nickname,
                                                            roles: guild.members.find((x: Member) => x?.id?.toString() === message?.author?.toString()).roles,
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
                                                guild.members.forEach((member: Member) => {
                                                    if (member && member.roles.map(x => (channel.roles ?? []).find((y: Role) => y.id.toString() === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                        websockets.get(member.id.toString())?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'messageDeleted', guild: guildId, channel: channelId, message: messageId }));
                                                            websocket.send(JSON.stringify({ event: 'messageUnpinned', guild: guildId, channel: channelId, message: messageId }));
                                                        });
                                                    }
                                                });
                                                res.send(message);
                                            
                                        });
                                    
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
};