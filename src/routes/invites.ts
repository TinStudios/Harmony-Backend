import express from 'express';
import { Client } from 'pg';
import crypto from 'crypto';
import { Member, Role, Invite } from '../interfaces';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {
    app.get('/guilds/*/invites', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
>>>>>>> 51556ba (Some changes)
                    if (guild) {
                        const members = JSON.parse(guild.members);
                        if (members.find((x: Member) => x?.id === res.locals.user)?.roles.find((x: String) => ((JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)) {
                            const invites = JSON.parse(guild.invites);
                            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                if (!err) {
<<<<<<< HEAD
                                    res.send(invites.filter((invite: Invite) => invite.expiration > Date.now() && ((invite.uses ?? Infinity) < invite.maxUses)).map((invite: Invite) => {
                                        invite.author = {
                                            id: invite?.author as string,
                                            username: dbRes.rows.find(x => x?.id === invite?.author)?.username,
                                            nickname: JSON.parse(guild.members).find((x: Member) => x?.id === invite?.author)?.nickname,
                                            discriminator: dbRes.rows.find(x => x?.id === invite?.author)?.discriminator
                                        };
                                        return invite;
                                    }));
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
                            });
=======
                            res.send(invites.filter((invite: Invite) => invite.expiration > Date.now() && ((invite.uses ?? Infinity) < invite.maxUses)).map((invite: Invite) => {
                                invite.author = {
                                    id: invite?.author as string,
                                    username: dbRes.rows.find(x => x?.id == invite?.author)?.username,
                                    nickname: JSON.parse(guild.members).find((x: Member) => x?.id == invite?.author)?.nickname,
                                    discriminator: dbRes.rows.find(x => x?.id == invite?.author)?.discriminator
                                };
                                return invite;
                            }));
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
>>>>>>> 51556ba (Some changes)
                        } else {
                            res.status(403).send({ error: "Missing permission." });
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

    app.post('/guilds/*/invites', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const members = JSON.parse(guild.members);
                        if (members.find((x: Member) => x?.id === res.locals.user)?.roles.find((x: String) => ((JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions ?? 0) & 0x0000000001) === 0x0000000001)) {
                            const invites = JSON.parse(guild.invites);
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
                                database.query(`UPDATE guilds SET invites = $1 WHERE id = $2`, [JSON.stringify(invites), guildId], (err, dbRes) => {
                                    if (!err) {
                                        let inviteAuthored = { ...invite };
                                        inviteAuthored.author = {
                                            id: invite?.author as string,
                                            username: dbRes.rows.find(x => x?.id === invite?.author)?.username,
                                            nickname: JSON.parse(guild.members).find((x: Member) => x?.id === invite?.author)?.nickname,
                                            discriminator: dbRes.rows.find(x => x?.id === invite?.author)?.discriminator
                                        };
                                        members.filter((member: Member) => member?.roles.find((x: String) => ((JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)).forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'inviteCreated', invite: inviteAuthored }));
                                            });
                                        });
                                        res.status(201).send(invite);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(400).send({ error: "Something is missing." });
                            }
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        const members = JSON.parse(guild.members);
                       if (members.find((x: Member) => x?.id === res.locals.user)?.roles.find((x: String) => ((JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions ?? 0) & 0x0000000001) === 0x0000000001)) {
                        const invites = JSON.parse(guild.invites);
                        const code = crypto.randomUUID().split('-')[0];
                        const expiration = req.body.expiration ?? new Date(new Date().setDate(new Date().getDate() + 7)).getTime();
                        const maxUses = req.body.maxUses ?? null;
                        if(!isNaN(expiration) && expiration > Date.now() && !isNaN(maxUses)) {
                        const invite = {
                            code: code,
                            author: res.locals.user,
                            expiration: expiration,
                            maxUses: maxUses,
                            uses: 0
                        };
                        invites.push(invite);
                            database.query(`UPDATE guilds SET invites = $1 WHERE id = $2`, [JSON.stringify(invites), guildId], (err, dbRes) => {
                                if (!err) {
                                    let inviteAuthored = {...invite};
                                    inviteAuthored.author = {
                                        id: invite?.author as string,
                                        username: dbRes.rows.find(x => x?.id == invite?.author)?.username,
                                        nickname: JSON.parse(guild.members).find((x: Member) => x?.id == invite?.author)?.nickname,
                                        discriminator: dbRes.rows.find(x => x?.id == invite?.author)?.discriminator
                                    };
                                    members.filter((member: Member) => member?.roles.find((x: String) => ((JSON.parse(guild.roles).find((y: Role) => y?.id == x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)).forEach((member: Member) => {
                                        websockets.get(member.id)?.forEach(websocket => {
                                            websocket.send(JSON.stringify({ event: 'inviteCreated', invite: inviteAuthored }));
                                        });
                                    });
                                        res.send(invite);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                            });
                        } else {
                            res.status(400).send({ error: "Something is missing." });
                        }
>>>>>>> 51556ba (Some changes)
                        } else {
                            res.status(403).send({ error: "Missing permission." });
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

    app.delete('/guilds/*/invites', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const code = urlParams[1];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const members = JSON.parse(guild.members);
                        if (members.find((x: Member) => x?.id === res.locals.user)?.roles.find((x: String) => ((JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)) {
                            const invites = JSON.parse(guild.invites);
                            let invite = invites.find((x: Invite) => x.code === code);
                            if (invite) {
                                invites.splice(invites.findIndex((x: Invite) => x.code === code), 1);
                                database.query(`UPDATE guilds SET invites = $1 WHERE id = $2`, [invites, guildId], (err, dbRes) => {
                                    if (!err) {
                                        invite.author = {
                                            id: invite?.author as string,
                                            username: dbRes.rows.find(x => x?.id === invite?.author)?.username,
                                            nickname: JSON.parse(guild.members).find((x: Member) => x?.id === invite?.author)?.nickname,
                                            discriminator: dbRes.rows.find(x => x?.id === invite?.author)?.discriminator
                                        };
                                        members.filter((member: Member) => member?.roles.find((x: String) => ((JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)).forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'inviteDeleted', invite: invite }));
                                            });
                                        });
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        const members = JSON.parse(guild.members);
                        if (members.find((x: Member) => x?.id === res.locals.user)?.roles.find((x: String) => ((JSON.parse(guild.roles).find((y: Role) => y?.id == x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)) {
                            const invites = JSON.parse(guild.invites);   
                            let invite = invites.find((x: Invite) => x.code === code); 
                        if(invite) {
                            invites.splice(invites.findIndex((x: Invite) => x.code === code), 1);
                            database.query(`UPDATE guilds SET invites = $1 WHERE id = $2`, [invites, guildId], (err, dbRes) => {
                                if (!err) {
                                    invite.author = {
                                        id: invite?.author as string,
                                        username: dbRes.rows.find(x => x?.id == invite?.author)?.username,
                                        nickname: JSON.parse(guild.members).find((x: Member) => x?.id == invite?.author)?.nickname,
                                        discriminator: dbRes.rows.find(x => x?.id == invite?.author)?.discriminator
                                    };
                                    members.filter((member: Member) => member?.roles.find((x: String) => ((JSON.parse(guild.roles).find((y: Role) => y?.id == x)?.permissions ?? 0) & 0x0000000010) === 0x0000000010)).forEach((member: Member) => {
                                        websockets.get(member.id)?.forEach(websocket => {
                                            websocket.send(JSON.stringify({ event: 'inviteDeleted', invite: invite }));
                                        });
                                    });
>>>>>>> 51556ba (Some changes)
                                        res.send({});
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
<<<<<<< HEAD
                                });
                            } else {
                                res.status(404).send({ error: "Invite not found." });
                            }
                        } else {
                            res.status(403).send({ error: "Missing permission." });
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

    app.get('/invites/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const code = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (code) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => JSON.parse(x?.invites).find((x: Invite) => x.code === code));
                    if (guild) {
                        let invites = JSON.parse(guild.invites);
                        let invite = invites.find((x: Invite) => x.code === code);

                        if (invite.expiration > Date.now() && (invite.uses < (invite.maxUses ?? Infinity))) {
                            res.send(Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? JSON.parse(guild[x]) : x === 'members' ? Object.keys(JSON.parse(guild[x])).length : guild[x])[index] }), {}));
                        } else {
                            res.status(403).send({ error: "Invite expired." });
                        }
                    } else {
                        res.status(404).send({ error: "Invite not found." });
=======
                            });
                        } else {
                            res.status(404).send({ error: "Invite not found." });
                        }
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(404).send({ error: "Guild not found." });
>>>>>>> 51556ba (Some changes)
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });

    app.get('/invites/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const code = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (code) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => JSON.parse(x?.invites).find((x: Invite) => x.code === code));
                    if (guild) {
                        let invites = JSON.parse(guild.invites);
                        let invite = invites.find((x: Invite) => x.code === code);

                        if(invite.expiration > Date.now() && ((invite.uses ?? Infinity) < invite.maxUses)) {
                                    res.send(Object.keys(guild).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).map(x => x == 'bans' || x == 'members' || x == 'roles' ? JSON.parse(guild[x]) : x == 'channels' ? (() => {
                                        let channels = JSON.parse(guild[x]);
                                        const newChannels = channels.map((channel: any) => {
                                        delete channel.messages;
                                        delete channel.pins;
                                        return channel;
                                    });
                                        return newChannels;
                                    })() : guild[x])[index] }), {}));
                        } else {
                            res.status(403).send({ error: "Invite expired." });
                        }
                    } else {
                        res.status(404).send({ error: "Invite not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });

    app.post('/invites/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const code = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (code) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => JSON.parse(x?.invites).find((x: Invite) => x.code === code));
                    if (guild) {
                        let invites = JSON.parse(guild.invites);
                        let invite = invites.find((x: Invite) => x.code === code);

<<<<<<< HEAD
                        if (invite.expiration > Date.now() && (invite.uses < (invite.maxUses ?? Infinity))) {
                            const members = JSON.parse(guild.members);
                            if (!members.find((x: Member) => x.id === res.locals.user)) {
                                members.push({ id: res.locals.user, nickname: null, roles: ['1'] });
                                invite.uses++;
                                invites[invites.findIndex((x: Invite) => x.code === code)] = invite;
                            }

                            database.query(`UPDATE guilds SET members = $1, invites = $2 WHERE id = $3`, [JSON.stringify(members), JSON.stringify(invites), guild.id], (err, dbRes) => {
                                if (!err) {
                                    const parsedGuild = Object.keys(guild).filter(x => x !== 'invites').reduce((obj, key, index) => ({
                                        ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites').map(x => x === 'bans' || x === 'roles' ? JSON.parse(guild[x]) : x === 'channels' ? (() => {
                                            let channels = JSON.parse(guild[x]);
                                            const newChannels = channels.map((channel: any) => {
                                                delete channel.messages;
                                                delete channel.pins;
                                                return channel;
                                            });
                                            return newChannels;
                                        })() : x === 'members' ? Object.keys(JSON.parse(guild[x])).length : guild[x])[index]
                                    }), {});
                                    websockets.get(res.locals.user)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'guildJoined', guild: parsedGuild }));
                                    });
                                    res.send(parsedGuild);
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
=======
                        if(invite.expiration > Date.now() && ((invite.uses ?? Infinity) < invite.maxUses)) {
                        const members = JSON.parse(guild.members);
                        members.push({ id: res.locals.user, nickname: null, roles: ['1'] });
                        invite.uses++;
                        invites[invites.findIndex((x: Invite) => x.code === code)] = invite;
                        
                            database.query(`UPDATE guilds SET members = $1, invites = $2, WHERE id = $3`, [JSON.stringify(members), JSON.stringify(invites), guild.id], (err, dbRes) => {
                                if (!err) {
                                    const parsedGuild = Object.keys(guild).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).map(x => x == 'bans' || x == 'members' || x == 'roles' ? JSON.parse(guild[x]) : x == 'channels' ? (() => {
                                        let channels = JSON.parse(guild[x]);
                                        const newChannels = channels.map((channel: any) => {
                                        delete channel.messages;
                                        delete channel.pins;
                                        return channel;
                                    });
                                        return newChannels;
                                    })() : guild[x])[index] }), {});
                                        websockets.get(res.locals.user)?.forEach(websocket => {
                                            websocket.send(JSON.stringify({ event: 'guildJoined', guild: parsedGuild }));
                                        });
                                    res.send(parsedGuild);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
>>>>>>> 51556ba (Some changes)
                            });
                        } else {
                            res.status(403).send({ error: "Invite expired." });
                        }
                    } else {
                        res.status(404).send({ error: "Invite not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });
};