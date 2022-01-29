import express from 'express';
import { Client } from 'pg';
import crypto from 'crypto';
import mime from 'mime-types';
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() })
import { NFTStorage, File } from 'nft.storage';
import { Guild, Member, Role } from '../interfaces';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, storage: NFTStorage) => {
    app.get('/guilds/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                        if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                            res.send(Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? JSON.parse(guild[x]) : x === 'members' ? Object.keys(JSON.parse(guild[x])).length : guild[x])[index] }), {}));
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

    app.post('/guilds', (req: express.Request, res: express.Response) => {
        if (req.body.name && req.body.name.length < 31) {
            const guild = {
                id: crypto.randomUUID(),
                name: req.body.name,
                description: req.body.description ?? null,
                public: false,
                channels: [{ id: crypto.randomUUID(), name: 'general', topic: null, creation: Date.now(), roles: [{ id: '0', permissions: 456 }, { id: '1', permissions: 192 }], messages: [], pins: [] }],
                roles: [{ id: '0', name: 'Owner', permissions: 3647, color: null, hoist: false }, { id: '1', name: 'Members', permissions: 513, color: null, hoist: false }],
                members: [{ id: res.locals.user, nickname: null, roles: ['0', '1'] }],
                creation: Date.now(),
                bans: [],
                invites: []
            }
            database.query('INSERT INTO guilds (id, name, description, public, channels, roles, members, bans, invites) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', [guild.id, guild.name, guild.description, guild.public, JSON.stringify(guild.channels), JSON.stringify(guild.roles), JSON.stringify(guild.members), JSON.stringify(guild.bans), JSON.stringify(guild.invites)], (err, dbRes) => {
                if (!err) {
                    const parsedGuild: Guild = { ...guild, ...{ members: [] } };
                    delete parsedGuild.members;
                    delete parsedGuild.channels;
                    delete parsedGuild.invites;
                    delete parsedGuild.bans;
                    websockets.get(res.locals.user)?.forEach(websocket => {
                        websocket.send(JSON.stringify({ event: 'guildJoined', guild: parsedGuild }));
                    });
                    res.status(201).send(parsedGuild);
                } else {
                    console.log(err);
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/guilds/*/icon', upload.single('icon'), (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query('SELECT * FROM guilds', async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        const members = JSON.parse(guild.members);
                        if (members.find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => ((JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)) {

                            if (req.file) {
                                if (mime.extension(req.file?.mimetype ?? '') === 'png') {
                                    const icon = await storage.store({
                                        name: guildId + '\'s icon',
                                        description: 'Seltorn\'s ' + guildId + ' icon',
                                        image: new File([req.file.buffer], guildId + '.png', { type: 'image/png' })
                                      });
                                    database.query('INSERT INTO files (id, type, url) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET url = $3', [guildId, 'guilds', icon.url], (err, dbRes) => {
                                        if (!err) {
                                            const parsedGuild: Guild = { ...guild };
                                            delete parsedGuild.channels;
                                            delete parsedGuild.invites;
                                            delete parsedGuild.bans;
                                            members.forEach((member: Member) => {
                                                websockets.get(member.id)?.forEach(websocket => {
                                                    websocket.send(JSON.stringify({ event: 'guildNewIcon', guild: parsedGuild }));
                                                });
                                            });
                                            res.send(parsedGuild);
                                        } else {
                                            res.status(500).send({ error: "Something went wrong with our server." });
                                        }
                                    });
                                } else {
                                    res.status(400).send({ error: "We only accept PNG." });
                                }
                            } else {
                                database.query('SELECT * FROM files', (err, dbRes) => {
                                    if (!err) {
                                if (dbRes.rows.find(x => x.id === guildId && x.type === 'guilds')) {
                                    database.query('DELETE FROM files WHERE id = $1', [guildId], async (err, dbRes) => {
                                        if (!err) {
                                    res.send({});
                                        } else {
                                            res.status(500).send({ error: "Something went wrong with our server." });
                                        }
                                    });
                                } else {
                                    res.status(400).send({ error: "Something is missing or it's not appropiate." });
                                }
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
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

    app.patch('/guilds/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const members = JSON.parse(guild.members);
                        if (members.find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => ((JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)) {
                            let changesWereMade = false;

                            if (req.body.name && req.body.name.length < 31) {
                                guild.name = req.body.name;
                                changesWereMade = true;
                            }

                            if (req.body.description && req.body.description.length < 1025) {
                                guild.description = req.body.description;
                                changesWereMade = true;
                            } else if (guild.description !== null && req.body.description === null) {
                                guild.description = null;
                            }

                            if (typeof req.body.public === 'boolean') {
                                guild.public = req.body.public;
                                changesWereMade = true;
                            }

                            if (req.body.owner && members.find((x: Member) => x?.id === res.locals.user)?.roles.includes('0') && members.find((x: Member) => x?.id === req.body.owner)) {
                                members[members.findIndex((x: Member) => x?.id === res.locals.user)].roles.splice(members[members.findIndex((x: Member) => x?.id === res.locals.user)].roles.indexOf('0'), 1);
                                members[members.findIndex((x: Member) => x?.id === req.body.owner)].roles.push('0');
                                changesWereMade = true;
                            }

                            database.query('UPDATE guilds SET name = $1, description = $2, public = $3, members = $4 WHERE id = $5', [guild.name, guild.description, guild.public, JSON.stringify(members), guildId], (err, dbRes) => {
                                if (!err) {
                                    if (changesWereMade) {
                                        const parsedGuild: Guild = { ...guild };
                                        delete parsedGuild.channels;
                                        delete parsedGuild.invites;
                                        delete parsedGuild.bans;
                                        members.forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'guildEdited', guild: parsedGuild }));
                                            });
                                        });
                                        res.send(parsedGuild);
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

    app.delete('/guilds/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const members = JSON.parse(guild.members);
                        if (members.find((x: Member) => x?.id === res.locals.user)?.roles.includes('0')) {
                            if (guild.name === req.headers.name) {

                                database.query('DELETE FROM guilds WHERE id = $1', [guildId], async (err, dbRes) => {
                                    if (!err) {
                                        members.forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'guildLeft', guild: guildId }));
                                            });
                                        });
                                        res.send({});
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