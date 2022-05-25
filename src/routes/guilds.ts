import express from 'express';
import cassandra from 'cassandra-driver';
import crypto from 'crypto';
import mime from 'mime-types';
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage(), limits: {
    fileSize: 1000000000
} })
import { Guild, Member, Role } from '../interfaces';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client, uploadFile: any) => {
    app.get('/guilds/*', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        res.send(Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? guild[x] : x === 'members' ? Object.keys(guild[x]).length : guild[x])[index] }), {}));
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.post('/guilds', (req: express.Request, res: express.Response) => {
        database.execute('SELECT * FROM users WHERE id = ?', [res.locals.user], { prepare: true }).then(async dbRes => {
            
                const user = dbRes.rows[0];
                if (user?.type === 'USER') {
                    if (req.body.name && req.body.name.length < 31) {
                        const guild = {
                            id: crypto.randomUUID(),
                            name: req.body.name,
                            description: req.body.description ?? null,
                            public: false,
                            channels: [{ id: crypto.randomUUID(), position: 0, name: 'general', topic: null, type: 'text', creation: Date.now(), roles: [{ id: '00000000-0000-0000-0000-000000000000', permissions: 456 }, { id: '11111111-1111-1111-1111-111111111111', permissions: 192 }], webhooks: [], messages: [], pins: [] }],
                            roles: [{ id: '00000000-0000-0000-0000-000000000000', name: 'Owner', permissions: 3647, color: null, hoist: false }, { id: '11111111-1111-1111-1111-111111111111', name: 'Members', permissions: 513, color: null, hoist: false }],
                            members: [{ id: res.locals.user, nickname: null, roles: ['00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111'] }],
                            creation: Date.now(),
                            bans: [],
                            invites: []
                        }
                        database.execute('INSERT INTO guilds (id, name, description, public, channels, roles, members, creation, bans, invites) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [guild.id, guild.name, guild.description, guild.public, guild.channels, (guild.roles ?? []), guild.members, guild.creation, guild.bans, guild.invites], { prepare: true }).then(() => {
                            
                                const parsedGuild: Guild = { ...guild, ...{ members: 1 } };
                                delete parsedGuild.channels;
                                delete parsedGuild.invites;
                                delete parsedGuild.bans;
                                websockets.get(res.locals.user)?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: 'guildJoined', guild: parsedGuild }));
                                });
                                res.status(201).send(parsedGuild);
                            
                        });
                    } else {
                        res.status(400).send({ error: "Something is missing or it's not appropiate." });
                    }
                } else {
                    res.status(403).send({ error: "Only users can create guilds." });
                }
            
        });
    });

    app.post('/guilds/*/add/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const botId = urlParams[1];
        const permissions = !isNaN(Number(req.query?.permissions)) ? Number(req.query?.permissions) : 0;
        if (guildId && botId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild) {
                        const members = guild.members;
                        if (members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: string) => (((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions ?? 0) >= permissions) && ((((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010))) {
                            database.execute('SELECT * FROM users', { prepare: true }).then(dbRes => {
                                
                                    const bot = dbRes.rows.find(x => x?.id?.toString() === botId);
                                    if (bot) {
                                        if (!members.find((x: Member) => x?.id?.toString() === botId)) {
                                            let roles = guild.roles ?? [];
                                            const rolesArray = ['11111111-1111-1111-1111-111111111111'];
                                            if (permissions ?? 0 > 0) {
                                                const role = { id: crypto.randomUUID(), name: bot.name, permissions: permissions, color: null, hoist: false };
                                                roles.push(role);
                                                rolesArray.push(role.id)
                                            }
                                            members.push({ id: botId, nickname: null, roles: rolesArray });
                                            database.execute('UPDATE guilds SET members = ?, roles = ? WHERE id = ?', [members, roles, guild.id], { prepare: true }).then(() => {
                                                
                                                    const { token, email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                                                    res.send(returnedBot);
                                                
                                            });
                                        } else {
                                            res.status(403).send({ error: "Bot already added." });
                                        }
                                    } else {
                                        res.status(404).send({ error: "Not found." });
                                    }
                                
                            });
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

    app.patch('/guilds/*/icon', upload.single('icon'), (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(async dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const members = guild.members;
                        if (members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: string) => (((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)) {

                            if (req.file) {
                                if (mime.extension(req.file?.mimetype ?? '') === 'png') {
                                    const icon = await uploadFile(req.file);
                                    database.execute('UPDATE guilds SET icon = ? WHERE id = ?', [icon, guild.id], { prepare: true }).then(() => {
                                        
                                           guild.icon = icon;
                                           const parsedGuild = Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? guild[x] : x === 'members' ? Object.keys(guild[x]).length : guild[x])[index] }), {});
                                            members.forEach((member: Member) => {
                                                websockets.get(member?.id?.toString())?.forEach(websocket => {
                                                    websocket.send(JSON.stringify({ event: 'guildEdited', guild: parsedGuild }));
                                                });
                                            });
                                            res.send(parsedGuild);
                                        
                                    });
                                } else {
                                    res.status(400).send({ error: "We only accept PNG." });
                                }
                            } else {
                                database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                                    
                                        if (dbRes.rows[0]?.icon) {
                                            database.execute('UPDATE guilds SET icon = ? WHERE id = ?', ['', guild.id], { prepare: true }).then(() => {
                                                
                                                   guild.icon = '';
                                                   const parsedGuild = Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? guild[x] : x === 'members' ? Object.keys(guild[x]).length : guild[x])[index] }), {});
                                                    members.forEach((member: Member) => {
                                                        websockets.get(member?.id?.toString())?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'guildEdited', guild: parsedGuild }));
                                                        });
                                                    });
                                                    res.send(parsedGuild);
                                                
                                            });
                                        } else {
                                            res.status(400).send({ error: "Something is missing or it's not appropiate." });
                                        }
                                    
                                });
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

    app.patch('/guilds/*', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild) {
                        const members = guild.members;
                        if (members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: string) => (((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)) {
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

                            if (req.body.owner && members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes('0000000-0000-0000-0000-000000000000') && members.find((x: Member) => x?.id?.toString() === req.body.owner)) {
                                members[members.findIndex((x: Member) => x?.id?.toString() === res.locals.user)].roles.splice(members[members.findIndex((x: Member) => x?.id?.toString() === res.locals.user)].roles.indexOf('0000000-0000-0000-0000-000000000000'), 1);
                                members[members.findIndex((x: Member) => x?.id?.toString() === req.body.owner)].roles.push('0000000-0000-0000-0000-000000000000');
                                changesWereMade = true;
                            }

                            database.execute('UPDATE guilds SET name = ?, description = ?, public = ?, members = ? WHERE id = ?', [guild.name, guild.description, guild.public, members,guildId], { prepare: true }).then(() => {
                                
                                    if (changesWereMade) {
                                        const parsedGuild = Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? guild[x] : x === 'members' ? Object.keys(guild[x]).length : guild[x])[index] }), {});
                                        members.forEach((member: Member) => {
                                            websockets.get(member?.id?.toString())?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'guildEdited', guild: parsedGuild }));
                                            });
                                        });
                                        res.send(parsedGuild);
                                    } else {
                                        res.status(400).send({ error: "Something is missing or it's not appropiate." });
                                    }
                                
                            });
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

    app.delete('/guilds/*', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild) {
                        const members = guild.members;
                        if (members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes('0000000-0000-0000-0000-000000000000')) {
                            if (guild.name === req.headers.name) {

                                database.execute('DELETE FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(async dbRes => {
                                    
                                        members.forEach((member: Member) => {
                                            websockets.get(member?.id?.toString())?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'guildLeft', guild: guildId }));
                                            });
                                        });
                                        res.send({});
                                    
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
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });
};