import { Member, Role } from '../interfaces';
import express from "express";
import { Client } from "pg";

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {

    app.get('/guilds/*/members', (req: express.Request, res: express.Response) => {
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
                    if (guild && JSON.parse(guild.members).find((x: Member) => x.id === res.locals.user)) {
                        database.query('SELECT * FROM users', async (err, dbRes) => {
                            if (!err) {
                                const members = JSON.parse(guild.members);
                                const roles = JSON.parse(guild.roles);

                                res.send(members.map((x: Member) => {
                                    if (x) {
                                        x.username = dbRes.rows.find(y => x?.id === y.id).username;
                                        x.discriminator = dbRes.rows.find(y => x?.id === y.id).discriminator;
                                    }
                                    return x;
                                }).filter((x: Member) => x).sort((a: Member, b: Member) => (a.nickname ?? a.username) > (b.nickname ?? b.username) ? 1 : (a.nickname ?? a.username) < (b.nickname ?? b.username) ? -1 : 0));
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

    app.get('/guilds/*/members/@me', (req: express.Request, res: express.Response) => {
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
                    if (guild && JSON.parse(guild.members).find((x: Member) => x.id === res.locals.user)) {
                        database.query('SELECT * FROM users', async (err, dbRes) => {
                            if (!err) {
                                res.send(JSON.parse(guild.members).filter((x: Member) => x?.id === res.locals.user).map((x: Member) => {
                                    x.username = dbRes.rows.find(x => x.id === res.locals.user).username;
                                    x.discriminator = dbRes.rows.find(x => x.id === res.locals.user).discriminator;
                                    return x;
                                })[0]);
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

    app.get('/guilds/*/members/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        if (guildId && userId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x.id === res.locals.user)) {
                        const members = JSON.parse(guild.members);
                        if(members.filter((x: Member) => x?.id === userId)) {
                        database.query('SELECT * FROM users', async (err, dbRes) => {
                            if (!err) {
                                res.send(members.filter((x: Member) => x?.id === userId).map((x: Member) => {
                                    x.username = dbRes.rows.find(x => x.id === userId).username;
                                    x.discriminator = dbRes.rows.find(x => x.id === userId).discriminator;
                                    return x;
                                })[0]);
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(404).send({ error: "Not found" });
                    }
                    } else {
                        res.status(403).send({ error: "Missing permission" });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/guilds/*/members/@me', (req: express.Request, res: express.Response) => {
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
                    if(guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000200) === 0x0000000200)) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname === null) {
                                const members = JSON.parse(guild.members);
                                const user = members.find((x: Member) => x?.id === res.locals.user);
                                user.nickname = req.body.nickname ? req.body.nickname : null;
                                members[members.findIndex((x: Member) => x?.id === res.locals.user)] = user;
                                database.query('UPDATE guilds SET members = $1 WHERE id = $2', [JSON.stringify(members), guildId], (err, dbRes) => {
                                    if (!err) {
                                        members.forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'memberEdited', member: user }));
                                            });
                                        });
                                        res.send(user);
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
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/guilds/*/members/@me', (req: express.Request, res: express.Response) => {
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
                        const members = JSON.parse(guild.members);
                        if (!members.find((x: Member) => x?.id === res.locals.user)?.roles.includes('0')) {
                            delete members[members.findIndex((x: Member) => x?.id === res.locals.user)];
                            database.query('UPDATE guilds SET members = $1 WHERE id = $2', [JSON.stringify(members), guildId], (err, dbRes) => {
                                if (!err) {
                                    websockets.get(res.locals.user)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'guildLeft', guild: guildId }));
                                    });
                                    res.send({});
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
                            });
                        } else {
                            res.status(403).send({ error: "You own this guild." });
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

    app.patch('/guilds/*/members/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        if (guildId && userId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        const members = JSON.parse(guild.members);
                        const user = members.find((x: Member) => x?.id === userId);
                        if (JSON.parse(guild.roles).findIndex((role: Role) => members.find((x: Member) => x?.id === res.locals.user)?.roles.includes(role.id)) < JSON.parse(guild.roles).findIndex((role: Role) => user?.roles.includes(role.id)) && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000400) === 0x0000000400)) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname === null) {
                                user.nickname = req.body.nickname ? req.body.nickname : null;
                                members[members.findIndex((x: Member) => x?.id === userId)] = user;
                                database.query('UPDATE guilds SET members = $1 WHERE id = $2', [JSON.stringify(members), guildId], (err, dbRes) => {
                                    if (!err) {
                                        members.forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'memberEdited', member: user }));
                                            });
                                        });
                                        res.send(user);
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
                        res.status(404).send({ error: "Missing permmission." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/guilds/*/members/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        if (guildId && userId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        const members = JSON.parse(guild.members);
                        const user = members.find((x: Member) => x?.id === userId);
                        if(user) {
                        if (JSON.parse(guild.roles).findIndex((role: Role) => members.find((x: Member) => x?.id === res.locals.user)?.roles.includes(role.id)) < JSON.parse(guild.roles).findIndex((role: Role) => user?.roles.includes(role.id)) && (!req.headers.ban && members.find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000002) === 0x0000000002)) || (req.headers.ban && members.find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000004) === 0x0000000004))) {
                            delete members[members.findIndex((x: Member) => x?.id === userId)];
                            let bans = JSON.parse(guild.bans);
                            if (req.headers.ban) {
                                bans.push(userId);
                            }
                            database.query('UPDATE guilds SET members = $1, bans = $2 WHERE id = $3', [JSON.stringify(members), JSON.stringify(bans), guildId], (err, dbRes) => {
                                if (!err) {
                                    websockets.get(userId)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'guildLeft', guild: guildId }));
                                    });
                                    if (req.headers.ban) {
                                        members.filter((member: Member) => members.find((x: Member) => x?.id === member.id)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000004) === 0x0000000004)).forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'memberBanned', member: user }));
                                            });
                                        });
                                    }
                                    res.send(user);
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