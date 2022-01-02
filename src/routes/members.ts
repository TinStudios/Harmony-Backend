import { Member, Role } from '../interfaces';
import express from "express";
import { Client } from "pg";

<<<<<<< HEAD
<<<<<<< HEAD
export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {
=======
module.exports = (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {
>>>>>>> 2aecc42 (Changed to import)

    app.get('/guilds/*/members', (req: express.Request, res: express.Response) => {
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
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (JSON.parse(guild.members).find((x: Member) => x.id === res.locals.user)) {
                        database.query(`SELECT * FROM users`, async (err, dbRes) => {
                            if (!err) {
                                res.send(JSON.parse(guild.members).map((x: Member) => {
                                    if (x) {
                                        x.username = dbRes.rows.find(y => x?.id === y.id).username;
                                        x.discriminator = dbRes.rows.find(y => x?.id === y.id).discriminator;
                                    }
                                    return x;
                                }).sort((a: Member, b: Member) => (a.nickname ?? a.username) > (b.nickname ?? b.username) ? 1 : (a.nickname ?? a.username) < (b.nickname ?? b.username) ? -1 : 0));
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(403).send({ error: "You aren't in this guild." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
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
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x.id === res.locals.user)) {
                        database.query(`SELECT * FROM users`, async (err, dbRes) => {
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
                        res.status(403).send({ error: "You aren't in this guild." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (JSON.parse(guild.members).find((x: Member) => x.id == res.locals.user)) {
=======
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (JSON.parse(guild.members).find((x: Member) => x.id === res.locals.user)) {
>>>>>>> f8e172d (asi ri ma na)
                        database.query(`SELECT * FROM users`, async (err, dbRes) => {
                            if (!err) {
                                        res.send(JSON.parse(guild.members).map((x: Member) => {
                                            if (x) {
                                                x.username = dbRes.rows.find(y => x?.id === y.id).username;
                                                x.discriminator = dbRes.rows.find(y => x?.id === y.id).discriminator;
                                            }
                                            return x;
                                        }).sort((a: Member, b: Member) => (a.nickname ?? a.username) > (b.nickname ?? b.username) ? 1 : (a.nickname ?? a.username) < (b.nickname ?? b.username) ? -1 : 0));
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(403).send({ error: "You aren't in this guild." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
<<<<<<< HEAD
            res.status(404).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
            res.status(400).send({ error: "Something is missing." });
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
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (JSON.parse(guild.members).find((x: Member) => x.id === res.locals.user)) {
                        database.query(`SELECT * FROM users`, async (err, dbRes) => {
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
                        res.status(403).send({ error: "You aren't in this guild." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
>>>>>>> 51556ba (Some changes)
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
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (JSON.parse(guild.members).find((x: Member) => x.id === res.locals.user)) {
                        database.query(`SELECT * FROM users`, async (err, dbRes) => {
                            if (!err) {
                                res.send(JSON.parse(guild.members).filter((x: Member) => x?.id === userId).map((x: Member) => {
                                    x.username = dbRes.rows.find(x => x.id === userId).username;
                                    x.discriminator = dbRes.rows.find(x => x.id === userId).discriminator;
                                    return x;
                                })[0]);
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(403).send({ error: "You aren't in this guild" });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
=======
                    const guild = dbRes.rows.find(x => x?.id === guildId);
>>>>>>> f8e172d (asi ri ma na)
                    if (JSON.parse(guild.members).find((x: Member) => x.id === res.locals.user)) {
                        database.query(`SELECT * FROM users`, async (err, dbRes) => {
                                    if (!err) {
                                        res.send(JSON.parse(guild.members).filter((x: Member) => x?.id === userId).map((x: Member) => {
                                            x.username = dbRes.rows.find(x => x.id === userId).username;
                                            x.discriminator = dbRes.rows.find(x => x.id === userId).discriminator;
                                            return x;
                                        })[0]);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                        });
                    } else {
                        res.status(403).send({ error: "You aren't in this guild" });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
<<<<<<< HEAD
            res.status(404).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
            res.status(400).send({ error: "Something is missing." });
>>>>>>> 51556ba (Some changes)
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
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000200) === 0x0000000200)) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname === null) {
                                const members = JSON.parse(guild.members);
                                const user = members.find((x: Member) => x?.id === res.locals.user);
                                user.nickname = req.body.nickname ? req.body.nickname : null;
                                members[members.findIndex((x: Member) => x?.id === res.locals.user)] = user;
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
=======
                    const guild = dbRes.rows.find(x => x?.id === guildId);
>>>>>>> f8e172d (asi ri ma na)
                    if (guild) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000200) === 0x0000000200)) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname === null) {
                                const members = JSON.parse(guild.members);
                                const user = members.find((x: Member) => x?.id === res.locals.user);
                                user.nickname = req.body.nickname ? req.body.nickname : null;
<<<<<<< HEAD
                                members[members.findIndex((x: Member) => x?.id == res.locals.user)] = user;
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                members[members.findIndex((x: Member) => x?.id === res.locals.user)] = user;
>>>>>>> f8e172d (asi ri ma na)
                                database.query(`UPDATE guilds SET members = $1 WHERE id = $2`, [JSON.stringify(members), guildId], (err, dbRes) => {
                                    if (!err) {
                                        members.forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'memberEdited', member: user }));
                                            });
                                        });
<<<<<<< HEAD
<<<<<<< HEAD
                                        res.send(user);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(400).send({ error: "Something is missing." });
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

    app.delete('/guilds/*/members/@me', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
<<<<<<< HEAD
                    if (guild) {
                        const members = JSON.parse(guild.members);
                        if (!members.find((x: Member) => x?.id === res.locals.user)?.roles.includes('0')) {
                            delete members[members.findIndex((x: Member) => x?.id === res.locals.user)];
                            database.query(`UPDATE guilds SET members = $1 WHERE id = $2`, [JSON.stringify(members), guildId], (err, dbRes) => {
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
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
                                        res.status(200).send(user);
=======
                                        res.send(user);
>>>>>>> 51556ba (Some changes)
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(400).send({ error: "Something is missing." });
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
<<<<<<< HEAD
            res.status(404).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
            res.status(400).send({ error: "Something is missing." });
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
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
=======
>>>>>>> f8e172d (asi ri ma na)
                    if (guild) {
                        const members = JSON.parse(guild.members);
                        if(!members.find((x: Member) => x?.id === res.locals.user)?.roles.includes('0')) {
                                delete members[members.findIndex((x: Member) => x?.id === res.locals.user)];
                                database.query(`UPDATE guilds SET members = $1 WHERE id = $2`, [JSON.stringify(members), guildId], (err, dbRes) => {
                                    if (!err) {
                                        const parsedGuild = Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? JSON.parse(guild[x]) : x === 'members' ? Object.keys(JSON.parse(guild[x])).length : guild[x])[index] }), {});
                                            websockets.get(res.locals.user)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'guildLeft', guild: parsedGuild }));
                                            });
                                        res.send(parsedGuild);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(403).send({ error: "You own this guild." });
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
>>>>>>> 51556ba (Some changes)
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
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000400) === 0x0000000400)) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname === null) {
                                const members = JSON.parse(guild.members);
                                const user = members.find((x: Member) => x?.id === userId);
                                user.nickname = req.body.nickname ? req.body.nickname : null;
                                members[members.findIndex((x: Member) => x?.id === userId)] = user;
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
=======
                    const guild = dbRes.rows.find(x => x?.id === guildId);
>>>>>>> f8e172d (asi ri ma na)
                    if (guild) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000400) === 0x0000000400)) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname === null) {
                                const members = JSON.parse(guild.members);
                                const user = members.find((x: Member) => x?.id === userId);
                                user.nickname = req.body.nickname ? req.body.nickname : null;
<<<<<<< HEAD
                                members[members.findIndex((x: Member) => x?.id == userId)] = user;
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                members[members.findIndex((x: Member) => x?.id === userId)] = user;
>>>>>>> f8e172d (asi ri ma na)
                                database.query(`UPDATE guilds SET members = $1 WHERE id = $2`, [JSON.stringify(members), guildId], (err, dbRes) => {
                                    if (!err) {
                                        members.forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'memberEdited', member: user }));
                                            });
                                        });
<<<<<<< HEAD
<<<<<<< HEAD
                                        res.send(user);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(400).send({ error: "Something is missing." });
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
=======
                                        res.status(200).send(user);
=======
                                        res.send(user);
>>>>>>> 51556ba (Some changes)
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(400).send({ error: "Something is missing." });
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
<<<<<<< HEAD
            res.status(404).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
            res.status(400).send({ error: "Something is missing." });
>>>>>>> 51556ba (Some changes)
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
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        if ((!req.body.ban && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000002) === 0x0000000002)) || (req.body.ban && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000004) === 0x0000000004))) {
                            const members = JSON.parse(guild.members);
                            const user = members.find((x: Member) => x?.id === userId);
                            delete members[members.findIndex((x: Member) => x?.id === userId)];
                            let bans = JSON.parse(guild.bans);
                            if (req.body.ban) {
                                bans.push(userId);
                            }
                            database.query(`UPDATE guilds SET members = $1, bans = $2 WHERE id = $3`, [JSON.stringify(members), JSON.stringify(bans), guildId], (err, dbRes) => {
                                if (!err) {
                                    websockets.get(userId)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'guildLeft', guild: guildId }));
                                    });
                                    if (req.body.ban) {
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
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "SOmething is missing." });
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
=======
                    const guild = dbRes.rows.find(x => x?.id === guildId);
>>>>>>> f8e172d (asi ri ma na)
                    if (guild) {
                        if ((!req.body.ban && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000002) === 0x0000000002)) || (req.body.ban && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000004) === 0x0000000004))) {
                            const members = JSON.parse(guild.members);
                                const user = members.find((x: Member) => x?.id === userId);
                                delete members[members.findIndex((x: Member) => x?.id === userId)];
                                let bans = JSON.parse(guild.bans);
                                if (req.body.ban) {
                                    bans.push(userId);
                                }
                                database.query(`UPDATE guilds SET members = $1, bans = $2 WHERE id = $3`, [JSON.stringify(members), JSON.stringify(bans), guildId], (err, dbRes) => {
                                    if (!err) {
                                        members.forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'member' + (req.body.ban ? 'Banned' : 'Kicked'), member: user }));
                                            });
                                        });
                                        res.send(user);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
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
<<<<<<< HEAD
            res.status(404).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
            res.status(400).send({ error: "SOmething is missing." });
>>>>>>> 51556ba (Some changes)
        }
    });

};