import { Member, Role } from '../interfaces';
import express from "express";
import cassandra from 'cassandra-driver';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client) => {

    app.get('/guilds/*/members', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                            
                                const members = guild.members;

                                res.send(members.filter((x: Member) => x).map((x: Member) => {
                                    x.username = dbRes.rows.find(y => x?.id?.toString() === y.id.toString())?.username ?? 'Deleted User';
                                    x.discriminator = dbRes.rows.find(y => x?.id?.toString() === y.id.toString())?.discriminator ?? '0000';
                                    x.avatar = dbRes.rows.find(y => x?.id?.toString() === y.id.toString())?.avatar ?? 'userDefault';
                                    x.about = dbRes.rows.find(y => x?.id?.toString() === y.id.toString())?.about;
                                    if (!dbRes.rows.find(y => x?.id?.toString() === y.id.toString())) {
                                        x.nickname = undefined;
                                    }
                                    return x;
                                }).filter((x: Member) => x).sort((a: Member, b: Member) => (a.nickname ?? a.username) > (b.nickname ?? b.username) ? 1 : (a.nickname ?? a.username) < (b.nickname ?? b.username) ? -1 : 0));
                            
                        });
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.get('/guilds/*/members/@me', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                            
                                res.send(guild.members.filter((x: Member) => x?.id?.toString() === res.locals.user).map((x: Member) => {
                                    x.username = dbRes.rows.find(x => x?.id?.toString() === res.locals.user)?.username ?? 'Deleted User';
                                    x.discriminator = dbRes.rows.find(x => x?.id?.toString() === res.locals.user)?.discriminator ?? '0000';
                                    x.avatar =  dbRes.rows.find(y => x?.id?.toString() === res.locals.user)?.avatar ?? 'userDefault';
                                    x.about = dbRes.rows.find(y => x?.id?.toString() === y.id.toString())?.about;
                                    if (!dbRes.rows.find(x => x?.id?.toString() === res.locals.user)) {
                                        x.nickname = undefined;
                                    }
                                    return x;
                                })[0]);
                            
                        });
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.get('/guilds/*/members/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        if (guildId && userId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const members = guild.members;
                        if (members.filter((x: Member) => x?.id?.toString() === userId)) {
                            database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                
                                    res.send(members.filter((x: Member) => x?.id?.toString() === userId).map((x: Member) => {
                                        x.username = dbRes.rows.find(x => x?.id?.toString() === userId)?.username ?? 'Deleted User';
                                        x.discriminator = dbRes.rows.find(x => x?.id?.toString() === userId)?.discriminator ?? '0000';
                                        x.avatar =  dbRes.rows.find(y => x?.id?.toString() === userId)?.avatar ?? 'userDefault';
                                        x.about = dbRes.rows.find(y => x?.id?.toString() === y.id.toString())?.about;
                                        if (!dbRes.rows.find(y => x?.id?.toString() === userId)) {
                                            x.nickname = undefined;
                                        }
                                        return x;
                                    })[0]);
                                
                            });
                        } else {
                            res.status(404).send({ error: "Not found" });
                        }
                    } else {
                        res.status(403).send({ error: "Missing permission" });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/guilds/*/members/@me', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: string) => ((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000200) === 0x0000000200)) {
                        if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname === null) {
                            const members = guild.members;
                            const user = members.find((x: Member) => x?.id?.toString() === res.locals.user);
                            user.nickname = req.body.nickname ? req.body.nickname : null;
                            members[members.findIndex((x: Member) => x?.id?.toString() === res.locals.user)] = user;
                            database.execute('UPDATE guilds SET members = ? WHERE id = ?', [members, guildId], { prepare: true }).then(() => {
                                
                                    websockets.get(user.id.toString())?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'memberEdited', guild: guildId, member: user }));
                                    });
                                    res.send(user);
                                
                            });
                        } else {
                            res.status(400).send({ error: "Something is missing or it's not appropiate." });
                        }
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/guilds/*/members/@me', (req: express.Request, res: express.Response) => {
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
                        if (!members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes('0000000-0000-0000-0000-000000000000')) {
                            members.splice(members.findIndex((x: Member) => x?.id?.toString() === res.locals.user), 1);
                            database.execute('UPDATE guilds SET members = ? WHERE id = ?', [members, guildId], { prepare: true }).then(() => {
                                
                                    websockets.get(res.locals.user)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'guildLeft', guild: guildId }));
                                    });
                                    res.send({});
                                
                            });
                        } else {
                            res.status(403).send({ error: "You own this guild." });
                        }
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.post('/guilds/*/members/*/roles/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        const roleId = urlParams[2];
        if (guildId && userId && roleId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const members = guild.members;
                        const user = members.find((x: Member) => x?.id?.toString() === userId);
                        const roles = (guild.roles ?? []);
                        const role = roles.find((x: Role) => x.id.toString() === roleId);
                        if(role) {
                        if ((roles.findIndex((role: Role) => members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes(role.id)) < roles.findIndex((x: Role) => x.id.toString() === roleId)) && (res.locals.user === userId || roles.findIndex((role: Role) => members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes(role.id)) < roles.findIndex((role: Role) => user?.roles.includes(role.id))) && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000800) === 0x0000000800)) {
                                user.roles.push(roleId);
                                members[members.findIndex((x: Member) => x?.id?.toString() === userId)] = user;
                                database.execute('UPDATE guilds SET members = ? WHERE id = ?', [members, guildId], { prepare: true }).then(() => {
                                    
                                        res.send(user);
                                    
                                });
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(404).send({ error: "Mot found." });
                    }
                } else {
                    res.status(403).send({ error: "Missing permission." });
                }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/guilds/*/members/*/roles/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        const roleId = urlParams[2];
        if (guildId && userId && roleId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const members = guild.members;
                        const user = members.find((x: Member) => x?.id?.toString() === userId);
                        const roles = (guild.roles ?? []);
                        if(user.roles.find((x: string) => x === roleId)) {
                            if ((roles.findIndex((role: Role) => members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes(role.id)) < roles.findIndex((x: Role) => x.id.toString() === roleId)) && (res.locals.user === userId || roles.findIndex((role: Role) => members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes(role.id)) < roles.findIndex((role: Role) => user?.roles.includes(role.id))) && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000800) === 0x0000000800)) {
                                user.roles.splice(user.roles.findIndex((x: Role) => x.id.toString() === roleId), 1);
                                members[members.findIndex((x: Member) => x?.id?.toString() === userId)] = user;
                                database.execute('UPDATE guilds SET members = ? WHERE id = ?', [members, guildId], { prepare: true }).then(() => {
                                    
                                        res.send(user);
                                    
                                });
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(404).send({ error: "Mot found." });
                    }
                } else {
                    res.status(403).send({ error: "Missing permission." });
                }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/guilds/*/members/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        if (guildId && userId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const members = guild.members;
                        const user = members.find((x: Member) => x?.id?.toString() === userId);
                        if ((guild.roles ?? []).findIndex((role: Role) => members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes(role.id)) < (guild.roles ?? []).findIndex((role: Role) => user?.roles.includes(role.id)) && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => ((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000400) === 0x0000000400)) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname === null) {
                                user.nickname = req.body.nickname ? req.body.nickname : null;
                                members[members.findIndex((x: Member) => x?.id?.toString() === userId)] = user;
                                database.execute('UPDATE guilds SET members = ? WHERE id = ?', [members, guildId], { prepare: true }).then(() => {
                                    
                                        res.send(user);
                                    
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
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/guilds/*/members/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        if (guildId && userId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const members = guild.members;
                        const user = members.find((x: Member) => x?.id?.toString() === userId);
                        if (user) {
                            if ((guild.roles ?? []).findIndex((role: Role) => members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes(role.id)) < (guild.roles ?? []).findIndex((role: Role) => user?.roles.includes(role.id)) && (!req.headers.ban && members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: string) => ((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000002) === 0x0000000002)) || (req.headers.ban && members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: string) => ((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000004) === 0x0000000004))) {
                                members.splice(members.findIndex((x: Member) => x?.id?.toString() === userId), 1);
                                let bans = guild.bans ?? [];
                                if (req.headers.ban) {
                                    bans.push(userId);
                                }
                                database.execute('UPDATE guilds SET members = ?, bans = ? WHERE id = ?', [members, bans, guildId], { prepare: true }).then(() => {
                                    
                                        websockets.get(userId.toString())?.forEach(websocket => {
                                            websocket.send(JSON.stringify({ event: 'guildLeft', guild: guildId }));
                                        });
                                        if (req.headers.ban) {
                                            members.filter((member: Member) => members.find((x: Member) => x?.id?.toString() === member.id)?.roles.find((x: string) => ((guild.roles ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000004) === 0x0000000004)).forEach((member: Member) => {
                                                websockets.get(member.id.toString())?.forEach(websocket => {
                                                    websocket.send(JSON.stringify({ event: 'memberBanned', guild: guildId, member: user }));
                                                });
                                            });
                                        }
                                        res.send(user);
                                    
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