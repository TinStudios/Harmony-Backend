import { Message, Channel, Member, Role } from '../interfaces';
import express from "express";
import { Client } from "pg";
<<<<<<< HEAD
import crypto from 'crypto';
import multer from "multer";
import { NFTStorage, File } from 'nft.storage';
import { lookup } from 'mime-types';
const upload = multer({ storage: multer.memoryStorage() })

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, storage :NFTStorage) => {
=======
import FlakeId from 'flake-idgen';
const intformat = require('biguint-format');

<<<<<<< HEAD
module.exports = (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, flake: FlakeId) => {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, flake: FlakeId) => {
>>>>>>> 2aecc42 (Changed to import)

    app.get('/guilds/*/channels/*/messages', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
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
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const channel = JSON.parse(guild.channels).find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000040) === 0x0000000040)) {
                                let messages = channel.messages;
                                const before = messages.findIndex((x: Message) => x?.id === beforeId);
                                if (beforeId) {
                                    messages = messages.slice(before - (before > 99 ? 100 : before), before + 1)
                                } else {
                                    messages = messages.slice(-101);
                                }
                                database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                    if (!err) {
                                        messages = messages.map((message: Message) => {
                                            if (message) {
                                                if (message?.author !== '0') {
                                                    message.author = {
                                                        id: message?.author as string,
                                                        username: dbRes.rows.find(x => x?.id === message?.author)?.username,
                                                        nickname: JSON.parse(guild.members).find((x: Member) => x?.id === message?.author)?.nickname,
                                                        discriminator: dbRes.rows.find(x => x?.id === message?.author)?.discriminator
                                                    }
                                                } else {
                                                    message.author = {
                                                        id: '0',
                                                        username: 'System',
                                                        nickname: undefined,
                                                        discriminator: '0000'
                                                    };
                                                }
                                                return message;
                                            }
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
                            res.status(404).send({ error: "Channel not found." });
                        }
                    } else {
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        const channel = JSON.parse(guild.channels).find((x: Channel) => x?.id == channelId);
                        if(channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000040) == 0x0000000040).includes(true)) {
                            let messages = channel.messages;
                            const before = messages.findIndex((x: Message) => x?.id == beforeId);
                            if(beforeId) {
                               messages = messages.slice(before - (before > 99 ? 100 : before), before + 1)
                            } else {
                                messages = messages.slice(-101);
                            }
                            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                if (!err) {
                            messages = messages.map((message: Message) => {
                                if(message) {
                                    if(message?.author !== '0') {
                                message.author = {
                                    id: message?.author as string,
                                    username: dbRes.rows.find(x => x?.id == message?.author)?.username,
                                    nickname: JSON.parse(guild.members).find((x: Member) => x?.id == message?.author)?.nickname,
                                    discriminator: dbRes.rows.find(x => x?.id == message?.author)?.discriminator
                                }
                            } else {
                                message.author = {
                                    id: '0',
                                    username: 'System',
                                    nickname: undefined,
                                    discriminator: '0000'
                                };
                            }
                                return message;
                            }
                            });
                            res.send(messages);
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
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
        }
    });

    app.get('/guilds/*/channels/*/messages/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
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
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const channel = JSON.parse(guild.channels).find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000040) === 0x0000000040)) {
                                const messages = channel.messages;
                                const message = messages.find((x: Message) => x?.id === messageId);
                                if (message) {
                                    database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                        if (!err) {
                                            if (message?.author !== '0') {
                                                message.author = {
                                                    id: message?.author,
                                                    username: dbRes.rows.find(x => x.id === message?.author).username,
                                                    nickname: JSON.parse(guild.members).find((x: Member) => x?.id === message?.author).nickname,
                                                    discriminator: dbRes.rows.find(x => x?.id === message?.author).discriminator
                                                };
                                            } else {
                                                message.author = {
                                                    id: '0',
                                                    username: 'System',
                                                    nickname: undefined,
                                                    discriminator: '0000'
                                                };
                                            }

                                            res.send(message);
                                        } else {
                                            res.status(500).send({ error: "Something went wrong with our server." });
                                        }
                                    });
                                } else {
                                    res.status(404).send({ error: "Message not found." });
                                }
                            } else {
                                res.status(400).send({ error: "Missing permission." });
                            }
                        } else {
                            res.status(404).send({ error: "Channel not found." });
                        }
                    } else {
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });

    app.post('/guilds/*/channels/*/messages', upload.single('attachment'), (req: express.Request, res: express.Response) => {
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        const channel = JSON.parse(guild.channels).find((x: Channel) => x?.id == channelId);
                        if(channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000040) == 0x0000000040).includes(true)) {
                            const messages = channel.messages;
                            const message = messages.find((x: Message) => x?.id == messageId);
                            if(message) {
                                database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                    if (!err) {
                                        if(message?.author !== '0') {
                                message.author = {
                                    id: message?.author,
                                    username: dbRes.rows.find(x => x.id == message?.author).username,
                                    nickname: JSON.parse(guild.members).find((x: Member) => x?.id == message?.author).nickname,
                                    discriminator: dbRes.rows.find(x => x?.id == message?.author).discriminator
                                };
                            } else {
                                message.author = {
                                    id: '0',
                                    username: 'System',
                                    nickname: undefined,
                                    discriminator: '0000'
                                };
                            }
                            
                            res.send(message);
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

    app.post('/guilds/*/channels/*/messages', (req: express.Request, res: express.Response) => {
>>>>>>> 0718f96 (Changed to TypeScript)
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId && req.body.message && req.body.message.length < 4001) {
            database.query(`SELECT * FROM guilds`, async (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                let messages = channel.messages;

                                const message: any = {
                                    id: crypto.randomUUID(),
                                    author: res.locals.user,
                                    content: req.body.message,
                                    creation: Date.now()
                                };

                                if (req.file) {
                                    message.attachment = req.body.attachmentName;
                                    const extension = lookup(req.body.attachmentName);
                                    const attachment = await storage.store({
                                        name: req.body.attachmentName,
                                        description: 'Seltorn\'s ' + message.id + ' attachment',
                                        image: new File([req.file.buffer], req.body.attachmentName, { type: extension ? extension : '' })
                                      });
                                      database.query(`INSERT INTO files (id, type, url) VALUES ($1, $2, $3)`, [message.id, 'messages', attachment.url], (err, dbRes) => {
                                        if (err) {
                                            res.status(500).send({ error: "Something went wrong with our server." });
                                            return;
                                        }
                                    });
                                }

                                messages.push(message);
                                channel.messages = messages;
                                channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;
                                database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                    if (!err) {
                                        database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                            if (!err) {
                                                if (message?.author !== '0') {
                                                    message.author = {
                                                        id: message?.author,
                                                        username: dbRes.rows.find(x => x.id === message?.author).username,
                                                        nickname: JSON.parse(guild.members).find((x: Member) => x.id === message.author).nickname,
                                                        discriminator: dbRes.rows.find(x => x.id === message?.author).discriminator
                                                    };
                                                } else {
                                                    message.author = {
                                                        id: message?.author,
                                                        username: 'System',
                                                        nickname: undefined,
                                                        discriminator: '0000'
                                                    };
                                                }
                                                JSON.parse(guild.members).forEach((member: Member) => {
                                                    if (member.roles.map(x => channel.roles.find((y: Channel) => y.id === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
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
                            res.status(404).send({ error: "Channel not found." });
                        }
                    } else {
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id == channelId);
                        if(channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                            let messages = channel.messages;

                            const message = {
                                id: intformat(flake.next(), 'dec').toString(),
                                author: res.locals.user,
                                content: req.body.message,
                                creation: Date.now()
                            };
                            messages.push(message);
                            channel.messages = messages;
                            channels[channels.findIndex((x: Channel) => x?.id == channelId)] = channel;
                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                        if (!err) {
                                            if(message?.author !== '0') {
                                        message.author = {
                                        id: message?.author,
                                        username: dbRes.rows.find(x => x.id == message?.author).username,
                                        nickname: JSON.parse(guild.members).find((x: Member) => x.id == message.author).nickname,
                                        discriminator: dbRes.rows.find(x => x.id == message?.author).discriminator
                                    };
                                } else {
                                    message.author = {
                                        id: message?.author,
                                        username: 'System',
                                        nickname: undefined,
                                        discriminator: '0000'
                                    };
                                }
                                        JSON.parse(guild.members).forEach((member: Member) => {
                                            if(member.roles.map(x => channel.roles.find((y: Channel) => y.id == x)).map(x => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                                            websockets.get(member.id)?.forEach(websocket => {
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
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
        }
    });

    app.patch('/guilds/*/channels/*/messages/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
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
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id === channelId);
                        if (channel) {
                            let messages = channel.messages;
                            let message = messages.find((x: Message) => x?.id === messageId);
                            if (message.author === res.locals.user && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id === x)).some((x: Role) => (x.permissions & 0x0000000080) === 0x0000000080)) {

                                message.content = req.body.message;
                                messages[messages.findIndex((x: Message) => x?.id === messageId)] = message;
                                channel.messages = messages;
                                channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;
                                database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                    if (!err) {
                                        database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                            if (!err) {
                                                if (message?.author !== '0') {
                                                    message.author = {
                                                        id: message?.author,
                                                        username: dbRes.rows.find(x => x.id === message?.author).username,
                                                        nickname: JSON.parse(guild.members).find((x: Member) => x.id === message.author).nickname,
                                                        discriminator: dbRes.rows.find(x => x.id === message?.author).discriminator
                                                    };
                                                } else {
                                                    message.author = {
                                                        id: message?.author,
                                                        username: 'System',
                                                        nickname: undefined,
                                                        discriminator: '0000'
                                                    };
                                                }
                                                JSON.parse(guild.members).forEach((member: Member) => {
                                                    if (member.roles.map(x => channel.roles.find((y: Role) => y.id === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
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
                            res.status(404).send({ error: "Channel not found." });
                        }
                    } else {
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id == channelId);
                        if(channel) {
                        let messages = channel.messages;
                        let message = messages.find((x: Message) => x?.id == messageId);
                        if (message.author == res.locals.user && JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {

                            message.content = req.body.message;
                            messages[messages.findIndex((x: Message) => x?.id == messageId)] = message;
                            channel.messages = messages;
                            channels[channels.findIndex((x: Channel) => x?.id == channelId)] = channel;
                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                        if (!err) {
                                            if(message?.author !== '0') {
                                    message.author = {
                                        id: message?.author,
                                        username: dbRes.rows.find(x => x.id == message?.author).username,
                                        nickname: JSON.parse(guild.members).find((x: Member) => x.id == message.author).nickname,
                                        discriminator: dbRes.rows.find(x => x.id == message?.author).discriminator
                                    };
                                } else {
                                    message.author = {
                                        id: message?.author,
                                        username: 'System',
                                        nickname: undefined,
                                        discriminator: '0000'
                                    };
                                }
                                        JSON.parse(guild.members).forEach((member: Member) => {
                                            if(member.roles.map(x => channel.roles.find((y: Role) => y.id == x)).map(x => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                                            websockets.get(member.id)?.forEach(websocket => {
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
                    res.status(404).send({});
                }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
        }
    });

    app.delete('/guilds/*/channels/*/messages/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const messageId = urlParams[2];
<<<<<<< HEAD
<<<<<<< HEAD
        if (guildId && channelId && messageId) {
            database.query(`SELECT * FROM guilds`, async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
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
                                database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                    if (!err) {
                                        database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                            if (!err) {
                                                if (message?.author !== '0') {
                                                    message.author = {
                                                        id: message?.author,
                                                        username: dbRes.rows.find(x => x.id === message?.author).username,
                                                        nickname: JSON.parse(guild.members).find((x: Member) => x.id === message.author).nickname,
                                                        discriminator: dbRes.rows.find(x => x.id === message?.author).discriminator
                                                    };
                                                } else {
                                                    message.author = {
                                                        id: '0',
                                                        username: 'System',
                                                        nickname: undefined,
                                                        discriminator: '0000'
                                                    };
                                                }
                                                JSON.parse(guild.members).forEach((member: Member) => {
                                                    if (member.roles.map(x => channel.roles.find((y: Role) => y.id === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                        websockets.get(member.id)?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'messageDeleted', guild: guildId, channel: channelId, message: message }));
                                                            websocket.send(JSON.stringify({ event: 'messageUnpinned', guild: guildId, channel: channelId, message: message }));
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
                            res.status(404).send({ error: "Channel not found." });
                        }
                    } else {
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
        if (guildId && channelId && messageId && req.body.message && req.body.message.length < 4001) {
=======
        if (guildId && channelId && messageId) {
>>>>>>> ec4c2a7 (im dumb)
            database.query(`SELECT * FROM guilds`, async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id == channelId);
                        if(channel) {
                        let messages = channel.messages;
                        let message = messages.find((x: Message) => x?.id == messageId);
                        if (message?.author == res.locals.user || JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                            
                            delete messages[messages.findIndex((x: Message) => x?.id == messageId)];
                            channel.messages = messages;
                            if(channel.pins.includes(messageId)) {
                                channel.pins.splice(channel.pins.indexOf(messageId), 1);
                            }
                            channels[channels.findIndex((x: Channel) => x?.id == channelId)] = channel;
                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) { 
                                    database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                    if (!err) {
                                        if(message?.author !== '0') {
                                    message.author = {
                                    id: message?.author,
                                    username: dbRes.rows.find(x => x.id == message?.author).username,
                                    nickname: JSON.parse(guild.members).find((x: Member) => x.id == message.author).nickname,
                                    discriminator: dbRes.rows.find(x => x.id == message?.author).discriminator
                                };
                            } else {
                                message.author = {
                                    id: '0',
                                    username: 'System',
                                    nickname: undefined,
                                    discriminator: '0000'
                                };
                            }
                                        JSON.parse(guild.members).forEach((member: Member) => {
                                            if(member.roles.map(x => channel.roles.find((y: Role) => y.id == x)).map(x => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'messageDeleted', guild: guildId, channel: channelId, message: message }));
                                            });
                                        }
                                        });
                                        res.status(200).send(message);
                                    } else {
                                        res.status(500).send({});
                                    }
                                });
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
                    res.status(404).send({});
                }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
        }
    });
};