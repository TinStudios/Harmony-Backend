import express from 'express';
import cassandra from 'cassandra-driver';
import crypto from 'crypto';
import { Member, Role, Invite, Channel } from '../interfaces';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client) => {
    app.get('/guilds/*/invites', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const members = guild.members;
                        if (members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: String) => (((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)) {
                            const invites = guild.invites ?? [];
                            database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                
                                    res.send(invites.filter((invite: Invite) => invite && (invite.expiration > Date.now() && (invite.uses < (invite.maxUses ?? Infinity)))).map((invite: Invite) => {
                                        invite.author = {
                                            id: invite?.author as string,
                                            username: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.username,
                                            nickname: guild.members.find((x: Member) => x?.id?.toString() === invite?.author)?.nickname,
                                            roles: guild.members.find((x: Member) => x?.id?.toString() === invite?.author)?.roles,
                                            discriminator: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.discriminator,
                                            avatar: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.avatar ?? 'userDefault',
                                            about: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.about,
                                            type: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.type ?? 'UNKNOWN'
                                        };
                                        return invite;
                                    }));
                                
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

    app.post('/guilds/*/invites', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const members = guild.members;
                        if (members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: String) => (((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions ?? 0) & 0x0000000001) === 0x0000000001)) {
                            const invites = guild.invites ?? [];
                            const code = crypto.randomUUID().split('-')[0];
                            const expiration = req.body.expiration ?? new Date(new Date().setDate(new Date().getDate() + 7)).getTime();
                            const maxUses = req.body.maxUses ?? null;
                            if (!isNaN(expiration) && expiration > Date.now() && !isNaN(maxUses)) {
                                const invite = {
                                    code: code,
                                    author: res.locals.user,
                                    expiration: expiration,
                                    maxUses: maxUses,
                                    uses: 0
                                };
                                invites.push(invite);
                                database.execute('UPDATE guilds SET invites = ? WHERE id = ?', [invites, guildId], { prepare: true }).then(() => {
                                    
                                        let inviteAuthored = { ...invite };
                                        inviteAuthored.author = {
                                            id: invite?.author as string,
                                            username: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.username,
                                            nickname: guild.members.find((x: Member) => x?.id?.toString() === invite?.author)?.nickname,
                                            roles: guild.members.find((x: Member) => x?.id?.toString() === invite?.author)?.roles,
                                            discriminator: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.discriminator,
                                            avatar: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.avatar ?? 'userDefault',
                                            type: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.type ?? 'UNKNOWN'
                                        };
                                        members.filter((member: Member) => member?.roles.find((x: String) => (((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)).forEach((member: Member) => {
                                            websockets.get(member.id?.toString())?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'inviteCreated', invite: inviteAuthored }));
                                            });
                                        });
                                        res.status(201).send(invite);
                                    
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

    app.delete('/guilds/*/invites/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const code = urlParams[1];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const members = guild.members;
                        if (members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: String) => (((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)) {
                            const invites = guild.invites ?? [];
                            let invite = invites.find((x: Invite) => x.code === code);
                            if (invite) {
                                invites.splice(invites.findIndex((x: Invite) => x.code === code), 1);
                                database.execute('UPDATE guilds SET invites = ? WHERE id = ?', [invites, guildId], { prepare: true }).then(() => {
                                    
                                        invite.author = {
                                            id: invite?.author as string,
                                            username: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.username,
                                            nickname: guild.members.find((x: Member) => x?.id?.toString() === invite?.author)?.nickname,
                                            roles: guild.members.find((x: Member) => x?.id?.toString() === invite?.author)?.roles,
                                            discriminator: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.discriminator,
                                            avatar: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.avatar ?? 'userDefault',
                                            type: dbRes.rows.find(x => x?.id?.toString() === invite?.author)?.type ?? 'UNKNOWN'
                                        };
                                        members.filter((member: Member) => member?.roles.find((x: String) => (((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)).forEach((member: Member) => {
                                            websockets.get(member.id?.toString())?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'inviteDeleted', invite: invite }));
                                            });
                                        });
                                        res.send({});
                                    
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

    app.get('/invites/*', (req: express.Request, res: express.Response) => {
        const code = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (code) {
            database.execute('SELECT * FROM guilds WHERE code = ? ALLOW FILTERING', [code], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild) {
                        let invites = guild.invites ?? [];
                        let invite = invites.find((x: Invite) => x.code === code);

                        if (invite.expiration > Date.now() && (invite.uses < (invite.maxUses ?? Infinity))) {
                            res.send(Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? guild[x] : x === 'members' ? Object.keys(guild[x]).length : guild[x])[index] }), {}));
                        } else {
                            res.status(403).send({ error: "Invite expired." });
                        }
                    } else {
                        res.status(404).send({ error: "Not found." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.post('/invites/*', (req: express.Request, res: express.Response) => {
        const code = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (code) {
            database.execute('SELECT * FROM users WHERE id = ?', [res.locals.user], { prepare: true }).then(dbRes => {
                
                    const user = dbRes.rows[0];
                    if (user?.type === 'USER') {
                        database.execute('SELECT * FROM guilds WHERE code = ? ALLOW FILTERING', [code], { prepare: true }).then(dbRes => {
                
                            const guild = dbRes.rows[0];
                                if (guild) {
                                    let invites = guild.invites ?? [];
                                    let invite = invites.find((x: Invite) => x.code === code);

                                    if (invite.expiration > Date.now() && (invite.uses < (invite.maxUses ?? Infinity))) {
                                        const members = guild.members;
                                        if (!members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                                            members.push({ id: res.locals.user, nickname: null, roles: ['11111111-1111-1111-1111-111111111111'] });
                                            invite.uses++;
                                            invites[invites.findIndex((x: Invite) => x.code === code)] = invite;
                                        }

                                        database.execute('SELECT * FROM guilds WHERE code = ? ALLOW FILTERING', [code], { prepare: true }).then(dbRes => {
                
                                            const guild = dbRes.rows[0];
                                            if (guild) {
                                                let invites = guild.invites ?? [];
                                                let invite = invites.find((x: Invite) => x.code === code);
                        
                                                if (invite.expiration > Date.now() && (invite.uses < (invite.maxUses ?? Infinity))) {
                                                    res.send(Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? guild[x] : x === 'members' ? Object.keys(guild[x]).length : guild[x])[index] }), {}));
                                                } else {
                                                    res.status(403).send({ error: "Invite expired." });
                                                }
                                            } else {
                                                res.status(404).send({ error: "Not found." });
                                            }
                                        
                                    });
                                    } else {
                                        res.status(403).send({ error: "Invite expired." });
                                    }
                                } else {
                                    res.status(403).send({ error: "Missing permission." });
                                }
                            
                        });
                    } else {
                        res.status(403).send({ error: "Only users can join this way." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });
};